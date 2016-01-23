    /********************************/
    /* spapi/spapi.wiki.js          */
    /********************************/ 

    var    
    /**
     * [getWikiContent description]
     * @param  {[type]} wikiConfig [description]
     * @return {[type]}            [description]
     */
    getWikiContent = function (wikiConfig) {
        var deferred = $.Deferred(),
            model = new WikiPageModel;

        getLibraryItem(wikiConfig.siteUrl, wikiConfig.libraryUrl, wikiConfig.pageName, deferred).done(function (response) {
            // function expects an array of data
            successDataHandler([response.d], model, deferred);
        }).fail(function (jqxhr, status, errMsg) {
            var err = new Event('getWikiContent fetch failed', model, errMsg, status, jqxhr.responseText);
            console.log('getWikiContent fetch failed: %o', err);
            deferred.reject(err);
        });
        return deferred.promise();
    },

    /**
     * @description
     *  creates a new SharePoint WikiPage in the default library if no library is specified
     *  the file is created in the default or root web if a siteUrl (web) is not specified
     * @param {object} wiki configuration object with the following properties:
     *  object.siteUrl:     site url to target
     *  object.libraryUrl:  Wiki library to target
     *  object.fileName:    name of file to create. do not need to specify .aspx
     * @returns: {object} file metadata
     */
    createWikiPage = function (wikiConfig) {
        var siteUrl = (wikiConfig.siteUrl) ? wikiConfig.siteUrl : '',
            deferred = $.Deferred(),
            fileUrl = '{0}/{1}'.format(wikiConfig.libraryUrl, wikiConfig.pageName),
            apiUrl = '{0}/_api/web/GetFolderByServerRelativeUrl(\'{0}/{1}\')/Files/AddTemplateFile(urlOfFile=\'/{2}\',templateFileType=1)'.format(wikiConfig.siteUrl, wikiConfig.libraryUrl, wikiConfig.fileUrl),
            options = {
                url: apiUrl,
                type: 'POST',
                headers: {
                    'Accept': 'application/json;odata=verbose;charset=utf-8',
                    'Content-Type': 'application/json;odata=verbose;charset=utf-8'
                }
            };
        self.getDigest(siteUrl).done(function (digestValue) {
            options.headers['X-RequestDigest'] = digestValue;
            $.ajax(options).done(function (data) {
                deferred.resolve(data.d);
            });
        });
        return deferred.promise();
    },

    /**
     * [saveWikiContent description]
     * @param  {[type]} wikiConfig [description]
     * @param  {[type]} data       [description]
     * @return {[type]}            [description]
     */
    saveWikiContent = function (wikiConfig, data) {
        var deferred = $.Deferred(),
            wikiModel = new WikiPageModel;
        wikiModel.listName = wikiConfig.libraryUrl;
        if (wikiConfig.siteUrl && wikiConfig.siteUrl !== '') {
            wikiModel.siteUrl = wikiConfig.siteUrl
        }
        wikiModel.data = { wikiField: data.wikiField };
        saveLibraryItemRest(wikiModel, deferred);
        saveListItemREST(wikiModel, deferred);
        return deferred.promise();
    };  

	/**
	 * [wiki description]
	 * @type {Object}
	 */
    self.wiki = {
    	/**
    	 * [createWikiPage description]
    	 * @param  {[type]} wikiConfig [description]
    	 * @return {[type]}            [description]
    	 */
	    createWikiPage: function (wikiConfig) {
	        return createWikiPage(wikiConfig);
	    },
	    /**
	     * [saveWikiContent description]
	     * @param  {[type]} wikiConfig [description]
	     * @param  {[type]} data       [description]
	     * @return {[type]}            [description]
	     */
	    saveWikiContent: function (wikiConfig, data) {
	        return saveWikiContent(wikiConfig, data);
	    },
	    /**
	     * [getWikiContent description]
	     * @param  {[type]} wikiConfig [description]
	     * @return {[type]}            [description]
	     */
	    getWikiContent: function (wikiConfig) {
	        return getWikiContent(wikiConfig);
	    },
    };