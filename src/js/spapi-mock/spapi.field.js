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