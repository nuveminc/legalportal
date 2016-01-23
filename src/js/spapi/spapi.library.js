    /********************************/
    /* spapi/spapi.library.js       */
    /********************************/   

    var convertDataURLToBinary = function (dataURL) {
        var base64Marker = ';base64,';
        var base64Index = dataURL.indexOf(base64Marker) + base64Marker.length;
        var base64 = dataURL.substring(base64Index);
        var raw = window.atob(base64);
        var rawLength = raw.length;
        var array = new window.Uint8Array(new window.ArrayBuffer(rawLength));

        for (var i = 0; i < rawLength; i++) {
            array[i] = raw.charCodeAt(i);
        }
        return array;
    },

    /**
     * @description: uploads document to SP
     *  call this function to upload a document to an SP library
     *  when completed the deferred resolve or rejected promise is invoked
     * 
     * @param {string} library name (the display name)
     * @param {string} file name to save
     * @param {string} path to folder (e.g. /foldername)
     * @param {binary} file data in binary format
     * @param {string} request digest security token
     * @param {object} jquery deferred
     */
    performUpload = function (siteUrl, libraryName, fileName, folderName, documentModel, fileData, digest, deferred) {
        // TODO(mpace): make the baseUrl a global so we don't need to duplicate
        var baseUrl = '{0}/_api/web/GetFolderByServerRelativeUrl(\'{0}/{1}\')/Files/Add(url=\'{2}\',overwrite=true)'.format(siteUrl, libraryName, fileName);

        // use ajax to upload the file
        var config = {
            url: baseUrl,
            type: 'POST',
            headers: {
                'Accept': 'application/json;odata=verbose',
                'X-RequestDigest': digest
            },
            contentType: 'application/json;odata=verbose',
            processData: false,
            binaryStringRequestBody: true,
            data: fileData
        };

        $.ajax(config).done(function(data){
            console.log('success! data: %o', data);
            var document = new DocumentModel(data.d);
            // get document data - data returned DOES NOT CONTAIN DOCUMENT ID
            document = convertItem(data.d, document);
            // this call is to get the DOCUMENT ID
            $.ajax({
                url: document.listItemAllFieldsUrl,
                type: "GET",
                dataType: "json",
                headers: {
                    Accept: "application/json;odata=verbose"
                }
            }).done(function (data) {
                // convert the data returned into the user supplied Document model
                // so we can return a document object with a DOCUMENT ID
                documentModel = convertItem(data.d, documentModel);
                documentModel.data = {};
                Object.keys(document).forEach(function (dp) {
                    Object.keys(documentModel).forEach(function (dmp) {
                        if (dp !== dmp) {
                            documentModel.data[dp] = document[dp];
                        }
                    });
                });
                deferred.resolve(documentModel);
            }).fail(function (jqxhr, status, errorMsg) {
                console.log('error-jqxhr: %o', jqxhr);
                console.log('error-status: %o', status);
                console.log('error-message: %o', errorMsg);
                var error = { jqxhr: jqxhr, status: status, errorMsg: errorMsg };
                deferred.reject(error);
            });
        }).fail(function(jqxhr, status, errorMsg){
            console.log('error-jqxhr: %o', jqxhr);
            console.log('error-status: %o', status);
            console.log('error-message: %o', errorMsg);
            var error = { jqxhr: jqxhr, status: status, errorMsg: errorMsg };
            deferred.reject(error);
        });
    },

    /**
     * @description: convert file data for http post
     *  
     */
    processUpload = function (siteUrl, fileInput, docLibraryName, folderName, model, digest, deferred) {
        // process upload
        var reader = new FileReader();
        siteUrl = siteUrl || '';
        reader.onload = function (file) {
            var fileData = convertDataURLToBinary(file.target.result);
            performUpload(siteUrl, docLibraryName, fileInput.name.replace(/\'/,''), folderName, model, fileData, digest, deferred);
        };
        reader.readAsDataURL(fileInput);
    };    

	self.library = {

        getProperties: function (libraryName) { },
        createLibrary: function () { },
        deleteLibrary: function () { },
        /**
         * [getFiles description]
         * @param  {[type]} model [description]
         * @return {[type]}       [description]
         */
        getFiles: function (model) {
            var deferred = $.Deferred();
            // initialize model
            initModel(model);
            // remove the viewTemplate object so 
            // this model does not update the view
            delete model.viewTemplate;
            self.list.getItems(model, deferred);

            return deferred;
        },
        /**
         * [getAllFiles description]
         * @param  {[type]} model  [description]
         * @param  {[type]} expand [description]
         * @return {[type]}        [description]
         */
        getAllFiles: function (model, expand) {
            var siteUrl = (model.siteUrl) ? model.siteUrl : '',
                $expand = (expand) ? '?$expand=CreatedBy, ModifiedBy' : '',
                deferred = $.Deferred(),
                options = {
                type: 'GET',
                url: SPLIST_ITEMS_BY_LIST_DATA_SVC.format(siteUrl, model.listName) + $expand,
                headers: { 'Accept': 'application/json;odata=verbose' }
            };
            $.ajax(options).done(function (data) {
                successDataHandler(data.d, model, deferred);
            }).fail(function (jqxhr, status, errMsg) {
                var err = new Event('SPAPI.getFileInfo fetch failed', model, errMsg, status, jqxhr.responseText);
                console.log('getFileInfo fetch failed: %o', err);
                deferred.reject(err);
            });
            return deferred.promise();
        },
        /**
         * [getAllFiles description]
         * @param  {[type]} model  [description]
         * @param  {[type]} expand [description]
         * @return {[type]}        [description]
         */
        getFileInfo: function (model, expand) {
            var siteUrl = (model.siteUrl) ? model.siteUrl : '',
                $expand = (expand) ? '?$expand=CreatedBy, ModifiedBy' : '',
                deferred = $.Deferred(),
                options = {
                type: 'GET',
                url: SPLIST_ITEM_BY_LIST_DATA_SVC.format(siteUrl, model.listName, model.data.id) + $expand,
                headers: { 'Accept': 'application/json;odata=verbose' }
            };
            $.ajax(options).done(function (data) {
                var file = convertItem(data.d, model);
                deferred.resolve(file);
            }).fail(function (jqxhr, status, errMsg) {
                var err = new Event('SPAPI.getFileInfo fetch failed', model, errMsg, status, jqxhr.responseText);
                console.log('getFileInfo fetch failed: %o', err);
                deferred.reject(err);
            });
            return deferred.promise();
        },        
        /**
         * [getItems description]
         * @param  {[type]} model [description]
         * @return {[type]}       [description]
         */
        getItems: function (model) {
            return self.getLibraryItems(model);
        },

        /**
         * @description
         *  uploads the user provided document to the specified library location
         * @param {element} file is a reference to the file from the file input element
         * @param {string}  name of folder - if one exists
         * @param {string}  the digest value. this is optional - if not provided will be generated
         *                  note: this is here for backwards compatibility
         * TODO: docLibrary is hard-coded - use passed in param
         */
        saveDocument: function (siteUrl, file, libraryName, model, folderName) {
            var deferred = $.Deferred();
            self.getDigest(siteUrl).done(function (digestValue) {
                processUpload(siteUrl, file, libraryName, folderName, model, digestValue, deferred);
            });
            return deferred.promise();
        },
        /**
         * @description: uploads a file to a document library
         * 
         * @param {string} siteUrl is the sub-site - items are saved to the root site by default
         * @param {html element} the fileInput element retrieved by jQuery(lite)
         * @param {libraryName} name of the library to save to (e.g. Share Documents)
         * @param {folderName} name of the folder (if there is one - shouldn't be...)
         * @returns {object} a promise
         */
        uploadItem: function (siteUrl, fileInput, libraryName, model, folderName) {
            return self.library.saveDocument(siteUrl, fileInput, libraryName, model, folderName);
        },
        //createItem: function (model) { },
        updateItem: function (model) {
            return self.list.updateItem(model);
            //var deferred = $.Deferred();
            //setTimeout(function () {
            //    var jqxhr = {},
            //        status = 500,
            //        msg = 'SPAPI: code not done yet';
            //    deferred.reject(jqxhr, status, msg);
            //}, 3000)
            //return deferred.promise();
        },
        /**
         * [getItem description]
         * @param  {[type]} model [description]
         * @return {[type]}       [description]
         */
        getItem: function (model) {
            var deferred = $.Deferred();
            self.list.getItem(model, deferred);
            return deferred.promise();
        },
        /**
         * [deleteItem description]
         * @param  {[type]} model [description]
         * @return {[type]}       [description]
         */
        deleteItem: function (model) { }
    };
