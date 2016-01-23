    /********************************/
    /* spapi/spapi.file.js          */
    /********************************/    


    self.file = {

    	/**
    	 * [getFilesInfo description]
    	 * @param  {[type]} model [description]
    	 * @return {[type]}       [description]
    	 */
		getFilesInfo: function(model){
		    initModel(model);
		    var siteUrl = model.siteUrl || '',
		        svcUrl = '{0}/_vti_bin/ListData.svc/{1}'.format(siteUrl, model.listName),
		        deferred = $.Deferred(),
		        options = {
		            type: 'GET',
		            url: svcUrl,
		            headers: { 'Accept': 'application/json;odata=verbose' }
		        };
		    $.ajax(options).done(function (data) {
		        successDataHandlerREST(data.d, model, deferred);
		    }).fail(function (jqxhr, status, errMsg) {
		        var err = new Event('SPAPI.getFilesfetch failed', model, errMsg, status, jqxhr.responseText);
		        console.log('getFiles fetch failed: %o', err);
		        deferred.reject(err);
		    });
		    return deferred.promise();                
		},
		  	
	    /**
	     * [saveLibraryItemREST description]
	     * @param  {[type]} model    [description]
	     * @param  {[type]} deferred [description]
	     * @return {[type]}          [description]
	     */
	    update = function (model, deferred) {
	        
	        deferred = deferred || $.Deferred();

	        var siteUrl = '';
	        var listType = getListItemType(model.listName),
	            options = {
	                url: '{0}/_api/Web/Lists/GetByTitle(\'{1}\')/Items'.format(siteUrl, model.listName),
	                type: 'POST',
	                contentType: 'application/json;odata=verbose',
	                data: JSON.stringify(model.data),
	                headers: {
	                    'Accept': 'application/json;odata=verbose',
	                }
	            };

	        // check for model (caching - not fully  implemented)
	        if (!isUndefined(model.name)) {
	            self.addModel(model);
	        } else {
	            console.log('model name is undefined.');
	        }
	        // are we saving to a different site/sub-site?
	        if (model.siteUrl) {
	            siteUrl = model.siteUrl;
	        }
	        model.data['__metadata'] = { type: listType };

	        // get the updated digest value
	        getDigest(siteUrl).done(function (digestValue) {
	            options.headers['X-RequestDigest'] = digestValue;
                // get the list item to get the current ETag value
                $.ajax({
                    url: '{0}/_api/Web/Lists/GetByTitle(\'{1}\')/Items({2})'.format(siteUrl, model.listName, model.data.ID),
                    type: 'GET',
                    headers: { 'Accept': 'application/json;odata=verbose' }
                }).done(function (item) {

                    // TODO: this should ideally be stored with the object data?
                    options.headers['Content-Type'] = 'application/json;odata=verbose';
                    options.headers['X-HTTP-Method'] = 'MERGE';
                    options.headers['If-Match'] = item.d.__metadata.etag;
                    options.url = item.d.__metadata.uri;

                    model.data['__metadata'] = { type: item.d.__metadata.type };
                    options.data = JSON.stringify(model.data)
                    console.log('Options URL in API --->' + options.url);
                    console.log('Options data in API --->' + options.data);

                    $.ajax(options).done(function (data) {
                        // NOTE: returning same item we updated - SP doesn't return anything but a response code.
                        deferred.resolve(model.data);
                    }, function (jqxhr, status, errMsg) {
                        jqxhr.responseJSON.error.item = model.data;
                        deferred.resolve(jqxhr.responseJSON.error);
                    });

                }).fail(function (jqxhr, status, errMsg) {
                    var err = new Event('SPAPI.saveLibraryItem (update) failed', model, errMsg, status, jqxhr.responseText);
                    console.log('saveListItemREST (update) failed: %o', err);
                    deferred.reject(err);
                });
	        });

    		return deferred.promise();
	    }


    }