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
