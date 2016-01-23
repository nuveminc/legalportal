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
