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
