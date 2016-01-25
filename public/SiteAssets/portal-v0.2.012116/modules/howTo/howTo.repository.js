LegalPortal.service('howToRepository',
    ['$timeout', 'authorization', 'dataProvider', 'BASE_PATH', 
    function($timeout, authorization, dataProvider, BASE_PATH){
    'use strict';
    var self = this,      
    DocumentModel = function (id) {
        this.data = {};
        this.name = 'howTo';
	    this.siteUrl = BASE_PATH.subsiteUrl,
        this.listName = 'HowTo';
        this.fields = [
            { name: 'id', spField: 'Id' }
            , { name: 'title', spField: 'Title' }
            , { name: 'fileName', spField: 'Name' }
            , { name: 'category', spField: 'CategoryValue' }
            , { name: 'description', spField: 'DocumentDescription' }
            , { name: 'dateCreated', spField: 'Created' }
            , { name: 'submittedBy', spField: 'CreatedById' }
            , { name: 'modified', spField: 'Modified' }
        ]
    },
    init = function () {
        if(authorization.users.length > 0){
            self.getDocuments();
            self.getCategories();
        } else {
            authorization.registerUsersCallback(self.getDocuments);
            authorization.registerUsersCallback(self.getCategories);
        }
    };    
    
    self.documentCache = [];
    self.howToCategoryCache = [];
    
    self.getCategories = function () {
        console.log('get categories'); 
        dataProvider.field.getByName('HowTo', 'Category').done(function (response) {
            console.log('HowTo categories: %o', response);
            if (response.d) {
                var categories = (response.d.results[0]) ? response.d.results[0].Choices.results : [];
                categories.forEach(function(category){
                    self.howToCategoryCache.push(category);
                });
            }
        });
    };

    self.getDocuments = function () {
        console.log('get documents'); 
        dataProvider.library.getFiles(new DocumentModel).done(function (responseData) {
            console.log('HowTo: %o', responseData);
            if (responseData.length > 0) {
                responseData.reverse();
                responseData.forEach(function (d) {
                    d.author = authorization.users.filter(function(u){
                        return u.id === d.submittedBy;
                    })[0];
                    self.documentCache.push(d);
                });
            }
        });

    };
    
    self.uploadItem = function (siteUrl, file, libraryName, model, folderName) {
        var model = new DocumentModel();
        return dataProvider.library.uploadItem(siteUrl, file, libraryName, model, folderName);
    }; 
    
    self.updateItem = function (data) {

        var model = new DocumentModel();
        // set the data on the model
        model.data = data;
        // categoryValue is returned property name is category
        model.data.category = model.data.categoryValue; 
        // must remove this field or update fails
        delete model.data.fileName; 

        return dataProvider.library.updateItem(model).done(function (item) {
            if(!model.data.ID){
            	data.category = data.categories[data.Category.results[0]];
            	data.author = { title: authorization.user.displayName };
                self.documentCache.unshift(data);
            }
        });
    };
    
    init();
        
    return self;
}]);