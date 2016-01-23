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
