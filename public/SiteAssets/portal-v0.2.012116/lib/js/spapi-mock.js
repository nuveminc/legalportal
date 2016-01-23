
;(function(){
/*********************************************/
/* spapi-mock/spapi.private.functions.js     */
/*********************************************/

    var models = {},

    /**
     * @description: set the currentModel to the passed in model
     * this throws as it expects a model object
     * TODO(mpace):
     * cached models contain data and can be reused
     * by other models and their views?
     */
    initModel = function (model) {
        if (typeof model === 'undefined')
            throw 'object parameter expected';

        models[model.name] = model;
    },

    /**
     * @description
     * converts the SharePoint list item into POJO (plain old javascript object) using REST
     * @param {object} model definition
     * @param {object} item to convert to POJO
     * @returns {object} a new object created from the defined SP object/model
     */
    convertItem = function (item, model) {
        var newItem = {};
        // loop through fields to map the values into POJO
        for (var i = 0; i < model.fields.length; i++) {
            // get the field object
            var field = model.fields[i],
                value = null;
            // need to handle different return objects from Data.svc
            if (model.type === 'dataSvc' && !isUndefined(item[field.dataSvc])) {
                value = item[field.dataSvc];
                newItem[field.name] = value;
            }
            else {
                // do we have a property on our data object
                if (!isUndefined(item[field.spField])) {
                    // set the inital value
                    value = item[field.spField]
                    // we can convert the value data with the filter property
                    if (!isUndefined(field.filter)) {
                        if (value !== null) {
                            // HACK: implemented because Goalie Team misused filter
                            // TODO: remove this conditional check - shouldn't do this anyway ... only functions allowed here.
                            if (typeof field.filter === 'string') {
                                value = field.filter;
                            } else if (typeof field.filter === 'function') {
                                value = field.filter(value);
                            }
                        }
                    }
                    if (field.type && field.type === 'lookup') {
                        // we have a lookup
                        if (field.model) {
                            var lookupData = {};
                            // attempt to get the model used for the lookup so we can get the related object
                            if (model.lookupData) {
                                // lookup data should have been loaded prior
                                lookupData = model.lookupData[field.model.name];
                            } else {
                                // attempt to get the data from the cached model
                                lookupData = models[field.model.name].data;
                            }
                            if (lookupData) {
                                var lookupItem = lookupData.filter(function (item) { return item.id === value; })[0];
                                if (!isUndefined(lookupItem)) {
                                    if (field.columnValue) {
                                        // optionally just get the column value 
                                        value = lookupItem[field.columnValue];
                                    } else {
                                        // get the whole object - attach as child
                                        value = lookupItem;
                                    }
                                }
                            } else {
                                console.log('lookup model data not found for: %s', field.model.name);
                            }
                        } else {
                            console.warn('the model and columnValue properties are not defined for the field type "lookup". Only id\'s are available on %s.%s', model.name, field.spField);
                        }
                    } else if (field.type && field.type === 'multilookup') {
                        // multilookup values are stored in 'results' array
                        try {
                            value = item[field.spField].results;
                        } catch (e) {
                            throw new Error('{0}.{1} is not a multi-lookup value'.format(model.name, field.spField));
                        }
                    } else if (field.type && field.type === '__deferred') {
                        value = item[field.spField].__deferred.uri;
                    } else if (field.type && field.type === 'json') {
                        if(item[field.spField]){
                            value = JSON.parse(item[field.spField]);
                        }
                    }
                }
            }
            newItem[field.name] = value;
        }

        return newItem;
    },	

    /**
     * @description
     * get list success event handler using REST
     * @param {array} of items from SP api
     * @param {object} model definition
     */
    successDataHandler = function (items, model, deferred) {
        if(!models[model.name]) {
            models[model.name] = model;
        }

        models[model.name].data = [];
        
        // REST API returns .results & Data.svc does not
        items = (items.results) ? items.results : items;
        try {
            if (items.length > 0 && items.length == 1) {
                // TODO: make this return only one item rather than array
                models[model.name].data.push(convertItem(items[0], model));
            } else {
                for (var i = 0; i < items.length; i++) {
                    var item = convertItem(items[i], model);
                    models[model.name].data.push(item);
                }
            }
        } catch (ex) {
            var err = new Event('SPAPI.successDataHandler fetch failed', model, 'ErrorMsg: unable to parse fields', 'Status:Error', 'Error');
            console.log('successDataHandler fetch failed: %o', err);
            deferred.reject(err);
        }

        deferred.resolve(models[model.name].data);
    };

/********************************/
/* spapi-mock/spapi.odata.js */
/********************************/

/**
 * @description
 *  OData filter object which allows for complex OData queries using
 *  javascript chaining syntax. This object implements the operators defined in the
 *  SharePoint OData spec: http://msdn.microsoft.com/en-us/library/office/fp142385(v=office.15).aspx#sectionSection0
 *  TODO: string comparisons have not been implemented (don't have an immediate need for this feature)
 *  Usage: a couple of requirements when using this object.
 *      - create a new object
 *          var odf = new ODataFilter;
 *      - all comparison (filter) queries must begin with the 'where' clause unless it's a different selector (e.g. orderby, select, top, etc.)
 *          odf.where([column name]).[eq|neq|lt|le|gt|ge]([value]).[and|or]([value]);
 *      - the 'where' clause can only be used once to begin a query
 *      - can also use just a selector
 *          odf.[top|orderBy|select|expand]([value]);
 *      - selectors can be used both to begin (above) and end a query
 *          odf.where('Team').eq('eCP').top(10).orderBy('Id').desc();
 *          to retrive the query string use odf.getQuery();
 */
function ODataFilter() {
    var self = this,
    // error message
        ERR_VALUE_REQUIRED = 'value required for \'{0}\' clause',
    // declare clause types - didn't include string comparisons
        clauseTypes = ['eq', 'neq', 'lt', 'le', 'gt', 'ge', 'and', 'or', 'orderBy', 'datetime', 'top', 'skip', 'select', 'expand'],
    // clause functions called to generate filter string
        clauseFns = {},
    // array of clauses created by user
        clauses = [],
    // could clean these fn's up by allowing recursion rather than using new fn's
    // ascending/descending clause function
        ascDescFn = function (t) {
            return function () {
                if (!t) throw new Error(ERR_VALUE_REQUIRED.format(ct));
                var opts = {
                    top: clauseFn('top'),
                    skip: clauseFn('skip')
                };
                clauses.push({ condition: 'dir', value: t });
                return opts;
            }
        },
    // orderby clause function
        orderByFn = function (ct) {
            return function (value) {
                if (!value) throw new Error(ERR_VALUE_REQUIRED.format(ct));
                var dir = {
                    asc: ascDescFn('asc'),
                    desc: ascDescFn('desc'),
                };
                clauses.push({ condition: ct, value: value });
                return dir;
            }
        },
    // generic function for all other clauses
        clauseFn = function (ct) {
            return function (value) {
                if (!value && ct !== 'datetime') throw new Error(ERR_VALUE_REQUIRED.format(ct));
                clauses.push({ condition: ct, value: value });
                return clauseFns;
            }
        };
    // expose these as root level clauses
    self.top = clauseFn('top');
    self.skip = clauseFn('skip');
    self.select = clauseFn('select');
    self.expand = clauseFn('expand');
    self.orderBy = orderByFn('orderBy');
    // where is a special case and is only used once in a filter
    self.where = clauseFn('where');

    // generates the query by evaluating the clauses and their values
    self.getQuery = function () {
        var filter = '', dtPrefix = '';
        var query = '?', concat = '&';
        for (var i = 0; i < clauses.length; i++) {
            var clause = clauses[i];
            switch (clause.condition) {
                case 'where':
                    var n = (clauses.length > 1 && i > 0) ? concat : query;
                    if (clause.value !== '') {
                        filter += '{0}$filter={1}'.format(n, clause.value);
                    }
                    break;
                case 'and':
                case 'or':
                    filter += ' {0} {1}'.format(clause.condition, clause.value);
                    break;
                case 'dir':
                    filter += ' {0}'.format(clause.value);
                    break;
                case 'top':
                case 'skip':
                case 'select':
                case 'expand':
                case 'orderBy':
                    var n = (clauses.length > 1) ? concat : query;
                    filter += '{0}${1}={2}'.format(n, clause.condition, clause.value);
                    break;
                case 'datetime':
                    var dtPrefix = 'datetime';
                    break;
                default:
                    if (typeof clause.value === 'string') {
                        filter += ' {0} {1}\'{2}\''.format(clause.condition, dtPrefix, clause.value);
                        dtPrefix = '';
                    } else {
                        filter += ' {0} {1}'.format(clause.condition, clause.value);
                    }
                    break;
            }
        }
        return filter;
    };
    // initialize the filter API
    // generating available clauses
    for (var c = 0; c < clauseTypes.length; c++) {
        var clauseType = clauseTypes[c];
        if (clauseType === 'orderBy') {
            clauseFns[clauseType] = orderByFn(clauseType);
        } else {
            clauseFns[clauseType] = clauseFn(clauseType);
        }
    }
    clauseFns['getQuery'] = self.getQuery;
};


/********************************/
/* spapi-mock/spapi.list.js */
/********************************/

var list = (function(){

    function getItem (model) {
        var deferred = $.Deferred();
        var filter, url;
        console.log('get list items from: ', model.listName);
        if(model.filter){
            var start = model.filter.indexOf('\'') + 1;
            var end = model.filter.lastIndexOf('\'');
            filter = model.filter.slice(start, end);
        }
        console.log('filter: ', filter);
        if(filter){
            url = '/api/workgroups/' + filter
        } else{
            url = '/api/' + model.listName
        }
        var config = {
            url: url,
            method: 'GET'
        };
        $.ajax(config).done(function (data) {
            var item = convertItem(data[0], model);
            deferred.resolve(item);
        }).fail();
        return deferred;
    };

    function getItems (model) {
        var deferred = $.Deferred();
        initModel(model);
        console.log('get list items from: ', model.listName);
        var config = {
            url: '/api/' + model.listName,
            method: 'GET'
        };
        $.ajax(config).done(function (data) {            
            successDataHandler(data.d, model, deferred);
        }).fail();
        return deferred;
    };

    function saveItem (model){
        var deferred = $.Deferred();
        var hasId = false;
        console.log('save list item: %o', model.listName);
        console.log('data: %o', model.data);
        // validate data for $$hashKey or object
        model.fields.forEach(function(field){
            if(field.name === 'id') {
                hasId = true;
            }
            if(field.type && field.type === 'json' && typeof model.data[field.name] === 'object'){
                throw new Error('Error saving: property:{0} is not a string; string value required'.format(field.name));
            }
            if(model.data[field.name] && typeof model.data[field.name] === 'string' && model.data[field.name].indexOf('$$hashKey') > -1){
                throw new Error('Error saving: $$hashKey not allowed');
            }
            if(field.type && field.type === 'json' && model.data[field.name]){
                model.data[field.name] = JSON.parse(model.data[field.name]);
            }
        });
        if(hasId) {
            var config = {
                url: '/api/' + model.listName,
                method: 'POST',
                data: JSON.stringify(model.data),
                headers: {'Content-Type':'application/json'},
                dataType: 'json'
            };
            if(model.data.id > -1) {
                config.url += '/' + model.data.id;
                config.method = 'PUT';
            }
            $.ajax(config).done(function (data) {
               successDataHandler(data, model, deferred);
            }).fail();            
        } else {
                throw new Error('Error saving: field id not defined');            
        }
        return deferred;
    };

    return {
        getItem: getItem,
        getItems: getItems,
        saveItem: saveItem
    };

})();

/********************************/
/* spapi/spapi.field.js         */
/********************************/    

list.field = (function() {
    /**
     * gets the definition for the specified field in the specified list 
     * @param  {[type]} listName  the name of the list with the field
     * @param  {[type]} fieldName the name of the field
     * @return {[type]}           json object with field metadata
     */
    function getByName (listName, fieldName) { 
        var deferred = $.Deferred();        
        var url = '/api/{0}.{1}'.format(listName, fieldName);
        var config = {
            url: url,
            method: 'GET'
        };
        $.ajax(config).done(function (data) {
            deferred.resolve(data);
        }).fail();
        return deferred.promise();  
    };

    /**
     * NOT SUPPORED IN MOCK API - CALLS 'getByName'
     * @param  {[type]} listName  [description]
     * @param  {[type]} fieldName [description]
     * @return {[type]}           [description]
     */
    function getByType (listName, fieldName) {
        return self.list.getByName();       
    };

    return {
        getByName: getByName,
        getByType: getByName
    };    
})();

/********************************/
/* spapi-mock/spapi.library.js  */
/********************************/
var library = (function(){
    /**
     * @description get documents
     **/
    function getFiles (model, expand) {
        var deferred = $.Deferred();
        $.ajax({
            method: 'GET',
            url: '/api/' + model.listName
        }).done(function (data) {
            successDataHandler(data.d, model, deferred);
        }).fail(function () {
            deferred.reject('not found');
        });
        return deferred.promise();
    };

    //function uploadItem (siteUrl, file, libraryName, model, folderName) {
    //    var deferred = $.Deferred();
    //    setTimeout(function() {
    //        deferred.resolve({});
    //    }, 10);
    //    return deferred.promise();
    //};
    //
    //function updateItem  (model) {
    //    var deferred = $.Deferred();
    //    setTimeout(function() {
    //        deferred.resolve({});
    //    }, 10);
    //    return deferred.promise();
    //};
    //
    //function getFileInfo (model, expand) {
    //    var deferred = $.Deferred();
    //    setTimeout(function() {
    //        deferred.resolve({});
    //    }, 10);
    //    return deferred.promise();
    //};

    function getItem (model) {
        var deferred = $.Deferred();
        $.ajax({
            method: 'GET',
            url: '/api/' + model.listName + '/' + model.data.id
        }).done(function (document) {
            deferred.resolve(document);
        }).fail(function () {
            deferred.reject('not found');
        });
        return deferred.promise();
    };

    function getFileInfo(model, expand){
        return getItem(model);
    };

    return {
        getFiles: getFiles,
        getItem: getItem,
        getFileInfo: getFileInfo
        //uploadItem: uploadItem,
        //updateItem: updateItem,
    };
})();

/***********************************/
/* spapi-mock/spapi.discussions.js */
/***********************************/

var discussions = (function(){

	var prefix = 'Discussions.{0}';
	function getDiscussions (listName, expand) {
		var deferred = $.Deferred(),
			config = {
				method: 'GET',
				url: '/api/' + prefix.format(listName)				
			};
		$.ajax(config).done(function (data) {
			var posts = [];
			var arrayIndex = Object.keys(data).length - 1;
			var items = data[arrayIndex]._Child_Items_;
	        items.forEach(function (d) {
                // TODO: extract model conversion (used when creating posts as well)
	            var discussionId = d.ID;
	            var uiPost = {};
	            uiPost.id = d.ID;
	            uiPost.dateCreated = d.Created;
	            uiPost.subject = d.Title;
	            uiPost.body = d.Body;
	            uiPost.parentFolderID = d.ParentFolderID;  // undefined
	            uiPost.parentItemID = d.ParentItemID;  // null
	            uiPost.author = d.Author.LookupId;

	            posts.push(uiPost);
	            // uiPost.author = ( id: d.Author.LookupId, value: d.Author.LookupValue };
	            // uiPost.board = {
		           //  listName: listName,
		           //  title: discussionBoards[discussionBoardName]           
	            // };

	            // self.getReplies(uiPost.board.listName, uiPost.id).done(function (replies) {
	            //     uiPost.replies = replies;
	            //     $timeout(function () {
	            //         self.cache['allDiscussionPosts'].push(uiPost);
	            //     });
	            // });
	        });
			deferred.resolve(posts);
		}).fail(function () {
			deferred.reject('not found');
		});
		return deferred.promise();
	};

	function createDiscussion (model, expand) {
		var deferred = $.Deferred();
		setTimeout(function() {
			deferred.resolve({});
		}, 10);
		return deferred.promise();
	};

	function getMessages (model, expand) {
		var deferred = $.Deferred();
		setTimeout(function() {
			deferred.resolve({});
		}, 10);
		return deferred.promise();
	};

	function createMessage (model, expand) {
		var deferred = $.Deferred();
		setTimeout(function() {
			deferred.resolve({});
		}, 10);
		return deferred.promise();
	};

	return {
		getDiscussions: getDiscussions,
		createDiscussion: createDiscussion,
		getMessages: getMessages,
		createMessage: createMessage
	};
})();
/********************************/
/* spapi-mock/spapi.workgroup.js */
/********************************/

var workgroup = (function(){

    function getPage (model) {
        var deferred = $.Deferred();
        console.log('get list items from: ', model.listName);
        var config = {
            url: '/api/workgroups/' + model.listName,
            method: 'GET'
        };
        $.ajax(config).done(function (data) {
            successDataHandler(data, model, deferred);
        }).fail();
        return deferred;
    };

    function savePage (model) {
        // comment
        return list.saveItem(model);
    };

    return {
        getPage: getPage,
        savePage: savePage
    };
})();

/********************************/
/* spapi-mock/spapi.search.js */
/********************************/
var search = (function(){

    function query (keywords) {
        var deferred = $.Deferred();
        if(!keywords){ throw new Error('keywords required for search'); }
        var data = {
                "request": {
                "Querytext": keywords,
                "EnableInterleaving": true,
                "StartRow": 0,
                "RowLimit": 20,
                "EnableStemming": false,
                "TrimDuplicates": false,
                "Timeout": 6000,
                "EnableNicknames": false,
                "EnablePhonetic": false,
                "EnableFQL": false,
                "HitHighlightedProperties": { "results": ["Title"] },
                "BypassResultTypes": false,
                "EnableQueryRules": false,
                "ProcessBestBets": false,
                "ClientType": "custom",
                "DesiredSnippetLength": 100,
                "MaxSnippetLength": 100,
                "SummaryLength": 150
              }
            };
        var config = {
            url: 'api/search/postquery',
            method: 'POST',
            data: JSON.stringify(data),
            headers: {'Content-Type':'application/json'},
            dataType: 'json'
        };

        $.ajax(config).done(function (data) {
            deferred.resolve(data);
        }).fail();

        return deferred.promise();
    };

    return {
        query: query
    };
})();
/********************************/
/* spapi-mock/spapi.taxonomy.js */
/********************************/
var taxonomy = (function(){

    function setMetadataField (model) {
        var deferred = $.Deferred();
        setTimeout(function() {
            deferred.resolve('Unimplemented');
        }, 10);
        return deferred.promise();
    };

    function getTermName (termSetName) {
        var deferred = $.Deferred();
        setTimeout(function() {
            deferred.resolve(termSetName);
        }, 10);
        return deferred.promise();
    };

    function addNewTerm (model) {
        var deferred = $.Deferred();
        setTimeout(function() {
            deferred.resolve('Unimplemented');
        }, 10);
        return deferred.promise();
    };

    function loadTaxonomy (termSets) {
        var deferred = $.Deferred();
        var promises = [];
        termSets.forEach(function(termSet){
             console.log('get taxonomy data: ', 'TaxTerms.' + termSets.name );
             var config = {
                url: '/api/TaxTerms.' + termSet.name,
                method: 'GET'
            };    
            promises.push($.ajax(config));       
        });

        $all(promises).done(function(terms){
            var index = 0, allTerms = {};
            terms.forEach(function(t){
                allTerms[termSets[index].name] = t;
                index++;
            });
            deferred.resolve(allTerms);     
        });      
        return deferred.promise();
    };


    return {
        setMetadataField: setMetadataField,
        getTermName: getTermName,
        addNewTerm: addNewTerm,
        loadTaxonomy: loadTaxonomy
    };
})();
/********************************/
/* spapi-mock/spapi.user.js */
/********************************/

var user = (function () {
    function getCurrentUser(userId){
        var deferred = $.Deferred();
        setTimeout(function() {
            deferred.resolve({
                Title: 'Pace, Mark',
                Email: 'mpace',
                LoginName: 'NV-SP2013\\mpace',
                IsSiteAdmin: true,
                Groups: [
                    { Title: 'Approvers', Description: 'Members of this group can edit and approve pages, list items, and documents.' },
                    { Title: 'Designers', Description: 'Members of this group can edit lists, document libraries, and pages in the site. Designers can create Master Pages and Page Layouts in the Master Page Gallery and can change the behavior and appearance of each site in the site collection by using master pages and CSS files.' },
                    { Title: 'Hierarchy Managers', Description: 'Members of this group can create sites, lists, list items, and documents.' },
                    { Title: 'Portal Owners', Description: 'se this group to grant people full control permissions to the SharePoint site: LAF' },
                ]
            });
        }, 10);
        return deferred.promise();
    };

    function getProfile(model) {
        var deferred = $.Deferred(),
            url = '/api/' + 'UserProfile',
            config = {
                url: url,
                method: 'GET'
            };
        $.ajax(config).done(function (data) {
            deferred.resolve(data);
        }).fail();
        return deferred.promise();
    };
    function getCurrent(model) {
        var deferred = $.Deferred(),
            url = '/api/' + 'UserProfile',
            config = {
                url: url,
                method: 'GET'
            };
        $.ajax(config).done(function (data) {
            successDataHandler(data, model, deferred);
        }).fail();
        return deferred.promise();
    };
    function getAllUsers(model) {
        var deferred = $.Deferred(),
            url = '/api/' + 'UserProfile',
            config = {
                url: url,
                method: 'GET'
            };
        $.ajax(config).done(function (data) {
            successDataHandler(data, model, deferred);
        }).fail();
        return deferred.promise();
    };
    function getByAccountName(model){
        var deferred = $.Deferred(),
            url = '/api/' + 'UserProfile',
            config = {
                url: url,
                method: 'GET'
            };
        $.ajax(config).done(function (data) {
            successDataHandler(data, model, deferred);
        }).fail();
        return deferred.promise();
    };

    return {
        getCurrentUser: getCurrentUser,
        getProfile: getProfile,
        getCurrent: getCurrent,
        getAllUsers: getAllUsers,
        getByAccountName: getByAccountName
    };
})();
/********************************/
/* spapi-mock/spapi.core.js */
/********************************/

/**
 * this is the main SPAPI function (class)
 */
SPAPI = function () {
    // returns public functions
    return {
        discussions: discussions,
        list: list,
        library: library,
        search: search,
        taxonomy: taxonomy,
        user: user,
        workgroup: workgroup,
        ODataFilter: ODataFilter
    }
};

window.SPAPI = SPAPI;

/* UTILITY FUNCTIONS - TODO: need to move to another library? */
function unimplemented() {
    throw Error('this function is not implemented');
};

/**
 * @description
 *  utility function to check undefined
 **/
window.isUndefined = window.isUndefined || function (value) {
    return (typeof value === 'undefined');
};

/** @descripton
 *  resolves all promises
 */
window.$all = function (promises) {
    var accumulator = [];
    var ready = $.Deferred().resolve(null);

    promises.forEach(function (promise) {
        ready = ready.then(function () {
            return promise;
        }).then(function (value) {
            accumulator.push(value);
        });
    });

    return ready.then(function () { return accumulator; });
};

/** 
 * @descripton
 *  a string formatting function to emulate the C#
 *  string.Format( <string>, args ) static method.
 */
String.prototype.format = function () {
    var args = arguments;
    return this.replace(/\{(\d+)\}/g, function (m, n) { return args[n]; });
};

})();
