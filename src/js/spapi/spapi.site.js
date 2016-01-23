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
                    console.log('site list data: %o', data);
                    successDataHandler(data.d, model, deferred);
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