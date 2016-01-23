    /********************************/
    /* spapi/spapi.field.json       */
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