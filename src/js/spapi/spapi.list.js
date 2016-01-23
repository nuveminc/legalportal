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

        createList: function (name, description, listTypeId) {
            var deferred = $.Deferred();
            var options = {
                url: '',
                method: '',
                data: {
                    '__metadata': { 'type': 'SP.List' },
                    'AllowContentTypes': true,
                    'BaseTemplate': listTypeId,
                    'ContentTypesEnabled': true,
                    'Description': description,
                    'Title': name
                }
            };
            getDigest(siteUrl).done(function (digestValue) {
                options.headers['X-RequestDigest'] = digestValue;
                $.ajax(options).done(function (data) {

                }, function (error) {

                });
            }, function () {

            });
        },

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
