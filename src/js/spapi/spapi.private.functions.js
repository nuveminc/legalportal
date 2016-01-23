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