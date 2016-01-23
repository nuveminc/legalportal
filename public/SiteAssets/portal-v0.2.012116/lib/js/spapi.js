
;(function(){
/********************************/
/* spapi/spapi.setup.js     */
/********************************/
/**
 * @descripton
 *  a string formatting function to emulate the C#
 *  string.Format( <string>, args ) static method.
 */
String.prototype.format = function () {
    var args = arguments;
    return this.replace(/\{(\d+)\}/g, function (m, n) { return args[n]; });
};

/** @descripton: a stripped down/simplified version of 'require'
 *  removes a dependency on the 'require' library - used to load
 *  jQuery library if not included - a SharePointAPI library dependancy
 * @param {string} the file (path) to load
 * @param {function} callback after file has loaded
 */
var require = window.require || function (file, callback) {
    var scripts = document.getElementsByTagName('script'),
        script = scripts[scripts.length - 1],
        newScript = document.createElement('script');
    newScript.type = 'text\/javascript';

    if (typeof newScript.onload !== 'undefined') {
        // others
        newScript.onload = function () {
            if (!isUndefined(callback))
                callback();
        };
    } else {
        // IE
        newScript.onreadystatechange = function () {
            if (newScript.readyState === 'loaded' || newScript.readyState === 'complete') {
                newScript.onreadystatechange = null;
                if (!isUndefined(callback))
                    callback();
            }
        };
    }
    newScript.src = file;
    script.parentNode.insertBefore(newScript, script);
};

    /********************************/
    /* spapi/spapi.constants.js     */
    /********************************/

    var self = this,
    // displays console.log mesages to assist with debugging
    DEBUG = true,

    LOG_EVENTS = false,

    // instance of SPWikiPage - used to manipulate wiki pages
    //PAGE = new SPWikiPage(),

    // cached MODELS - includes cached data
    MODELS = {},

    // cached list names and corresponding guids
    SITE_LISTS = [],

    // default handler called on event success is called by all CRUD events.
    // This handler can be overwritten using the 'model' configuration: 'model.successDataHandler'
    successHandler = function () { return 'default succcess handler not implemented'; },

    // handler called on event failure is called by all CRUD events
    // This handler can be overwritten using the 'model' configuration: 'model.failureDataHandler'
    failureHandler = function () { return 'default error handler not implemented'; },

    // sp end-points
    SPROOT = '{0}/_api',
    SPSITE = SPROOT + '/Site',
    SPWEB = SPROOT + '/Web',

    SPLIST = SPWEB + '/Lists',
    SPLIST_ITEMS = SPLIST + '/GetByTitle(\'{1}\')/Items',
    //spListItemUpdate = SPLIST + '/GetByTitle(\'{1}\')/Items({2})',
    //spListItemGet = SPLIST + '/GetByTitle(\'{1}\')/Items({2})',
    SPLIST_ITEM_BY_ID = SPLIST + '/GetByTitle(\'{1}\')/Items({2})',
    SPLIST_ITEM = SPLIST + '/GetByTitle(\'{1}\')/Items()',
    spListByGuid = SPLIST + '(\'{1}\')',
    // will return file information if used with a library
    SPLIST_ITEM_BY_LIST_DATA_SVC = '{0}/_vti_bin/ListData.svc/{1}({2})',
    // will return file information if used with a library
    SPLIST_ITEMS_BY_LIST_DATA_SVC = '{0}/_vti_bin/ListData.svc/{1}',

    // name of the choice property to get values from
    FILTER_CHOICE = '$filter=EntityPropertyName eq \'{0}\''

    ;
/***********************************/
/* spapi/spapi.private.objects.js  */
/***********************************/
// TODO: should remove these as 'classes'
    /**
     * generates HTTP headers for ajax calls
     * @param {string} verb which HTTP Action
     */
    HttpHeaders = function (action) {
        var headers = {
            'Accept': 'application/json; odata=verbose; charset=utf-8',
        };
        switch (action) {
            case 'GET':
                return headers;
            case 'MERGE':
                headers['Content-Type'] = 'application/json; charset=utf-8';
                headers['X-HTTP-Method'] = 'MERGE';
                headers['If-Match'] = '';
                return headers;
        }
    },

    /**
     * generates GET options for ajax call
     * @param {[type]} spUrl [description]
     */
    GETOptions = function (spUrl) {
        this.url = spUrl,
        this.type = 'GET',
        this.headers = new HttpHeaders('GET')
    },
    /**
     * generates POST options for ajax call
     * @param {gtring} spUrl sharepoint url
     * @param {object} model sp list data model
     */
    POSTOptions = function (spUrl,model) {
        this.url = spUrl,
        this.type = 'GET',
        this.headers = new HttpHeaders('GET')
    },
    /**
     * @description
     *  Status states that are associated with Event logging
     */
    EventStatus = {
        Message: 'Message',
        Warning: 'Warning',
        Error: 'Error',
        Critical: 'Critical'
    },
    /**
     *  Event model object used for logging events to list
     *  Event should be 'new'd since it represents an object instance
     *
     * @param {string} action is the operation - e.g. create, update, etc.
     * @param {object} model used when performing CRUD operation
     * @param {string} error message to log
     * @param {string} status of event. use EventStatus to log a particular status - or custom
     * @param {string} stack trace from exception if available
     */
    Event = function (action, model, errMsg, status, stackTrace) {
        this.action = action;
        this.siteUrl = model.siteUrl;
        this.listName = model.listName;
        this.itemGuid = function (model) {
            var guid = '';
            if (model.data) {
                Object.keys(model.data).forEach(function (k) {
                    if (k === 'GUID') {
                        guid = model.data[k];
                    }
                });
            } return guid;
        }(model);
        this.errMsg = errMsg;
        this.status = status;
        this.stackTrace = stackTrace;
    },

/********************************/
/* spapi/spapi.models.js        */
/********************************/
    /**
     * @description
     *  Web(site) model to enumerate web properties
     *  the fields are the return data from the call to the API
     */
    WebModel = function () {
        this.name = "Web Properties",
        this.fields = [
            { name: 'allowRssFeeds', spField: 'AllowRssFeeds' }
            , { name: 'appInstanceId', spField: 'AppInstanceId' }
            , { name: 'configuration', spField: 'Configuration' }
            , { name: 'created', spField: 'Created' }
            , { name: 'customMasterUrl', spField: 'CustomMasterUrl' }
            , { name: 'description', spField: 'Description' }
            , { name: 'documentLibraryCalloutOfficeWebAppPreviewersDisabled', spField: 'DocumentLibraryCalloutOfficeWebAppPreviewersDisabled' }
            , { name: 'enableMinimalDownload', spField: 'EnableMinimalDownload' }
            , { name: 'id', spField: 'Id' }
            , { name: 'language', spField: 'Language' }
            , { name: 'lastItemModifiedDate', spField: 'LastItemModifiedDate' }
            , { name: 'masterUrl', spField: 'MasterUrl' }
            , { name: 'quickLaunchEnabled', spField: 'QuickLaunchEnabled' }
            , { name: 'recycleBinEnabled', spField: 'RecycleBinEnabled' }
            , { name: 'serverRelativeUrl', spField: 'ServerRelativeUrl' }
            , { name: 'syndicationEnabled', spField: 'SyndicationEnabled' }
            , { name: 'title', spField: 'Title' }
            , { name: 'treeViewEnabled', spField: 'TreeViewEnabled' }
            , { name: 'uiVersion', spField: 'UIVersion' }
            , { name: 'uiVersionConfigurationEnabled', spField: 'UIVersionConfigurationEnabled' }
            , { name: 'url', spField: 'Url' }
            , { name: 'webTemplate', spField: 'WebTemplate' }
        ]
    },
    /**
     * @description
     *  document model represents an uploaded document
     *  the fields are the return data from the call to the API
     */
    DocumentModel = function (doc) {
        this.name = doc.Name || '',
        this.listName = doc.ServerRelativeUrl || '',
        this.fields = [
            { name: 'authorUrl', spField: 'Author', type: '__deferred' }
            , { name: 'checkInComment', spField: 'CheckInComment' }
            , { name: 'checkOutType', spField: 'CheckOutType' }
            , { name: 'contentTag', spField: 'ContentTag' }
            , { name: 'customizedPageStatus', spField: 'CustomizedPageStatus' }
            , { name: 'eTag', spField: 'ETag' }
            , { name: 'exists', spField: 'Exists' }
            , { name: 'length', spField: 'Length' }
            , { name: 'level', spField: 'Level' }
            , { name: 'listItemAllFieldsUrl', spField: 'ListItemAllFields', type: '__deferred' }
            , { name: 'lockedByUserUrl', spField: 'LockedByUser', type: '__deferred' }
            , { name: 'majorVersion', spField: 'MajorVersion' }
            , { name: 'minorVersion', spField: 'MinorVersion' }
            , { name: 'modifiedByUrl', spField: 'ModifiedBy', type: '__deferred' }
            , { name: 'name', spField: 'Name' }
            , { name: 'serverRelativeUrl', spField: 'ServerRelativeUrl' }
            , { name: 'timeCreated', spField: 'TimeCreated' }
            , { name: 'lastModified', spField: 'TimeLastModified' }
            , { name: 'title', spField: 'Title' }
            , { name: 'versionsUrl', spField: 'Versions', type: '__deferred' }]
    },

    /**
     * @description
     *  Wiki Page model represents a wiki page
     *  the fields are the return data from the call to the API
     */
    WikiPageModel = function () {
        this.name = 'Wiki',
        this.listName = 'SitePages',
        this.fields = [
            { name: 'id', spField: 'ID' }
            , { name: 'title', spField: 'Title' }
            , { name: 'created', spField: 'Created' }
            , { name: 'authorId', spField: 'AuthorId' }
            , { name: 'editorId', spField: 'EditorId' }
            , { name: 'checkoutUserId', spField: 'CheckoutUserId' }
            , { name: 'guid', spField: 'GUID' }
            , { name: 'wikiField', spField: 'WikiField' }
            , { name: 'oDataVersion', spField: 'OData__UIVersionString' }
            , { name: 'oDataCopySource', spField: 'OData__CopySource' }
            , { name: 'contentTypeId', spField: 'ContentTypeId' }
            , { name: 'fileSystemObjectType', spField: 'FileSystemObjectType' }
        ]
    },
/********************************/
/* spapi/spapi.odata.js         */
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
    ODataFilter = function () {
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
    },
/*************************************/
/* spapi/spapi.private.functions.js  */
/*************************************/

    /**
     * @description
     *  event logger - saves event info to list
     *  TODO: need to check first for list and create if it doesn't exist
     */
    //logEvent = function (ex) {
    //    console.log('logging event');
    //    // TODO: cache username to use here
    //    //ex.userName = self.userName;
    //    var exModel = new EventModel(ex),
    //        deferred = $.Deferred();
    //    saveListItem(exModel, deferred).done(function () {
    //        console.log('logged event: %o', exModel);
    //    }).fail(function (ex) {
    //        console.log('event logging failed : %o', ex);
    //        throw Error('Event logging failed');
    //    });
    //},

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
                                lookupData = MODELS[field.model.name].data;
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
        var data = [];
        // REST API returns .results & Data.svc does not
        items = (items.results) ? items.results : items;
        if(model) {
            try {
                if (items.length > 1) {
                    items.forEach(function(item){
                        item = convertItem(item, model);
                        data.push(item);
                    });
                } else if (items.length > 0) {
                    // TODO: make this return only one item rather than array
                    data.push(convertItem(items[0], model));
                } else {
                    // no items returned
                    data = [];
                }
            } catch (ex) {
                var err = new Event('SPAPI.successDataHandler fetch failed', model, 'ErrorMsg: unable to parse fields', 'Status:Error', 'Error');
                console.log('successDataHandler fetch failed: %o', err);
                deferred.reject(err);
            }

            deferred.resolve(data);

        } else {
            deferred.resolve(items);
        }
    },


    /**
     * @description
     * get list failure event handler
     */
    failureDataHandler = function (sender, args) {
        console.log("getList failed. Message: " + args.get_message());
    },
    // readListFailed

    convertModelData = function (model) {
        var data = {};
        model.fields.forEach(function (field) {
            // convert domain specific field names to spField name
            if (model.data[field.name]) {
                if (field.type && field.type === 'multivalue') {
                    data[field.spField] = { results: [model.data[field.name]] };
                }
                data[field.spField] = model.data[field.name];
            } else if (model.data[field.spField]) {
                // handle cases where data supplied uses spField names
                data = model.data[field.spField];
            }
        });
        return data;
    },
    /**
     * removes $$hashKey property which is attached to objects from angular.
     * enumerates properties and goes one-level deep to remove $$hashKey properties
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    removeHashKeyProperty = function (data) {
        if (data !== null) {
            Object.keys(data).forEach(function (p) {
                if (typeof data[p] === 'object') {
                    removeHashKeyProperty(data[p]);
                } else if (p === '$$hashKey') {
                    delete data[p];
                }
            });
        }
    },

    /**
     * @description: get the item type for the list
     *
     */
    getListItemType = function (name) {
        var listName = 'ListItem',
            documentName = 'Item';
        if (name.indexOf('documents') > -1) { } else { }
        return 'SP.Data.{0}ListItem'.format(name[0].toUpperCase() + name.substring(1)).toString();
    },

    // /**
    //  * @description:
    //  *  get all site groups
    //  */
    // getSiteGroups = function () {
    //     var config = {
    //         type: 'GET',
    //         url: '/_api/Web/SiteGroups',
    //         headers: {
    //             'Accept': 'application/json;odata=verbose',
    //             'Content-Type': 'application/json;odata=verbose'
    //         }
    //     };
    //     return $.ajax(config);
    // },

    // /**
    //  * @description:
    //  *  get the site group owner as SPUser
    //  */
    // getSiteGroupOwner = function (groupId) {
    //     var config = {
    //         url: '/_api/Web/SiteGroups/GetById({0})/Owner'.format(groupId),
    //         headers: {
    //             'Accept': 'application/json;odata=verbose',
    //             'Content-Type': 'application/json;odata=verbose'
    //         }
    //     };
    //     return $.ajax(config);
    // },

    // /**
    //  * @description:
    //  *  get the site group owner as an array of SPUsers
    //  */
    // getSiteGroupUsers = function (groupId) {
    //     var config = {
    //         url: '/_api/Web/SiteGroups/GetById({0})/Users'.format(groupId),
    //         headers: {
    //             'Accept': 'application/json;odata=verbose',
    //             'Content-Type': 'application/json;odata=verbose'
    //         }
    //     };
    //     return $.ajax(config);
    // },

    /**
     * @description: encodes binary file data for http post
     */
    convertDataURLToBinary = function (dataURL) {
        var base64Marker = ';base64,';
        var base64Index = dataURL.indexOf(base64Marker) + base64Marker.length;
        var base64 = dataURL.substring(base64Index);
        var raw = window.atob(base64);
        var rawLength = raw.length;
        var array = new window.Uint8Array(new window.ArrayBuffer(rawLength));

        for (var i = 0; i < rawLength; i++) {
            array[i] = raw.charCodeAt(i);
        }
        return array;
    },

    /**
     * @description: uploads document to SP
     *  call this function to upload a document to an SP library
     *  when completed the deferred resolve or rejected promise is invoked
     *
     * @param {string} library name (the display name)
     * @param {string} file name to save
     * @param {string} path to folder (e.g. /foldername)
     * @param {binary} file data in binary format
     * @param {string} request digest security token
     * @param {object} jquery deferred
     */
    performUpload = function (siteUrl, libraryName, fileName, folderName, documentModel, fileData, digest, deferred) {
        // TODO(mpace): make the baseUrl a global so we don't need to duplicate
        var baseUrl = '{0}/_api/web/GetFolderByServerRelativeUrl(\'{0}/{1}\')/Files/Add(url=\'{2}\',overwrite=true)'.format(siteUrl, libraryName, fileName);

        // use ajax to upload the file
        var config = {
            url: baseUrl,
            type: 'POST',
            headers: {
                'Accept': 'application/json;odata=verbose',
                'X-RequestDigest': digest
            },
            contentType: 'application/json;odata=verbose',
            processData: false,
            binaryStringRequestBody: true,
            data: fileData
        };

        $.ajax(config).done(function(data){
            console.log('success! data: %o', data);
            var document = new DocumentModel(data.d);
            // get document data - data returned DOES NOT CONTAIN DOCUMENT ID
            document = convertItem(data.d, document);
            // this call is to get the DOCUMENT ID
            $.ajax({
                url: document.listItemAllFieldsUrl,
                type: "GET",
                dataType: "json",
                headers: {
                    Accept: "application/json;odata=verbose"
                }
            }).done(function (data) {
                // convert the data returned into the user supplied Document model
                // so we can return a document object with a DOCUMENT ID
                documentModel = convertItem(data.d, documentModel);
                documentModel.data = {};
                Object.keys(document).forEach(function (dp) {
                    Object.keys(documentModel).forEach(function (dmp) {
                        if (dp !== dmp) {
                            documentModel.data[dp] = document[dp];
                        }
                    });
                });
                deferred.resolve(documentModel);
            }).fail(function (jqxhr, status, errorMsg) {
                console.log('error-jqxhr: %o', jqxhr);
                console.log('error-status: %o', status);
                console.log('error-message: %o', errorMsg);
                var error = { jqxhr: jqxhr, status: status, errorMsg: errorMsg };
                deferred.reject(error);
            });
        }).fail(function(jqxhr, status, errorMsg){
            console.log('error-jqxhr: %o', jqxhr);
            console.log('error-status: %o', status);
            console.log('error-message: %o', errorMsg);
            var error = { jqxhr: jqxhr, status: status, errorMsg: errorMsg };
            deferred.reject(error);
        });
    },

    /**
     * @description: convert file data for http post
     *
     */
    processUpload = function (siteUrl, fileInput, docLibraryName, folderName, model, digest, deferred) {
        // process upload
        var reader = new FileReader();
        siteUrl = siteUrl || '';
        reader.onload = function (file) {
            var fileData = convertDataURLToBinary(file.target.result);
            performUpload(siteUrl, docLibraryName, fileInput.name.replace(/\'/,''), folderName, model, fileData, digest, deferred);
        };
        reader.readAsDataURL(fileInput);
    },

    /**
     * @description
     *  fetch the digest value to re-authorize call to SP API
     * @returns {object|string} $.Deferred as a promise to return the digest value (string)
     **/
    getDigest = function (siteUrl) {
        var $deferred = $.Deferred(),
            options = {
                url: '{0}/_api/contextinfo'.format(siteUrl),
                type: 'POST',
                headers: { 'Accept': 'application/json; odata=verbose' },
                success: function (data) {
                    var digest = data.d.GetContextWebInformation.FormDigestValue;
                    $deferred.resolve(digest);
                },
                error: function (data, errorCode, errorMessage) {
                    console.error(errorMessage)
                }
            };
        $.ajax(options);
        return $deferred;
    },

    /**
     * @description
     *  search function to query SP Search REST API
     */
    search = function (query) {
        if (isUndefined(query.text)) {
            throw new Error('Required: "text" property value not defined');
        }
        var $deferred = $.Deferred(),
            // query options from: http://msdn.microsoft.com/en-us/library/office/jj163876(v=office.15).aspx
            queryParams = {
                request: {
                    //__metadata: { "type": "Mirosoft.Office.Server.Search.REST.SearchRequest" },
                    Querytext: query.text,
                    EnableInterleaving: query.enableInterleaving || false,
                    StartRow: query.startRow || 10,
                    RowLimit: query.rowLimit || 10,
                    SelectProperties: query.selectProperties || { results: ['Title', 'Author'] },
                    RefinementFilters: query.RefinementFilters || { results: ['fileExtension:equals(\'docx\')'] },
                    // NOT WORKING?
                    //Refiners: { results: ['author','size'] },
                    HiddenConstraints: 'developer',
                    EnableStemming: query.enableStemming || false,
                    TrimDuplicates: query.trimDuplicates || false,
                    Timeout: query.timeout || 6000,
                    EnableNicknames: query.enableNicknames || false,
                    EnablePhonetic: query.enablePhonetic || false,
                    EnableFQL: query.enableFQL || false,
                    HitHighlightedProperties: query.highlightedProperties || { results: ['Title'] },
                    BypassResultTypes: query.bypassResultTypes || false,
                    EnableQueryRules: query.enableQueryRules || false,
                    // this parameter is only used id EnableQueryRules is set to 'true' otherwise ignored
                    ProcessBestBets: query.processBestBets || (query.enableQueryRules) ? true : false,
                    // The type of the client that issued the query.
                    ClientType: query.clientType || 'custom',
                    // The preferred number of characters to display in the hit-highlighted summary generated for a search result.
                    DesiredSnippetLength: query.desiredSnippetLength || 100,
                    // The maximum number of characters to display in the hit-highlighted summary generated for a search result.
                    MaxSnippetLength: query.maxSnippetLength || 100,
                    // The number of characters to display in the result summary for a search result.
                    SummaryLength: query.summaryLength || 150
                    // The GUID for the user who submitted the search query.
                    //PersonalizationData: '<GUID>',
                    // Url to results page e.g. 'http://server/site/resultspage.aspx'
                    //ResultsURL: query.ResultsURL || '',
                }
            },
            options = {
                url: '/_api/search/postquery',
                data: JSON.stringify(queryParams),
                type: 'POST',
                contentType: 'application/json;odata=verbose;charset=utf-8',
                headers: { 'Accept': 'application/json;odata=verbose;charset=utf-8' },
            };
        self.getDigest('').done(function (digestValue) {
            options.headers['X-RequestDigest'] = digestValue;
            $.ajax(options).done(function (results) {
                $deferred.resolve(results);
            });
        });
        return $deferred.promise();
    },

    /**
     * attaches event handlers to successHandler and failureHandler
     * both these handlers are called by CRUD events in the controller
     */
    attachDataHandlers = function (model) {
        // assign default handlers or model handlers if they are defined
        successHandler = (model.successDataHandler) ? successHandler : model.successDataHandler,
        failureHandler = (model.failureDataHandler) ? failureHandler : model.failureDataHandler;
    },

    /**
     * @description
     *  sets the default success handler - render
     *  if a user provided handler is not supplied
     */
    setDefaultHandlers = function (config) {
        if (typeof config.handler === 'undefined' || config.handler === null)
            config.handler = render;
    },

    /**
     * @description: set the currentModel to the passed in model
     * @param: {object} model configuation object
     */
    render = function (model) {
        // init model
        initModel(model);

        // initialize sp.js so we can get the context object
        ExecuteOrDelayUntilScriptLoaded(function () {
            getListItems(model);
        }, 'sp.js');
    },

    /**
     * @descipton: initialize event handler(s)
     */
    hookupEventHandlers = function (config) {
        if (DEBUG) { console.log('hookupEventHandlers - called'); };

        setDefaultHandlers(config);
        // able to handle various events
        // will attach various event handlers to the specified element
        switch (config.event) {
            case 'click':       // fires on mouseclick
            case 'mouseover':   // fires on mouseover
            case 'mouseover':   // fires on mouseover
                $(config.el).bind(config.event, function (config) {
                    return function () {
                        config.handler(config.model);
                    }
                }(config));
                break;
            case 'load':        // fires immediately 'onload' - no context
                config.handler(config.model);
                break;
            default:        // if an event is not defined this fires immediately
                config.handler(config.model);
                break;

        }

    },  // end hookupEventHandlers

    /**
     * @description: set the currentModel to the passed in model
     * this throws as it expects a model object
     * TODO(mpace):
     * cached MODELS contain data and can be reused
     * by other MODELS and their views?
     */
    initModel = function (model) {
        if (typeof model === 'undefined')
            throw 'object parameter expected';

        MODELS[model.name] = model;

        attachDataHandlers(model);
    },

    /**
     * @description: inititialization routine to be called when
     *  passing in an initialization configuration object
     *  initialization objects can load data and populate page
     *  elements with the retrieved data. A templating system can
     *  be injected to use in place of the default handlebars implementation.
     * @params {object} configuration object
     */
    initConfig = function (configs) {
        if (typeof configs === 'undefined')
            throw 'a configuration object is required to initialize the nuvem.SharepointAPI object';

        // assign configuration collection to global object
        globalConfigs = configs;

        for (var i = 0; i < configs.length; i++) {
            var config = configs[i],
            el = $(config.el),
            elExists = (el.length > 0) || false;
            if (DEBUG) { console.log('element %s: found: %s', config.el, elExists); };

            if (typeof config.model === 'undefined')
                throw 'a model definition is required to initialize the nuvem.sharepoint object';

            if (typeof config.event === 'undefined')
                console.warning('config.event is undefined, "load" will be the default event');

            hookupEventHandlers(config);
        }

    };
    /**************************************/
    /* spapi/spapi.public.functions.js    */
    /**************************************/

    /**
     * @description
     *  exposes the local ODataFilter function as a public function
     */
    self.ODataFilter = ODataFilter;

    /**
     * convertModelData converts data to the specified model
     * @type {function}
     */
    self.convertModelData = convertModelData;

    /**
     * @description
     *  page context info from SP Page
     *  includes:
     *      webServerRelativeUrl: /[site]/[subsite]
     *      webAbsoluteUrl: http://[server name]:[port]/[site]/[subsite]
     **/
    self.contextInfo = _spPageContextInfo;

    //self.logEvent = logEvent;

    /**
     * gets the SharePoint digest value
     * for performing POST operations
     * @type {[type]}
     */
    self.getDigest = getDigest;

    /**
     * @description
     *  queries the search API to return search results
     *
     * @param {object} a query object with the defined options for the SP Search API
     * @returns {object} an object with the search results
     */
    self.search = function (queryObj) {
        return search(queryObj);
    };


    /**
     * @description
     *  queries for people or groups from the SP API -
     *  which gets data from the UserProfile service/LDAP
     *  TODO: DEPRECATE IN FAVOR OF spapi.[user|group].find();
     * @param {object}  query object - an object with the following properties
     *  object.queryString         {string}  queryString the user supplied string for querying
     *  object.maxSuggestions      {int}     maxSuggestions the maximumn number of suggestions to return with query defaults to 30
     *  object.allowEmailAddresses {bool}    allowEmailAddresses fetches the email address with other data defaults to 'false'
     **/
    self.getPeopleGroups = function (query) {
        var deferred = $.Deferred(),
            maxSuggestions = (!isUndefined(query.maxSuggestions)) ? parseInt(query.maxSuggestions) : 30,
            allowEmailAddresses = (!isUndefined(query.allowEmailAddresses)) ? query.allowEmailAddresses.toString() : 'false',
            xmlData = ['<Request xmlns="http://schemas.microsoft.com/sharepoint/clientquery/2009" SchemaVersion="15.0.0.0" LibraryVersion="15.0.0.0" ApplicationName="Javascript Library">',
            '<Actions>',
                '<StaticMethod TypeId="{de2db963-8bab-4fb4-8a58-611aebc5254b}" Name="ClientPeoplePickerSearchUser" Id="0">',
                '<Parameters>',
                    '<Parameter TypeId="{ac9358c6-e9b1-4514-bf6e-106acbfb19ce}">',
                    '<Property Name="QueryString" Type="String">{0}</Property>',
                    '<Property Name="MaximumEntitySuggestions" Type="Number">{1}</Property>',
                    '<Property Name="AllowEmailAddresses" Type="Boolean">{2}</Property>',
                    '<Property Name="AllowMultipleEntities" Type="Boolean">true</Property>',
                    '<Property Name="AllUrlZones" Type="Boolean">false</Property>',
                    '<Property Name="EnabledClaimProviders" Type="String"></Property>',
                    '<Property Name="ForceClaims" Type="Boolean">false</Property>',
                    '<Property Name="PrincipalSource" Type="Number">15</Property>',
                    '<Property Name="PrincipalType" Type="Number">1</Property>',
                    '<Property Name="Required" Type="Boolean">false</Property>',
                    '<Property Name="SharePointGroupID" Type="Number">0</Property>',
                    '<Property Name="UrlZone" Type="Number">0</Property>',
                    '<Property Name="UrlZoneSpecified" Type="Boolean">false</Property>',
                    '<Property Name="Web" Type="Null" />',
                    '<Property Name="WebApplicationID" Type="String">{00000000-0000-0000-0000-000000000000}</Property>',
                    '</Parameter>',
                '</Parameters>',
                '</StaticMethod>',
                '</Actions>',
            '<ObjectPaths />',
            '</Request>'].join('').format(query.queryString, maxSuggestions, allowEmailAddresses);
        self.getDigest('').done(function (digest) {
            var config = {
                type: 'POST',
                contentType: 'text/xml',
                data: xmlData,
                dataType: 'json',
                url: self.contextInfo.webAbsoluteUrl + '/_vti_bin/client.svc/ProcessQuery',
                headers: {
                    'Accept': '*/*',
                    'X-RequestDigest': digest
                },
            };
            $.ajax(config).done(function (data) {
                var response = {
                    info: data[0],
                    results: JSON.parse(data[2])
                };
                deferred.resolve(response);
            });
        });

        return deferred.promise();
    };


    self.getLibraryItems = function (model) {
        var deferred = $.Deferred();
        getLibraryItems(model, deferred);
        return deferred.promise();
    };

    /**
     * @description: registers a model to
     *  be used to fetch (getListItems), save, or update
     *  data in the specified web/list
     *
     * @param: {object} model configuration object
     */
    self.addModel = function (model) {
        var msg = 'model with the same name already exists. please add "overwrite: [true|false]" property if you wish to override the existing model';
        if (model && model.name) {
            if (typeof MODELS[model.name] === 'undefined') {
                MODELS[model.name] = model;
            } //else {
            //    if (typeof model.override === 'undefined') {
            //        // the configuration should include an 'override'
            //        // property set to 'true' to overrride any existing model
            //        console.warn(msg);
            //    }
            //}
        }
    };
/********************************/
/* spapi/spapi.site.js          */
/********************************/
    self.site = {
        getProperties: function () {
            var options = new GETOptions(SPSITE.format(''));
            return $.ajax(options);
        },
        /**
         * @description: gets all lists in the site collection
         */
        getLists: function(siteUrl, model) {
            var deferred = $.Deferred();
            if (SITE_LISTS.length < 1) {
                var url = '{0}/_api/Web/Lists'.format(siteUrl),
                    options = {
                        type: 'GET',
                        url: url,
                        headers: { 'Accept': 'application/json;odata=verbose' }
                    };
                $.ajax(options).done(function (data) {
                    successDataHandler(data.d, model, deferred);
                    deferred.resolve(SITE_LISTS);
                }).fail(function (jqxhr, status, errMsg) {
                    var err = new Event('SPAPI.getSiteLists fetch failed', model, errMsg, status, jqxhr.responseText);
                    console.log('getSiteListsREST fetch failed: %o', err);
                    deferred.reject(err);
                });
            }
            return deferred.promise();
        },
        createSite: function () { },
        deleteSite: function () { }
    };
    /********************************/
    /* spapi/spapi.web.js           */
    /********************************/

    self.web = {
        getProperties: function () {
            var deferred = $.Deferred(),
                options = new GETOptions(SPWEB.format('')),
                model = new WebModel;
            $.ajax(options).done(function (data) {
                successDataHandler(data.d, model, deferred);
            });
            return deferred.promise();
        },
        createWeb: function () { },
        deleteWeb: function () { }
    };
    /********************************/
    /* spapi/spapi.list.js          */
    /********************************/
    /**
     * @description
     *  sets the ajax options for getting list items
     * @param {model} the user provided model for the list to fetchyyy
     */
    var getListItemsOptions = function (model) {
        var filter = '', url;
        // - set to 1000 for now may need to implement paging when we get beyond this size
        var MAX_ITEMS = 1000;
        var count = (typeof model.count === 'number') ? model.count : MAX_ITEMS;
        var limit = '?$top={0}'.format(count);
        var pageSize = '$skip={0}'.format(MAX_ITEMS);

        // check for a subsite url - if we don't have one then set to ''
        // TODO: more robust handling is needed - is the siteUrl prefixed with '/' or not?
        //      and does it have a trailing '/' or not?
        model.siteUrl = (model.siteUrl) ? model.siteUrl : '';

        // check for an ODataFilter object - we can simply get the query from this
        if (model.filter && typeof model.filter === 'object' && model.filter.hasOwnProperty('getQuery')) {
            filter = model.filter.getQuery();
        } else if (model.filter && typeof model.filter === 'string') {
            if (model.filter.indexOf('$') < 0) {
                // a '$' oData filter is not in the filter string - let's add it??
                // TODO: need to revisit this logic
                filter = '&$filter=' + model.filter;

            } else {
                // just append the given string to the end of the url - assumes a valid oData query string
                //filter = '&' + model.filter;
                filter = model.filter;
            }
        }

        // get the model count - if a string then assume 'all' and get all records
        var apiUrl = '{0}/_api/Web/Lists/getByTitle(\'{1}\')/Items'.format(model.siteUrl, model.listName) + filter;
        var svcUrl = '{0}/_vti_bin/ListData.svc/{1}'.format(model.siteUrl, model.listName) + filter;

        if (filter.indexOf('datetime') > -1) {
            url = svcUrl;
            model.type = 'dataSvc';
        } else {
            url = apiUrl;
        }

        var options = new GETOptions(url);
        return options;
    };

    self.list = {
        getProperties: function (listName) { },

        getItemType: function(name) {
            var listName = 'ListItem',
                documentName = 'Item';
            if (name.indexOf('documents') > -1) { } else { }
            return 'SP.Data.{0}ListItem'.format(name[0].toUpperCase() + name.substring(1)).toString();
        },

        createList: function () { },

        updateList: function () {
            var deferred = $.Deferred();
            //updateList(model, deferred);
            return deferred.promise();
        },

        deleteList: function () { },

        /**
         * @description: fetches the data from the data source
         *  may pass in a a model object argument
         *  if no arguments are passed, then the
         *  named model in the cache will be used. if there
         *  are no MODELS in the cache, an error will be thrown
         *  getListItems() does not update the view until render() is called
         *
         * @param: {object} data model
         */
        getItems: function (model, deferred) {

            deferred = deferred || $.Deferred();

            var options = getListItemsOptions(model);

            $.ajax(options).done(function (data) {
                try {
                    successDataHandler(data.d, model, deferred);
                } catch (e) {
                    var err = new Event('SPAPI.getListItems failed', model, 'error', e.message, e.stack);
                    deferred.reject(err);
                }
            }).fail(function (jqxhr, status, errMsg) {
                var err = new Event('SPAPI.getListItems lookup fetch failed', model, errMsg, status, jqxhr.responseText);
                console.log('lookup fetch failed: %o', err);
                deferred.reject(err);
            });
            return deferred.promise();
        },

        /**
         * @description: get list item using REST API
         */
        getItem: function (model, deferred) {

            deferred = deferred || $.Deferred();

            model.siteUrl = (model.siteUrl) ? model.siteUrl : '';
            var id = (model.data && model.data.id) ? model.data.id : '';
            var url = (id !== '') ? SPLIST_ITEM_BY_ID.format(model.siteUrl, model.listName, id) : SPLIST_ITEM_BY_ID.format(model.siteUrl, model.listName, id) + model.filter,
                options = new GETOptions(url);

            $.ajax(options).done(function (item) {
                var listItem, listType;
                if (item.d.results ) {
                    if(item.d.results.length > 0)
                        listItem = convertItem(item.d.results[0], model);
                } else {
                    listItem = convertItem(item.d, model);
                }
                listType = getListItemType(model.listName);
                // set sp metadata values so we have these for saving the item
                //listItem['__metadata'] = item.d.__metadata;
                deferred.resolve(listItem);
            }).fail(function (jqxhr, status, errMsg) {
                var err = new Event('SPAPI.getListItem fetch failed', model, errMsg, status, jqxhr.responseText);
                console.log('getListItem fetch failed: %o', err);
                deferred.reject(err);
            });

            return deferred.promise();
        },

        createItem: function (model, deferred) {
            deferred = deferred || $.Deferred();

            var siteUrl = '',
                isNew = false;
            // check for data attribute
            if (!model.data) {
                throw Error('SharePointAPI: \'data\' attribute required on model to save or update an item');
            }

            // check for model (caching - not fully  implemented)
            if (isUndefined(model.name)) {
                console.log('model name is undefined.');
            }
            // are we saving to a different site/sub-site?
            if (model.siteUrl) {
                siteUrl = model.siteUrl;
            }

            // get the updated digest value
            getDigest(siteUrl).done(function (digestValue) {

                // HACK: handle mysterious occurance of $$haskey with angular
                if (window.angular && typeof window.angular === 'object') {
                    removeHashKeyProperty(model.data);
                }
                // set ajax options
                var options = {
                    url: SPLIST_ITEM.format(siteUrl, model.listName),
                    type: 'POST',
                    headers: {
                        'Accept': 'application/json;odata=verbose',
                        'Content-Type': 'application/json;odata=verbose',
                        'X-RequestDigest': digestValue
                    }
                };

                // convert model data fields to SPField names
                model.data = convertModelData(model);

                // get a list item type
                if (!model.data['__metadata']) {
                    var metaDataType = { type: self.list.getItemType(model.listName) };
                    model.data['__metadata'] = metaDataType;
                }
                options.data = JSON.stringify(model.data);
                options.url = SPLIST_ITEMS.format(siteUrl, model.listName);

                // Create a new record
                // break this out & consolidate w/ update section below
                $.ajax(options).done(function (data) {
                    var item = convertItem(data.d, model);
                    deferred.resolve(item);
                }).fail(function (jqxhr, status, errMsg) {
                    var err = new Event('SPAPI.saveListItem (create) failed', model, errMsg, status, jqxhr.responseText);
                    console.log('saveListItemREST (create) failed: %o', err);
                    deferred.reject(err);
                });
            });

            return deferred.promise();
        },

        /**
         * @description: save list data using REST
         *  TODO: Clean-up this function
         */
        saveItem: function (model, deferred) {

            deferred = deferred || $.Deferred();

            var siteUrl = '',
                isNew = false;
            // check for data attribute
            if (!model.data) {
                throw Error('SharePointAPI: \'data\' attribute required on model to save or update an item');
            } else {
                // do we save or update?
                isNew = !(!isUndefined(model.data.id) && model.data.id > -1);
            }

            // check for model (caching - not fully  implemented)
            if (isUndefined(model.name)) {
                console.log('model name is undefined.');
            }
            // are we saving to a different site/sub-site?
            if (model.siteUrl) {
                siteUrl = model.siteUrl;
            }

            // get the updated digest value
            getDigest(siteUrl).done(function (digestValue) {
                // HACK: handle mysterious occurance of $$haskey with angular
                if (window.angular && typeof window.angular === 'object') {
                    removeHashKeyProperty(model.data);
                }
                // set ajax options
                var options = {
                    url: SPLIST_ITEM.format(siteUrl, model.listName),
                    type: 'POST',
                    headers: {
                        'Accept': 'application/json;odata=verbose',
                        'Content-Type': 'application/json;odata=verbose',
                        'X-RequestDigest': digestValue
                    }
                };

                if (isNew) {
                    // convert model data fields to SPField names
                    model.data = convertModelData(model);
                    // get a list item type
                    if (!model.data['__metadata']) {
                        var metaDataType = { type: self.list.getItemType(model.listName) };
                        model.data['__metadata'] = metaDataType;
                    }
                    options.data = JSON.stringify(model.data);
                    options.url = SPLIST_ITEMS.format(siteUrl, model.listName);
                    // Create a new record
                    // break this out & consolidate w/ update section below
                    $.ajax(options).done(function (data) {
                        var item = convertItem(data.d, model);
                        deferred.resolve(item);
                    }).fail(function (jqxhr, status, errMsg) {
                        var err = new Event('SPAPI.saveListItem (create) failed', model, errMsg, status, jqxhr.responseText);
                        console.log('saveListItemREST (create) failed: %o', err);
                        deferred.reject(err);
                    });
                } else {
                    // get the list item to get the current ETag value
                    $.ajax({
                        url: '{0}/_api/Web/Lists/GetByTitle(\'{1}\')/Items({2})'.format(siteUrl, model.listName, model.data.id),
                        type: 'GET',
                        headers: { 'Accept': 'application/json;odata=verbose' }
                    }).done(function (item) {
                        model.data = convertModelData(model);
                        model.data['__metadata'] = { type: item.d.__metadata.type };
                        // TODO: this should ideally be stored with the object data?
                        options.headers['Content-Type'] = 'application/json;odata=verbose';
                        options.headers['X-HTTP-Method'] = 'MERGE';
                        options.headers['If-Match'] = '*'; //item.d.__metadata.etag;
                        options.url = item.d.__metadata.uri;
                        options.data = JSON.stringify(model.data);
                        console.log('Options URL in API --->' + options.url);
                        console.log('Options data in API --->' + options.data);
                        $.ajax(options).done(function (data) {
                            // NOTE: returning same item we updated - SP doesn't return anything but a response code.
                            deferred.resolve(model.data);
                        }).fail(function (jqxhr, status, errMsg) {
                            var err = new Event('SPAPI.saveListItem (update) failed', model, errMsg, status, jqxhr.responseText);
                            console.log('saveListItemREST (update) failed: %o', err);
                            deferred.reject(err);
                        });
                    }).fail(function (jqxhr, status, errMsg) {
                        var err = new Event('SPAPI.saveListItem getting list item (update) failed', model, errMsg, status, jqxhr.responseText);
                        console.log('getting list item (update) failed: %o', err);
                        deferred.reject(err);
                    });
                }
            });

            return deferred.promise();
        },

        updateItem: function (model, deferred) {

            deferred = deferred || $.Deferred();

            var siteUrl = '';
            // check for data attribute
            if (!model.data) {
                throw Error('SharePointAPI: \'data\' attribute required on model to save or update an item');
            }

            // check for model (caching - not fully  implemented)
            if (isUndefined(model.name)) {
                console.log('model name is undefined.');
            }
            // are we saving to a different site/sub-site?
            if (model.siteUrl) {
                siteUrl = model.siteUrl;
            }

            // get the updated digest value
            getDigest(siteUrl).done(function (digestValue) {
                // HACK: handle mysterious occurance of $$haskey with angular
                if (window.angular && typeof window.angular === 'object') {
                    removeHashKeyProperty(model.data);
                }
                // set ajax options
                var options = {
                    url: SPLIST_ITEM.format(siteUrl, model.listName),
                    type: 'POST',
                    headers: {
                        'Accept': 'application/json;odata=verbose',
                        'Content-Type': 'application/json;odata=verbose',
                        'X-RequestDigest': digestValue
                    }
                };

                // get the list item to get the current ETag value
                $.ajax({
                    url: '{0}/_api/Web/Lists/GetByTitle(\'{1}\')/Items({2})'.format(siteUrl, model.listName, model.data.id),
                    type: 'GET',
                    headers: { 'Accept': 'application/json;odata=verbose' }
                }).done(function (item) {
                    model.data = convertModelData(model);
                    model.data['__metadata'] = { type: item.d.__metadata.type };
                    // TODO: this should ideally be stored with the object data?
                    options.headers['Content-Type'] = 'application/json;odata=verbose';
                    options.headers['X-HTTP-Method'] = 'MERGE';
                    options.headers['If-Match'] = '*'; //item.d.__metadata.etag;
                    options.url = item.d.__metadata.uri;
                    options.data = JSON.stringify(model.data);
                    console.log('Options URL in API --->' + options.url);
                    console.log('Options data in API --->' + options.data);
                    $.ajax(options).done(function (data) {
                        // NOTE: returning same item we updated - SP doesn't return anything but a response code.
                        deferred.resolve(model.data);
                    }).fail(function (jqxhr, status, errMsg) {
                        var err = new Event('SPAPI.saveListItem (update) failed', model, errMsg, status, jqxhr.responseText);
                        console.log('saveListItemREST (update) failed: %o', err);
                        deferred.reject(err);
                    });
                }).fail(function (jqxhr, status, errMsg) {
                    var err = new Event('SPAPI.saveListItem getting list item (update) failed', model, errMsg, status, jqxhr.responseText);
                    console.log('getting list item (update) failed: %o', err);
                    deferred.reject(err);
                });

            });

            return deferred.promise();

        },

        deleteItem: function (model) { }
    };

    /********************************/
    /* spapi/spapi.field.js          */
    /********************************/

self.list.field = {
    /**
     * gets the definition for the specified field in the specified list
     * @param  {[type]} listName  the name of the list with the field
     * @param  {[type]} fieldName the name of the field
     * @return {[type]}           json object with field metadata
     */
    getByName: function (listName, fieldName) {
        var deferred = $.Deferred();

        var url = '/_api/web/lists/GetByTitle(\'{0}\')/fields?$filter=EntityPropertyName eq \'{1}\''.format(listName, fieldName);
        var options = new GETOptions(url);

        $.ajax(options).done(function (data) {
            try {
                console.log('Category: %o', data);
                deferred.resolve(data);
            } catch (e) {
                var err = new Event('SPAPI.getByName failed', { siteUrl: url, listName: listName }, 'error', e.message, e.stack);
                deferred.reject(err);
            }
        }).fail(function (jqxhr, status, errMsg) {
            var err = new Event('SPAPI.getByName fetch failed', { siteUrl: url, listName: listName }, errMsg, status, jqxhr.responseText);
            console.log('getByName fetch failed: %o', err);
            deferred.reject(err);
        });
        return deferred.promise();
    },

    getByType: function (listName, fieldName) {
        var deferred = $.Deferred();

        var url = '/_api/Web/Lists/GetByTitle(\'{0}\')/fields?$filter=TypeAsString eq \'{1}\''.format(listName, fieldName);
        var options = new GETOptions(url);

        $.ajax(options).done(function (data) {
            try {
                console.log('Category: %o', data);
                deferred.resolve(data);
            } catch (e) {
                var err = new Event('SPAPI.getByName failed', { siteUrl: url, listName: listName }, 'error', e.message, e.stack);
                deferred.reject(err);
            }
        }).fail(function (jqxhr, status, errMsg) {
            var err = new Event('SPAPI.getByName fetch failed', { siteUrl: url, listName: listName }, errMsg, status, jqxhr.responseText);
            console.log('getByName fetch failed: %o', err);
            deferred.reject(err);
        });
        return deferred.promise();
    }
}
    /********************************/
    /* spapi/spapi.library.js       */
    /********************************/

    var convertDataURLToBinary = function (dataURL) {
        var base64Marker = ';base64,';
        var base64Index = dataURL.indexOf(base64Marker) + base64Marker.length;
        var base64 = dataURL.substring(base64Index);
        var raw = window.atob(base64);
        var rawLength = raw.length;
        var array = new window.Uint8Array(new window.ArrayBuffer(rawLength));

        for (var i = 0; i < rawLength; i++) {
            array[i] = raw.charCodeAt(i);
        }
        return array;
    },

    /**
     * @description: uploads document to SP
     *  call this function to upload a document to an SP library
     *  when completed the deferred resolve or rejected promise is invoked
     *
     * @param {string} library name (the display name)
     * @param {string} file name to save
     * @param {string} path to folder (e.g. /foldername)
     * @param {binary} file data in binary format
     * @param {string} request digest security token
     * @param {object} jquery deferred
     */
    performUpload = function (siteUrl, libraryName, fileName, folderName, documentModel, fileData, digest, deferred) {
        // TODO(mpace): make the baseUrl a global so we don't need to duplicate
        var rootUrl = '{0}/_api/web/GetFolderByServerRelativeUrl(\'{1}\')/Files/Add(url=\'{2}\',overwrite=true)'.format(siteUrl, libraryName, fileName);
        var subSiteUrl = '{0}/_api/Web/Lists/getByTitle(\'{1}\')/RootFolder/Files/Add(url=\'{2}\', overwrite=true)'.format(siteUrl, libraryName, fileName)
        var baseUrl = '';
        if(siteUrl) {
            baseUrl = subSiteUrl;
        } else {
            baseUrl = rootUrl;
        }
        // use ajax to upload the file
        var config = {
            url: baseUrl,
            type: 'POST',
            headers: {
                'Accept': 'application/json;odata=verbose',
                'X-RequestDigest': digest
            },
            contentType: 'application/json;odata=verbose',
            processData: false,
            binaryStringRequestBody: true,
            data: fileData
        };

        $.ajax(config).done(function(data){
            console.log('success! data: %o', data);
            var document = new DocumentModel(data.d);
            // get document data - data returned DOES NOT CONTAIN DOCUMENT ID
            document = convertItem(data.d, document);
            // this call is to get the DOCUMENT ID
            $.ajax({
                url: document.listItemAllFieldsUrl,
                type: "GET",
                dataType: "json",
                headers: {
                    Accept: "application/json;odata=verbose"
                }
            }).done(function (data) {
                // convert the data returned into the user supplied Document model
                // so we can return a document object with a DOCUMENT ID
                documentModel = convertItem(data.d, documentModel);
                documentModel.data = {};
                Object.keys(document).forEach(function (dp) {
                    Object.keys(documentModel).forEach(function (dmp) {
                        if (dp !== dmp) {
                            documentModel.data[dp] = document[dp];
                        }
                    });
                });
                deferred.resolve(documentModel);
            }).fail(function (jqxhr, status, errorMsg) {
                console.log('error-jqxhr: %o', jqxhr);
                console.log('error-status: %o', status);
                console.log('error-message: %o', errorMsg);
                var error = { jqxhr: jqxhr, status: status, errorMsg: errorMsg };
                deferred.reject(error);
            });
        }).fail(function(jqxhr, status, errorMsg){
            console.log('error-jqxhr: %o', jqxhr);
            console.log('error-status: %o', status);
            console.log('error-message: %o', errorMsg);
            var error = { jqxhr: jqxhr, status: status, errorMsg: errorMsg };
            deferred.reject(error);
        });
    },

    /**
     * @description: convert file data for http post
     *
     */
    processUpload = function (siteUrl, fileInput, docLibraryName, folderName, model, digest, deferred) {
        // process upload
        var reader = new FileReader();
        siteUrl = siteUrl || '';
        reader.onload = function (file) {
            var fileData = convertDataURLToBinary(file.target.result);
            performUpload(siteUrl, docLibraryName, fileInput.name.replace(/\'/,''), folderName, model, fileData, digest, deferred);
        };
        reader.readAsDataURL(fileInput);
    };

    self.library = {

        getProperties: function (libraryName) { },
        createLibrary: function () { },
        deleteLibrary: function () { },
        /**
         * [getFiles description]
         * @param  {[type]} model [description]
         * @return {[type]}       [description]
         */
        getFiles: function (model) {
            var deferred = $.Deferred();
            // initialize model
            initModel(model);
            // remove the viewTemplate object so
            // this model does not update the view
            delete model.viewTemplate;
            self.list.getItems(model, deferred);

            return deferred;
        },
        /**
         * [getAllFiles description]
         * @param  {[type]} model  [description]
         * @param  {[type]} expand [description]
         * @return {[type]}        [description]
         */
        getAllFiles: function (model, expand) {
            var siteUrl = (model.siteUrl) ? model.siteUrl : '',
                $expand = (expand) ? '?$expand=CreatedBy, ModifiedBy' : '',
                deferred = $.Deferred(),
                options = {
                type: 'GET',
                url: SPLIST_ITEMS_BY_LIST_DATA_SVC.format(siteUrl, model.listName) + $expand,
                headers: { 'Accept': 'application/json;odata=verbose' }
            };
            $.ajax(options).done(function (data) {
                successDataHandler(data.d, model, deferred);
            }).fail(function (jqxhr, status, errMsg) {
                var err = new Event('SPAPI.getFileInfo fetch failed', model, errMsg, status, jqxhr.responseText);
                console.log('getFileInfo fetch failed: %o', err);
                deferred.reject(err);
            });
            return deferred.promise();
        },
        /**
         * [getAllFiles description]
         * @param  {[type]} model  [description]
         * @param  {[type]} expand [description]
         * @return {[type]}        [description]
         */
        getFileInfo: function (model, expand) {
            var siteUrl = (model.siteUrl) ? model.siteUrl : '',
                $expand = (expand) ? '?$expand=CreatedBy, ModifiedBy' : '',
                deferred = $.Deferred(),
                options = {
                type: 'GET',
                url: SPLIST_ITEM_BY_LIST_DATA_SVC.format(siteUrl, model.listName, model.data.id) + $expand,
                headers: { 'Accept': 'application/json;odata=verbose' }
            };
            $.ajax(options).done(function (data) {
                var file = convertItem(data.d, model);
                deferred.resolve(file);
            }).fail(function (jqxhr, status, errMsg) {
                var err = new Event('SPAPI.getFileInfo fetch failed', model, errMsg, status, jqxhr.responseText);
                console.log('getFileInfo fetch failed: %o', err);
                deferred.reject(err);
            });
            return deferred.promise();
        },
        /**
         * [getItems description]
         * @param  {[type]} model [description]
         * @return {[type]}       [description]
         */
        getItems: function (model) {
            return self.getLibraryItems(model);
        },

        /**
         * @description
         *  uploads the user provided document to the specified library location
         * @param {element} file is a reference to the file from the file input element
         * @param {string}  name of folder - if one exists
         * @param {string}  the digest value. this is optional - if not provided will be generated
         *                  note: this is here for backwards compatibility
         * TODO: docLibrary is hard-coded - use passed in param
         */
        saveDocument: function (siteUrl, file, libraryName, model, folderName) {
            var deferred = $.Deferred();
            self.getDigest(siteUrl).done(function (digestValue) {
                processUpload(siteUrl, file, libraryName, folderName, model, digestValue, deferred);
            });
            return deferred.promise();
        },
        /**
         * @description: uploads a file to a document library
         *
         * @param {string} siteUrl is the sub-site - items are saved to the root site by default
         * @param {html element} the fileInput element retrieved by jQuery(lite)
         * @param {libraryName} name of the library to save to (e.g. Share Documents)
         * @param {folderName} name of the folder (if there is one - shouldn't be...)
         * @returns {object} a promise
         */
        uploadItem: function (siteUrl, fileInput, libraryName, model, folderName) {
            return self.library.saveDocument(siteUrl, fileInput, libraryName, model, folderName);
        },
        //createItem: function (model) { },
        updateItem: function (model) {
            return self.list.updateItem(model);
            //var deferred = $.Deferred();
            //setTimeout(function () {
            //    var jqxhr = {},
            //        status = 500,
            //        msg = 'SPAPI: code not done yet';
            //    deferred.reject(jqxhr, status, msg);
            //}, 3000)
            //return deferred.promise();
        },
        /**
         * [getItem description]
         * @param  {[type]} model [description]
         * @return {[type]}       [description]
         */
        getItem: function (model) {
            var deferred = $.Deferred();
            self.list.getItem(model, deferred);
            return deferred.promise();
        },
        /**
         * [deleteItem description]
         * @param  {[type]} model [description]
         * @return {[type]}       [description]
         */
        deleteItem: function (model) { }
    };

    /**************************************/
    /* spapi/spapi.discussions.js         */
    /**************************************/

    self.discussions = {

        discussionsCache: [],
        messagesCache: [],

        convertModelData: function (model) {
            var data = {};
            model.fields.forEach(function (field) {
                // convert domain specific field names to spField name
                if (model.data[field.name]) {
                    if (field.type && field.type === 'multivalue') {
                        data[field.spField] = { results: [model.data[field.name]] };
                    }
                    data[field.spField] = model.data[field.name];
                } else if (model.data[field.spField]) {
                    // handle cases where data supplied uses spField names
                    data = model.data[field.spField];
                }
            });
            return data;
        },

        /**
         * Create a discussion item: SP.Utilities.Utility.createNewDiscussion
         * @param  {string} listName   discussion list name
         * @param  {object} model      data model used for discussion
         * @return {[type]}            [description]
         */
        createDiscussion: function (listName, properties) {
            var deferred = $.Deferred(),
                properties = convertModelData(properties);
                spCSOM = function (param) {
                    var context = new SP.ClientContext.get_current();
                    var web = context.get_web();

                    var list = web.get_lists().getByTitle(param.listName);
                    context.load(list);

                    var discussionItem = SP.Utilities.Utility.createNewDiscussion(context, list, param.properties.Subject);
                    for (var propName in param.properties) {
                        if (propName == 'Subject') continue;
                        discussionItem.set_item(propName, param.properties[propName])
                    }
                    discussionItem.update();
                    context.load(discussionItem);

                    context.executeQueryAsync(
                        function () {
                            param.deferred.resolve(discussionItem);
                        },
                        function () {
                            param.deferred.reject({ error: 'error creating discussion item' })
                        }
                    );
                };

            if (!SPScriptLoader.scriptsLoaded()) {
                SPScriptLoader.registerCallback('createDiscussion', spCSOM, [{ deferred: deferred, listName: listName, properties: properties }]);
            } else {
                spCSOM({ deferred: deferred, listName: listName, properties: properties });
            }

            return deferred.promise();
        },

        // Load all discussions per Board: SP.CamlQuery.createAllFoldersQuery (Discussion Content Type derives from Folder Content Type)
        getDiscussions: function (listName) {
            var deferred = $.Deferred(),
                spCSOM = function (param) {
                    var context = new SP.ClientContext.get_current(),
                        web = context.get_web(),
                        list = web.get_lists().getByTitle(param.listName);

                    context.load(list);

                    var qry = SP.CamlQuery.createAllFoldersQuery(),
                        discussionItems = list.getItems(qry);

                    context.load(discussionItems);

                    context.executeQueryAsync(
                        function () {
                            var enumerator = discussionItems.getEnumerator();
                            var items = [];
                            while (enumerator.moveNext()) {
                                var item = enumerator.get_current();
                                var post = {};
                                var discussionId = item.get_fieldValues().ID;
                                // need to save the original SP item since we'll
                                // need the original to save the reply to this post
                                post.dto = item;
                                post.id = item.get_fieldValues().ID;
                                post.dateCreated = item.get_fieldValues().Created;
                                post.subject = item.get_fieldValues().Title;
                                post.body = item.get_fieldValues().Body;
                                post.parentFolderID = item.get_fieldValues().ParentFolderID;  // undefined
                                post.parentItemID = item.get_fieldValues().ParentItemID;  // null
                                post.author = item.get_fieldValues().Author.get_lookupValue();
                                items.push(post);
                            }
                            param.deferred.resolve(items);
                        },
                        function () {
                            param.deferred.reject({ error: 'error getting discussion items' })
                        }
                    );
                };

            if (!SPScriptLoader.scriptsLoaded()) {
                SPScriptLoader.registerCallback(listName, spCSOM, [{ deferred: deferred, listName: listName }]);
            } else {
                spCSOM({ deferred: deferred, listName: listName });
            }

            return deferred.promise();
        },

        // Create a message item (or add reply to discussion item):  SP.Utilities.Utility.createNewDiscussionReply
        createMessage: function (discussionItem, properties) {
            var deferred = $.Deferred(),
                //discussionItem = convertModelData(discussionItem);
                properties = convertModelData(properties);
                spCSOM = function (param) {
                    var context = new SP.ClientContext.get_current(),
                        messageItem = SP.Utilities.Utility.createNewDiscussionReply(context, param.discussionItem);

                    //for (var field in param.properties.data) {
                    //    messageItem.set_item(field.spField, param.properties[field.spField])
                    //}
                    messageItem.set_item('Body', param.properties.Body);
                    messageItem.update();

                    context.executeQueryAsync(
                        function () {
                            param.deferred.resolve(messageItem);
                        },
                        function () {
                            param.deferred.reject({ error: 'error creating message item' })
                        }
                    );
                };


            if (!SPScriptLoader.scriptsLoaded()) {
                SPScriptLoader.registerCallback('createMessage', spCSOM, [{ deferred: deferred, discussionItem: discussionItem, properties: properties }]);
            } else {
                spCSOM({ deferred: deferred, discussionItem: discussionItem, properties: properties });
            }

            return deferred.promise();
        },
        //self.createMessages = function (discussionItem, messagesProperties, OnItemsAdded, OnItemsError) {
        //    var context = new SP.ClientContext.get_current();
        //    var messageItems = [];
        //    $.each(messagesProperties, function (i, properties) {
        //        messageItems.push(SP.Utilities.Utility.createNewDiscussionReply(context, discussionItem));
        //        for (var propName in properties) {
        //            messageItems[i].set_item(propName, properties[propName])
        //        }
        //        messageItems[i].update();
        //    });

        //    context.executeQueryAsync(
        //        function () {
        //            OnItemsAdded(messageItems);
        //        },
        //        OnItemsError
        //    );
        //};
        // Load all Messages per Discussion Item: SPBuiltInFieldId.ParentFolderId
        getMessages: function (listName, discussionId) {
            var deferred = $.Deferred(),
                createAllMessagesByDiscussionIDQuery = function (discussionId) {
                    var qry = new SP.CamlQuery;
                    var viewXml = "<View Scope='Recursive'> \
                                <Query> \
                                    <Where> \
                                        <Eq> \
                                            <FieldRef Name='ParentFolderId' /> \
                                            <Value Type='Integer'>" + discussionId + "</Value> \
                                        </Eq> \
                                    </Where> \
                                </Query> \
                            </View>";
                    qry.set_viewXml(viewXml);
                    return qry;
                },
                spCSOM = function (param) {
                    var context = new SP.ClientContext.get_current(),
                        web = context.get_web(),
                        list = web.get_lists().getByTitle(listName);

                    context.load(list);

                    var qry = createAllMessagesByDiscussionIDQuery(discussionId),
                        messageItems = list.getItems(qry);

                    context.load(messageItems);

                    context.executeQueryAsync(
                        function () {
                            var enumerator = messageItems.getEnumerator();
                            var items = [];
                            while (enumerator.moveNext()) {
                                var post = {};
                                var item = enumerator.get_current();
                                var discussionId = item.get_fieldValues().ID;
                                post.dto = item;
                                post.id = item.get_fieldValues().ID;
                                post.dateCreated = item.get_fieldValues().Created_x0020_Date;
                                post.subject = item.get_fieldValues().Title;
                                post.body = item.get_fieldValues().Body;
                                post.parentFolderID = item.get_fieldValues().ParentFolderID;  // undefined
                                post.parentItemID = item.get_fieldValues().ParentItemID;  // null
                                post.author = item.get_fieldValues().Author.get_lookupValue();
                                items.push(post);
                            }
                            param.deferred.resolve(items);
                        },
                        function () {
                            param.deferred.reject({ error: 'error getting message items' })
                        }
                    );
                };

            if (!SPScriptLoader.scriptsLoaded()) {
                SPScriptLoader.registerCallback('discussions.getMessages', spCSOM, { deferred: deferred, listName: listName, discussionId: discussionId });
            } else {
                spCSOM({ deferred: deferred, listName: listName, discussionId: discussionId });
            }

            return deferred.promise();
        }
    };
/********************************/
/* spapi/spapi.taxonomy.js      */
/********************************/

    var
    /**
     * [Term description]
     * @param {[type]} label [description]
     * @param {[type]} guid  [description]
     * @param {[type]} wssid [description]
     */
    Term = function (label, guid, wssid) {
        this.wssid = wssid || -1;
        this.label = label || '';
        this.guid = guid || '';
        this.toString = function () {
            return '{0};#{1}|{2}'.format( this.wssid, this.label, this.guid);
        }
    },
    /**
     * [NewTerm description]
     * @param {[type]} label [description]
     * @param {[type]} guid  [description]
     * @param {[type]} wssid [description]
     */
    NewTerm = function (label, guid, wssid) {
        return {
            wssid: wssid || -1,
            label: label || '',
            guid: guid || '',
            toString: function () {
                return '{0};#{1}|{2}'.format(this.wssid, this.label, this.guid);
            }
        };
    },
    /**
     * [updateItemTerms description]
     * @param  {[type]} context     [description]
     * @param  {[type]} item        [description]
     * @param  {[type]} termList    [description]
     * @param  {[type]} txFieldName [description]
     * @param  {[type]} txField     [description]
     * @param  {[type]} deferred    [description]
     * @return {[type]}             [description]
     */
    updateItemTerms = function (context, item, termList, txFieldName, txField, deferred) {
        var value = item.get_item(txFieldName);
        var terms = new Array();
        var termValueString = '';

        if (txField.get_allowMultipleValues()) {

            // loop through [terms] amd [termIds]
            termList.forEach(function (t) {
                terms.push("-1;#" + t.label + "|" + t.guid);
            });

            termValueString = terms.join(";#");
            var termValues = new SP.Taxonomy.TaxonomyFieldValueCollection(context, termValueString, txField);
            txField.setFieldValueByValueCollection(item, termValues);
        }
        else {
            var termValue = new SP.Taxonomy.TaxonomyFieldValue();
            termValue.set_label(termList[0].label);
            termValue.set_termGuid(termList[0].guid);
            termValue.set_wssId(-1);
            txField.setFieldValueByValue(item, termValue);
            termValueString = termList[0].label;
        }

        item.update();
        context.executeQueryAsync(function () {
            deferred.resolve('field updated: ' + termValueString);
            console.log('field updated with terms: %o', termValueString);
        }, function (sender, args) {
            console.log('{0}; {1}', args.get_message(), args.get_stackTrace());
        });
    },
    /**
     * [error description]
     * @param  {[type]} sender [description]
     * @param  {[type]} args   [description]
     * @return {[type]}        [description]
     */
    error = function (sender, args) {
        //alert(args.get_message() + '\n' + args.get_stackTrace());
    },
    /**
     * [getTermMatch description]
     * @param  {[type]} context   [description]
     * @param  {[type]} termSetId [description]
     * @param  {[type]} label     [description]
     * @return {[type]}           [description]
     */
    getTermMatch = function (context, termSetId, label) {
        var tSession = SP.Taxonomy.TaxonomySession.getTaxonomySession(context);
        var ts = tSession.getDefaultSiteCollectionTermStore();
        var tset = ts.getTermSet(termSetId);

        var lmi = new SP.Taxonomy.LabelMatchInformation(context);
        lmi.set_lcid(1033);
        lmi.set_trimUnavailable(true);
        lmi.set_termLabel(label);

        var termMatches = tset.getTerms(lmi);

        context.load(tSession);
        context.load(ts);
        context.load(tset);
        context.load(termMatches);
        return termMatches;
    },
    /**
     * [getTermIdForTerm description]
     * @param  {[type]} context   [description]
     * @param  {[type]} item      [description]
     * @param  {[type]} terms     [description]
     * @param  {[type]} fieldName [description]
     * @param  {[type]} txField   [description]
     * @param  {[type]} deferred  [description]
     * @return {[type]}           [description]
     */
    getTermIdForTerm = function (context, item, terms, fieldName, txField, deferred) {
        var termSetId = txField.get_termSetId().toString();
        var termList = [];

        if (Object.prototype.toString.call(terms) === '[object Array]') {
            terms.forEach(function(term) {
                // if we got the term from cache, then we can skip creating this.
                if(terms.length && !terms[0].guid) {
                    termList.push({ label: term, guid: null, wssId: -1 });
                } else {
                    term.label = term.name;
                    term.wssId = -1;
                    termList.push(term);
                    updateItemTerms(context, item, termList, fieldName, txField, deferred);
                    termList.length = 0;
                }
            });

            termList.forEach(function (termObj) {

                var tSession = SP.Taxonomy.TaxonomySession.getTaxonomySession(context);
                var ts = tSession.getDefaultSiteCollectionTermStore();
                var tset = ts.getTermSet(termSetId);

                var lmi = new SP.Taxonomy.LabelMatchInformation(context);
                lmi.set_lcid(1033);
                lmi.set_trimUnavailable(true);
                lmi.set_termLabel(termObj.label);

                var termMatch = tset.getTerms(lmi);

                context.load(tSession);
                context.load(ts);
                context.load(tset);
                context.load(termMatch);

                context.executeQueryAsync(function (ctx, itm, tm, trmLst, txFldName, trmObj, dfrd) {
                    return function () {
                        if (tm && tm.get_count() > 0) {
                            trmObj.guid = tm.get_item(0).get_id().toString();
                        }
                        var nullItems = trmLst.filter(function (t) { return t.guid === null; });
                        if (nullItems && nullItems.length === 0)
                            updateItemTerms(ctx, itm, trmLst, txFldName, txField, dfrd);
                    }
                }(context, item, termMatch, termList, fieldName, termObj, deferred), function (sender, args) {
                    error(args);
                });
            });
        } else {
            // really only have one
            var term = new Term(terms, null);
            var termMatch = getTermMatch(context, termSetId, terms);

            context.executeQueryAsync(function () {
                if (termMatch && termMatch.get_count() > 0) {
                    term.guid = termMatch.get_item(0).get_id().toString();
                    termList.push(term);
                    updateItemTerms(context, item, termList, fieldName, txField, deferred);
                }
            }, function (sender, args) {
                error(args);
            });

        }
    };


    /**
     * [taxonomy description]
     * @type {Object}
     */
    self.taxonomy = {
        spLibraryLoaded:  false,
        scriptLoadCallback:  [],

        errorCallback: function (err) {
            //alert(err.get_message());
        },

        setMetadataField:  function (listName, itemId, fieldName, terms) {
            var deferred = $.Deferred();
            var internalDeferred = $.Deferred();
            if (isUndefined(terms)) { return deferred.reject('Err: term not defined'); }
            var context = SP.ClientContext.get_current();
            var list = context.get_web().get_lists().getByTitle(listName);
            var item = list.getItemById(itemId);
            var field = list.get_fields().getByInternalNameOrTitle(fieldName);
            var txField = context.castTo(field, SP.Taxonomy.TaxonomyField);

            context.load(field);
            context.load(txField);
            context.load(item);

            context.executeQueryAsync(function () {
                getTermIdForTerm(context, item, terms, fieldName, txField, deferred);
            });

            return deferred.promise();
        },

        getTermName:  function (termGuid, deferred) {
            deferred = (deferred) ? deferred : $.Deferred();
            if (!SPScriptLoader.scriptsLoaded()) {
                SPScriptLoader.registerCallback('taxonomy.getTermName', self.taxonomy.getTermName, [termGuid, deferred]);
            } else {
                var termSetName = termSetName;
                var context = SP.ClientContext.get_current();
                // get Session
                var session = SP.Taxonomy.TaxonomySession.getTaxonomySession(context);
                // Term Stores
                var termStore = session.getDefaultSiteCollectionTermStore();
                var term = termStore.getTerm(termGuid);

                context.load(term);
                context.executeQueryAsync(function () {
                    console.log('Term: %o', term);
                    deferred.resolve(term.get_name());
                }, function () {
                    console.log('getTermName: failed to get termstores: %o', arguments);
                });
            }
            return deferred.promise();
        },

        addNewTerm:  function (termName, termSetId) {
            var deferred = $.Deferred();
            var context = SP.ClientContext.get_current();
            var session = SP.Taxonomy.TaxonomySession.getTaxonomySession(context);
            var ts = session.getDefaultSiteCollectionTermStore();
            context.load(session);
            context.load(ts);
            var term = { setId: termSetId, name: termName }
            context.executeQueryAsync(function (termStore, term, ctx) {
                return function () {
                    console.log('term store: %o', termStore);
                    var LCID = '1033';
                    var newGuid = new SP.Guid.newGuid();
                    var termSet = termStore.getTermSet(term.setId);
                    var newTerm = termSet.createTerm(term.name, LCID, newGuid.toString());
                    ctx.load(newTerm);
                    ctx.executeQueryAsync(function () {
                        // success
                        console.log('success term store');
                        deferred.resolve();
                    },
                    function () {
                        // failed
                        console.log('addNewTerm: failed to get term store');
                        //TODO:  get those terms that already exist and handle this error
                        deferred.resolve();

                    });
                };
            }(ts, term, context), function () {
                console.log('error');
            });
            return deferred.promise();
        },

        loadTermsByTermset:  function(context, guid, deferred){
            deferred = (deferred) ? deferred : $.Deferred();

            if (!SPScriptLoader.scriptsLoaded()) {
                SPScriptLoader.registerCallback('taxonomy.loadTermsByTermset', self.taxonomy.loadTermsByTermset, [context, guid, deferred]);
            } else {
                // get Session
                var session = SP.Taxonomy.TaxonomySession.getTaxonomySession(context);
                // Term Stores
                var termStore = session.getDefaultSiteCollectionTermStore();
                var termSet = termStore.getTermSet(guid);
                var terms = termSet.getAllTerms();

                context.load(terms);
                context.executeQueryAsync(function () {
                    console.log('taxonomy.loadTaxonomy : %o', terms);
                    var allTerms = [];
                    try {
                        var termsEnumerator = terms.getEnumerator();
                        while(termsEnumerator.moveNext()){
                            var taxTerm = termsEnumerator.get_current();
                            var term = {
                                guid: taxTerm.get_id().toString(),
                                name: taxTerm.get_name(),
                                path: taxTerm.get_pathOfTerm(),
                                isRoot: taxTerm.get_isRoot()
                            };
                            allTerms.push(term);
                        }
                        deferred.resolve(allTerms);
                    } catch(e) {
                        console.warn('exception: %o', e);
                        console.warn('guid: %o', guid);
                        if(!SPScriptLoader.isRegistered('taxonomy.loadTaxonomy'))
                            self.taxonomy.loadTermsByTermset(guid);
                    }
                }, function () {
                    console.log('failed to get termstores: %o', arguments);
                });
            }
            return deferred.promise();
        },

        loadTaxonomy:  function(termSets, deferred) {
            var deferred = (deferred) ? deferred : $.Deferred();
            if (!SPScriptLoader.scriptsLoaded()) {
                SPScriptLoader.registerCallback('taxonomy.loadTaxonomy', self.taxonomy.loadTaxonomy, [termSets, deferred]);
            } else {
                var promises = [];
                termSets.forEach(function(item){
                    try{
                        var context = SP.ClientContext.get_current();
                        promises.push(self.taxonomy.loadTermsByTermset(context, item.guid));
                    }catch(e){
                        SPScriptLoader.registerCallback('taxonomy.loadTaxonomy', self.taxonomy.loadTaxonomy, [termSets, deferred]);
                    }
                });
                $all(promises).done(function(terms){
                    var index = 0, allTerms = {};
                    terms.forEach(function(t){
                        allTerms[termSets[index].name] = t;
                        index++;
                    });
                    deferred.resolve(allTerms);
                });
            }
            return deferred.promise();
        },

        scriptBase:  '{0}//{1}/_layouts/15/'.format(document.location.protocol, document.location.host),

        protocol: (document.location.protocol.indexOf('https') > -1) ? 'https' : 'http',

    };
    /********************************/
    /* spapi/spapi.wiki.js          */
    /********************************/

    var
    /**
     * [getWikiContent description]
     * @param  {[type]} wikiConfig [description]
     * @return {[type]}            [description]
     */
    getWikiContent = function (wikiConfig) {
        var deferred = $.Deferred(),
            model = new WikiPageModel;

        getLibraryItem(wikiConfig.siteUrl, wikiConfig.libraryUrl, wikiConfig.pageName, deferred).done(function (response) {
            // function expects an array of data
            successDataHandler([response.d], model, deferred);
        }).fail(function (jqxhr, status, errMsg) {
            var err = new Event('getWikiContent fetch failed', model, errMsg, status, jqxhr.responseText);
            console.log('getWikiContent fetch failed: %o', err);
            deferred.reject(err);
        });
        return deferred.promise();
    },

    /**
     * @description
     *  creates a new SharePoint WikiPage in the default library if no library is specified
     *  the file is created in the default or root web if a siteUrl (web) is not specified
     * @param {object} wiki configuration object with the following properties:
     *  object.siteUrl:     site url to target
     *  object.libraryUrl:  Wiki library to target
     *  object.fileName:    name of file to create. do not need to specify .aspx
     * @returns: {object} file metadata
     */
    createWikiPage = function (wikiConfig) {
        var siteUrl = (wikiConfig.siteUrl) ? wikiConfig.siteUrl : '',
            deferred = $.Deferred(),
            fileUrl = '{0}/{1}'.format(wikiConfig.libraryUrl, wikiConfig.pageName),
            apiUrl = '{0}/_api/web/GetFolderByServerRelativeUrl(\'{0}/{1}\')/Files/AddTemplateFile(urlOfFile=\'/{2}\',templateFileType=1)'.format(wikiConfig.siteUrl, wikiConfig.libraryUrl, wikiConfig.fileUrl),
            options = {
                url: apiUrl,
                type: 'POST',
                headers: {
                    'Accept': 'application/json;odata=verbose;charset=utf-8',
                    'Content-Type': 'application/json;odata=verbose;charset=utf-8'
                }
            };
        self.getDigest(siteUrl).done(function (digestValue) {
            options.headers['X-RequestDigest'] = digestValue;
            $.ajax(options).done(function (data) {
                deferred.resolve(data.d);
            });
        });
        return deferred.promise();
    },

    /**
     * [saveWikiContent description]
     * @param  {[type]} wikiConfig [description]
     * @param  {[type]} data       [description]
     * @return {[type]}            [description]
     */
    saveWikiContent = function (wikiConfig, data) {
        var deferred = $.Deferred(),
            wikiModel = new WikiPageModel;
        wikiModel.listName = wikiConfig.libraryUrl;
        if (wikiConfig.siteUrl && wikiConfig.siteUrl !== '') {
            wikiModel.siteUrl = wikiConfig.siteUrl
        }
        wikiModel.data = { wikiField: data.wikiField };
        saveLibraryItemRest(wikiModel, deferred);
        saveListItemREST(wikiModel, deferred);
        return deferred.promise();
    };

    /**
     * [wiki description]
     * @type {Object}
     */
    self.wiki = {
        /**
         * [createWikiPage description]
         * @param  {[type]} wikiConfig [description]
         * @return {[type]}            [description]
         */
        createWikiPage: function (wikiConfig) {
            return createWikiPage(wikiConfig);
        },
        /**
         * [saveWikiContent description]
         * @param  {[type]} wikiConfig [description]
         * @param  {[type]} data       [description]
         * @return {[type]}            [description]
         */
        saveWikiContent: function (wikiConfig, data) {
            return saveWikiContent(wikiConfig, data);
        },
        /**
         * [getWikiContent description]
         * @param  {[type]} wikiConfig [description]
         * @return {[type]}            [description]
         */
        getWikiContent: function (wikiConfig) {
            return getWikiContent(wikiConfig);
        },
    };

    /********************************/
    /* spapi/spapi.social.js        */
    /********************************/
    self.social = {

		setLike: function (siteUrl, listName, itemId, likeState) {
	    	var deferred = $.Deferred(),
	    		listGUID = '';

	    	siteUrl = siteUrl || '';
	    	var context = new SP.ClientContext(siteUrl);
	    	list = context.get_web().get_lists().getByTitle(listName);
	    	context.load(list);
		    context.executeQueryAsync(function () {
				var listGUID = list.get_id().toString();

			    Microsoft.Office.Server.ReputationModel.Reputation.setLike(context, listGUID , itemId, likeState);

			    context.executeQueryAsync(function (response) {
		            // Do something if successful
		            console.log('successfully liked the post!');
		            deferred.resolve(response);
		        }, function (sender, args) {
		            // Do something if error
		            console.warn('Error: {0}'.format(args.get_message()));
		            deferred.reject('Error: {0}'.format(args.get_message()));
			    });
	        }, function (sender, args) {
	            // Do something if error
	            console.log('error fetching list id');
		    });
		    return deferred.promise();
		},

		checkUserLike: function (siteUrl, listName, itemId, deferred) {

      var deferred = (deferred) ? deferred : $.Deferred();

      if (!SPScriptLoader.scriptsLoaded()) {
          SPScriptLoader.registerCallback('social.checkUserLike', self.social.checkUserLike, [siteUrl, listName, itemId, deferred]);
      } else {
        siteUrl = siteUrl || '';
        var context = new SP.ClientContext(siteUrl);
        var list = context.get_web().get_lists().getByTitle(listName);
        var item = list.getItemById(itemId);

  			context.load(item, "LikedBy", "ID", "LikesCount");

  			context.executeQueryAsync(function (success) {
          // Check if the user id of the current users is in the collection LikedBy.
          var likes  = [];
          var likedBys = item.get_item('LikedBy');
          if(likedBys) {
            likedBys.forEach(function(item) {
              var like = {
                id: itemId,
                user : {
                  id: item.get_lookupId(),
                  name: item.get_lookupValue()
                }
              };
              likes.push(like);
            });
          }
          return deferred.resolve(likes);
        }, function (sender, args) {
          //Custom error handling if needed
          console.warn('error: %o', args);
  			});
      }
			   return deferred.promise();
		  }
    };

    /********************************/
    /* spapi/spapi.user.js          */
    /********************************/
    self.user = {
        /**
         * @description
         *  gets the current user profile properties
         *  along with the user's groups
         *
         * @param {int} the user id - provided by SP
         * @returns {object} an object with the use profile properties
         */
        getProfile: function () {
            var deferred = $.Deferred(),
                options = {
                    url: '/_api/SP.UserProfiles.PeopleManager/GetMyProperties',
                    type: 'GET',
                    headers: {
                        'Accept': 'application/json;odata=verbose'
                    }
            };
            $.ajax(options).done(function (results) {
                deferred.resolve(results);
            }).fail(function(jqxhr, status, errMsg){
                // MOCK: return static data
                var err = { jqxhr: jqxhr, status: status, errMsg: errMsg };
                console.error('Cannot get user profile: %o', err);
            });
            return deferred.promise();
        },

        getCurrent: function (userId) {
            var deferred = $.Deferred(),
                config = {
                    url: '/_api/Web/GetUserById({0})'.format(userId),
                    headers: {
                        'Accept': 'application/json;odata=verbose'
                    }
                };
            $.ajax(config).done(function (user) {
                // get the user's groups
                config.url = '/_api/Web/GetUserById({0})/Groups'.format(user.d.Id);
                // call API to get the groups
                $.ajax(config).done(function (groups) {
                    var currentUser = user.d;
                    currentUser.Groups = groups.d.results;
                    deferred.resolve(currentUser);
                }).fail(function (jqxhr, status, errMsg) {
                    var err = new Event('SPAPI.getSPUserProfile => /Groups fetch failed', model, errMsg, status, jqxhr.responseText);
                    console.log('getSPUserProfile => /Groups fetch failed: %o', err);
                    deferred.reject(err);
                });
            }).fail(function (jqxhr, status, errMsg) {
                var err = new Event('SPAPI.getSPUserProfile => /Groups fetch failed', model, errMsg, status, jqxhr.responseText);
                console.log('getSPUserProfile fetch failed: %o', err);
                deferred.reject(err);
            });
            return deferred.promise();
        },

        getAllUsers: function (model){
            var deferred = $.Deferred(),
                //getConfig(SITE_USERS);
                config = {
                    url: '/_api/web/siteusers',
                    headers: {
                        'Accept': 'application/json;odata=verbose'
                    }
                };
            $.ajax(config).done(function (users) {
                successDataHandler(users.d, model, deferred);
            }).fail(function (jqxhr, status, errMsg) {
                var err = new Event('SPAPI.getSPUserProfile => /Groups fetch failed', model, errMsg, status, jqxhr.responseText);
                console.log('getSPUserProfile fetch failed: %o', err);
                deferred.reject(err);
            });
            return deferred.promise();
        },

        getByAccountName: function (accountName) {
            var deferred = $.Deferred(),
                config = {
                    url: '/_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v=\'{0}\''.format(accountName),
                    headers: {
                        'Accept': 'application/json;odata=verbose'
                    }
                };
            $.ajax(config).done(function (user) {
                deferred.resolve(user);
            }).fail(function (jqxhr, status, errMsg) {
                var err = new Event('SPAPI.getByAccountName fetch failed', errMsg, status, jqxhr.responseText);
                console.log('getByAccountName fetch failed: %o', err);
                deferred.reject(err);
            });
            return deferred.promise();
        },

        find: function (query) {
            return self.getPeopleGroups(query);
        }
    };


    /**************************************/
    /* spapi/spapi.group.js    */
    /**************************************/

    self.group = {
        find: function (query) {
            return self.getPeopleGroups(query);
        }
    };
/********************************/
/* spapi/spapi.core.js          */
/********************************/
/***************************************************************************
The MIT License

Copyright (c) 2010-2015 Nuvem, Inc. http://nuveminc.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
***************************************************************************/
/**
 * @description
 *
 * SharePointAPI v0.10.111114
 * This library contains functions
 * for accessing SharePoint list/library items
 * by querying the 2010/2013 API using CSOM/REST (not yet complete).
 * The library uses a model configuration object
 * which can specify the web, list or library from which to access data.
 * A model is used to bind sharepoint item field values to a plain 'old'
 * javascript object (POJO) to be used in client-side scripts. Queries can be built
 * using CAML directly or can take the form of objectCAML (experimental).
 * Templates can be used and then bound to a DOM element on the page.
 * This feature can be use to build interactive UI's that call the SharePoint API to
 * manage data without having to create compiled web parts because it is
 * implemented as javascript on the client and requires no install package.
 *
 * @returns {object} new SharePointAPI object instance
 */

var
/**
 * @description
 * sharepoint namespace contains functions for accessing sharepoint data
 *
 * @returns {Object} sharepoint utility object
 */
SharePointAPI = function () {
    // returns public functions
    return {
        list: list,
        library: library,
        discussions: discussions,
        taxonomy: taxonomy,
        search: search,
        site: site,
        // TODO: move this into 'user'
        user: user,
        ODataFilter: ODataFilter
    }
};

var SPScriptLoader = function () {
    var scriptsLoaded = false,
        callbackStack = [],

    init = function () {
        console.log('script loader loading...');
        var scriptBase = '{0}//{1}/_layouts/15/'.format(document.location.protocol, document.location.host);
        var protocol = (document.location.protocol.indexOf('https') > -1) ? 'https' : 'http';
        require('{0}://ajax.aspnetcdn.com/ajax/4.0/1/MicrosoftAjax.js'.format(protocol), function () {
            require(scriptBase + 'SP.Runtime.js', function () {
                require(scriptBase + 'SP.js', function () {
                    require(scriptBase + 'SP.Taxonomy.js', function () {
                        console.log('script loader done...');
                        scriptsLoaded = true;
                        callbackStack.forEach(function (cb) {
                            console.log('cb: %o, args: %o', cb.name, cb.args);
                            cb.fn.apply(this, cb.args);
                        });
                    });
                });
            });
        });
    };

    registerCallback = function (name, fn, args) {
        var callback = { name: name, fn: fn, args: args };
        callbackStack.push(callback);
    };

    isRegistered = function (name){
        var cb = null;
        if(callbackStack.length > 0) {
            cb = callbackStack.filter(function(c){
                return c.name === name;
            });
        }
        return (cb.length);
    };

    init();

    return {
        registerCallback: registerCallback,
        isRegistered: isRegistered,
        scriptsLoaded: function () { return scriptsLoaded; }
    };

}();

window.SPAPI = SharePointAPI;

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
})();
