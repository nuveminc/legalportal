
LegalPortal.service('workgroupsRepository', 
    ['dataProvider', 'authorization', 'BASE_PATH',
    function (dataProvider, authorization, BASE_PATH) {
    var self = this,
        PageModel = function (name) {
            this.data = {};
            this.name = 'workgroup';
		    this.siteUrl = BASE_PATH.subsiteUrl,
            this.listName = 'Workgroups';
            this.fields = [
                { name: 'id', spField: 'ID' }
                , { name: 'title', spField: 'Title' }
                , { name: 'displayTitle', spField: 'DisplayTitle' }
                , { name: 'groupName', spField: 'GroupName' }
                , { name: 'aboutUs', spField: 'AboutUs' }
                , { name: 'importantLinks', spField: 'ImportantLinks', type: 'json' }
                , { name: 'resourceLinks', spField: 'ResourceLinks', type: 'json' }
                , { name: 'externalLinks', spField: 'ExternalLinks', type: 'json' }
                , { name: 'importantDocuments', spField: 'ImportantDocuments', type: 'json' }
                , { name: 'people', spField: 'People', type: 'json' }
            ],
            this.filter = '?$filter=Title eq \'{0}\''.format(name);
        },
        DocumentModel = function(){
            this.data = {};
            this.name = '';
            this.listName = '';
            this.fields = [
                { name: 'id', spField: 'ID' }
                , { name: 'contentTypeID', spField: 'ContentTypeID' }
                , { name: 'fileName', spField: 'Name' }
                , { name: 'title', spField: 'Title' }
                , { name: 'documentIDValue', spField: 'DocumentIDValue' }
                , { name: 'documentID', spField: 'DocumentID' }
                , { name: 'contentType', spField: 'ContentType' }
                , { name: 'created', spField: 'Created' }
                , { name: 'createdBy', spField: 'CreatedBy' }           
                , { name: 'copySource', spField: 'CopySource' }
                , { name: 'approvalStatus', spField: 'ApprovalStatus' }
                , { name: 'path', spField: 'Path' }
            ]            
        },
        PeoplePhotosModel = function (id) {
            this.data = {};
            this.name = 'peoplePhotos';
            this.listName = 'PeoplePhotos';
            this.fields = [
                { name: 'id', spField: 'ID' }
                , { name: 'context', spField: 'Context' }
                , { name: 'dateCreated', spField: 'Created' }
                , { name: 'submittedBy', spField: 'CreatedBy' }
                , { name: 'description', spField: 'DocumentDescription' }
                , { name: 'modified', spField: 'Modified' }
                , { name: 'title', spField: 'Title' }
                , { name: 'author', spField: 'Author0' }
                , { name: 'editor', spField: 'Editor' }
                , { name: 'checkoutUser', spField: 'CheckoutUser' }
                , { name: 'docType', spField: 'DocType' }
                , { name: 'groups', spField: 'Groups', type: 'multivalue' }
                , { name: 'issues', spField: 'Issues', type: 'multivalue' }
                , { name: 'taxKeywords', spField: 'TaxKeyword', type: 'multivalue' }
                , { name: 'fileName', spField: 'Name' }
            ]
        },
        ListModel = function () {
            this.name = 'Site List';
            this.listName = 'Lists';
            this.fields = [
                { name: 'allowContentTypes', spField: 'AllowContentTypes' }
                , { name: 'baseTemplate', spField: 'BaseTemplate' }
                , { name: 'baseType', spField: 'BaseType' }
                , { name: 'ContentTypesEnabled', spField: 'ContentTypesEnabled' }
                , { name: 'created', spField: 'Created' }
                , { name: 'defaultContentApprovalWorkflowId', spField: 'DefaultContentApprovalWorkflowId' }
                , { name: 'description', spField: 'Description' }
                , { name: 'direction', spField: 'Direction' }
                , { name: 'documentTemplateUrl', spField: 'DocumentTemplateUrl' }
                , { name: 'draftVersionVisibility', spField: 'DraftVersionVisibility' }
                , { name: 'enableAttachments', spField: 'EnableAttachments' }
                , { name: 'enableFolderCreation', spField: 'EnableFolderCreation' }
                , { name: 'enableMinorVersions', spField: 'EnableMinorVersions' }
                , { name: 'enableModeration', spField: 'EnableModeration' }
                , { name: 'enableVersioning', spField: 'EnableVersioning' }
                , { name: 'entityTypeName', spField: 'EntityTypeName' }
                , { name: 'forceCheckout', spField: 'ForceCheckout' }
                , { name: 'hasExternalDataSource', spField: 'HasExternalDataSource' }
                , { name: 'hidden', spField: 'Hidden' }
                , { name: 'id', spField: 'Id' }
                , { name: 'imageUrl', spField: 'ImageUrl' }
                , { name: 'irmEnabled', spField: 'IrmEnabled' }
                , { name: 'irmExpire', spField: 'IrmExpire' }
                , { name: 'irmReject', spField: 'IrmReject' }
                , { name: 'isApplicationList', spField: 'IsApplicationList' }
                , { name: 'isCatalog', spField: 'IsCatalog' }
                , { name: 'isPrivate', spField: 'IsPrivate' }
                , { name: 'itemCount', spField: 'ItemCount' }
                , { name: 'lastItemDeletedDate', spField: 'LastItemDeletedDate' }
                , { name: 'lastItemModifiedDate', spField: 'LastItemModifiedDate' }
                , { name: 'listItemEntityTypeFullName', spField: 'ListItemEntityTypeFullName' }
                , { name: 'multipleDataList', spField: 'MultipleDataList' }
                , { name: 'noCrawl', spField: 'NoCrawl' }
                , { name: 'parentWebUrl', spField: 'ParentWebUrl' }
                , { name: 'serverTemplateCanCreateFolders', spField: 'ServerTemplateCanCreateFolders' }
                , { name: 'templateFeatureId', spField: 'TemplateFeatureId' }
                , { name: 'title', spField: 'Title' }
            ]            
        },
        WikiPageModel = function () {
            this.name = 'Wiki',
            this.listName = 'SitePages',
            this.fields = [
                { name: 'id', spField: 'ID' }
                , { name: 'contentTypeId', spField: 'ContentTypeID' }
                , { name: 'fileName', spField: 'Name' }
                , { name: 'wikiContent', spField: 'WikiContent' }
                , { name: 'title', spField: 'Title' }
                , { name: 'contentType', spField: 'contentType' }
                , { name: 'created', spField: 'Created' }
                , { name: 'createdBy', spField: 'CreatedById' }
                , { name: 'modifiedBy', spField: 'ModifiedById' }
                , { name: 'copySource', spField: 'CopySource' }
                , { name: 'approvalStatus', spField: 'ApprovalStatus' }
                , { name: 'checkedOutTo', spField: 'CheckedOutTo' }
                , { name: 'checkedOutToId', spField: 'CheckedOutToId' }
                , { name: 'virusStatus', spField: 'VirusStatus' }
                , { name: 'isCurrentVersion', spField: 'IsCurrentVersion' }
                , { name: 'owsHiddenVersion', spField: 'OwsHiddenVersion' }
                , { name: 'version', spField: 'Version' }
            ]
        },       
        convertUrl = function (value) {
            if(value) {
                if(!value.length){
                    Object.keys(value).forEach(function(category){
                        if(value[category].length){
                            value[category].forEach(function(link){
                            });                        
                        }
                    });                
                } else {
                    value.forEach(function(link){
                        if(link.url){
                        }
                    });
                }
            }
            return value;
        },

        // stringifies all 'json' types so we pass 'text' 
        // rather than an object to persistence layer
        jsonStringify = function (page) {
            var data = angular.copy(page);
            var model = new PageModel();
            model.fields.forEach(function (p) {
                if(p.type && p.type === 'json'){
                    var propertyValue = convertUrl(data[p.name]);
                    data[p.name] = JSON.stringify(data[p.name]);
                }
            });
            return data; 
        };

    self.getPage = function (pageName) {
        return dataProvider.workgroup.getPage(new PageModel(pageName));
    };

    self.getPeople = function(){
        return dataProvider.getLibraryFiles(new PeoplePhotosModel());        
    };
    
    self.getUserByAccountName = function(accountName) {
        return dataProvider.user.getByAccountName(accountName);
    };    

    self.saveListItem = function(page){
        var pageModel = new PageModel(page.name);
        pageModel.data = jsonStringify(page);
        return dataProvider.workgroup.savePage(pageModel);
    };
    
    self.saveDocument = function() {}
    
    self.getFiles = function(listName) {
        var docModel = new DocumentModel(),
            deferred = new $.Deferred();
        docModel.listName = listName
        dataProvider.library.getFiles(docModel, true).done(function (response) {
            deferred.resolve(response);
        });    
        return deferred.promise()
    };

    self.getSiteMap = function (siteUrl) {
        var deferred = $.Deferred();
        /*dataProvider.site.getLists(siteUrl, new ListModel()).done(function (site) {
            var promises = [];
            var libraries = [];
            var model = {
                listName: '',
                fields: [
                    { name: 'id', spField: 'ID' }
                    , { name: 'title', spField: 'Title' }
                ]
            };
            site.libraries.forEach(function (list) {
                if(list.itemCount > 0){
                    var model = new WikiPageModel();
                    model.siteUrl = siteUrl;
                    promises.push(dataProvider.library.getAllFiles(model));
                    libraries.push(list);
                }
            });
            
            $all(promises).done(function (results) {       
                console.log('get list content: %o', results);
                var site = { libraries: [], lists: [] };
                libraries.forEach(function (library) {
                    var lib = { title: library.title, files: results[0] };
                    site.libraries.push(lib);
                });
                deferred.resolve(site);
            });
            
        });*/        
        return deferred.promise();
    }
    
    self.listExists = true;
}]);