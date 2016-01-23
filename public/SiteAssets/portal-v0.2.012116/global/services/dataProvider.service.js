
LegalPortal.service('dataProvider', ['$rootScope', '$http', 'spapi', 'BASE_PATH', function ($rootScope, $http, spapi, BASE_PATH) {
    'use strict';
    var self = this;

    //urlBase = '/api/dashboard';
    self.useStaticData = $rootScope.isStatic;

    self.getMetadataFields = function () {
        // var mockData = '../SiteAssets/laf/data/document-data-metadataFields.js'
        var mockData = 'document-data-metadataFields.js'
        return $http.get(BASE_PATH.dataUrl + mockData);
    }

    self.ODataFilter = spapi.ODataFilter;

    self.list = {
        getItems: spapi.list.getItems,
        saveItem: spapi.list.saveItem
    };
    self.getListItems = function (model){
        return self.list.getItems(model);
    };

    self.saveListItem = function (model) {
        return self.list.saveItem(model);
    };

    self.search = function (keywords) {
        return spapi.search.query(keywords);
    };

    self.field = {
        getByName: function (listName, fieldName) {
            return spapi.list.field.getByName(listName, fieldName);
        }
    };
    //self.updateListItem = function (model) {
    //    var deferred = $.Deferred();
    //    spapi.list.updateItem(model).done(function (data) {
    //        deferred.resolve(data);
    //    });
    //    return deferred;
    //};

    self.getLibraryFiles = function(model){
        return spapi.library.getFiles(model);
    };

    //self.uploadItem = function (siteUrl, fileInput, libraryName, folderName) {
    //    return spapi.library.uploadItem(siteUrl, fileInput, libraryName, folderName);
    //};

    //self.updateLibraryItem = function (model) {
    //    //return spapi.library.updateItem(model);
    //    //var deferred = $.Deferred();
    //    return spapi.library.updateItem(model);
    //    //return deferred.promise();
    //};

    self.library = {
        uploadItem: function (siteUrl, file, libraryName, model, folderName) {
            return spapi.library.uploadItem(siteUrl, file, libraryName, model, folderName);
        },
        updateItem: function (model) {
            return spapi.library.updateItem(model);
        },
        getDocumentById: function (model) {
            return spapi.library.getItem(model);
        },
        getFileInfo: function (model, expand) {
            return spapi.library.getFileInfo(model, expand);
        },
        getFiles: function (model, expand) {
            return spapi.library.getFiles(model, expand);
        },
        getAllFiles: function (model, expand) {
            return spapi.library.getAllFiles(model, expand);
        }
    };

    self.setMetadataField = function (libraryName, itemId, fieldName, term) {
        return spapi.taxonomy.setMetadataField(libraryName, itemId, fieldName, term);
    };

    self.getTermName = function (termSetname) {
        return spapi.taxonomy.getTermName(termSetname);
    }

    self.addNewTerm = function (termName, termSetId) {
        return spapi.taxonomy.addNewTerm(termName, termSetId);
    };

    self.loadTaxonomy = function (termSets) {
        return spapi.taxonomy.loadTaxonomy(termSets);
    };

    self.saveComment = function(model){
        return spapi.list.saveItem(model);
    };

    self.getComments = function(model){
        return spapi.list.getItems(model);
    };

    // discussion boards
    //self.createDiscussion = function (listTitle, properties, OnItemAdded, OnItemError) {
    //    return spapi.discussions.createDiscussion(listTitle, properties, OnItemAdded, OnItemError);
    //}

    self.getDiscussions = function (listName) {
        return spapi.discussions.getDiscussions(listName);
    };

    self.createDiscussion = function (listName, properties) {
        return spapi.discussions.createDiscussion(listName, properties);
    };

    self.getMessages = function (listName, discussionId) {
        return spapi.discussions.getMessages(listName, discussionId);
    };

    self.createMessage = function (discussionItem, properties) {
        return spapi.discussions.createMessage(discussionItem, properties);
    };


    self.workgroup = {
        getPage: function (model) {
            return spapi.list.getItem(model);
        },
        savePage: function (model) {
            return spapi.list.saveItem(model);
        }
    };

    /*  USERS */
    self.user = {
        getProfile: function(){
            console.log('called getProfile');
            return spapi.user.getProfile();
        },
        getCurrent: function (userId) {
            return spapi.user.getCurrent(userId);
        },
        getAll: function (model) {
            return spapi.user.getAllUsers(model);
        },
        getByAccountName: function(accountName) {
            return spapi.user.getByAccountName(accountName);
        }
    };

    // self.getUserProfile = function(){
    //     console.log('called getProfile');
    //     return spapi.user.getProfile();
    // },
    // self.getCurrentUser = function (userId) {
    //     return spapi.user.getCurrent(userId);
    // };

    // self.getAllUsers = function (model) {
    //     return spapi.user.getAllUsers(model);
    // };

    /* BLOGS */
    self.blog = {
        getPosts: function (model) {
            return spapi.list.getItems(model);
        },
        getCategories: function(model) {
            return spapi.list.getItems(model);
        },
        getComments: function(model) {
            return spapi.list.getItems(model);
        }
    };

    self.site = {
        getLists: function (siteUrl, model) {
            spapi.site.getLists(siteUrl, model);
        }
    };

    self.social = {
    	setLike: function (siteUrl, listName, itemId, likeState) {
    		return spapi.social.setLike(siteUrl, listName, itemId, likeState);
    	},

    	checkUserLike: function (siteUrl, listName, itemId) {
    		return spapi.social.checkUserLike(siteUrl, listName, itemId);
    	}
    };

    // added - not implemented on api
    // example of intercepting, catching and reinserting new promise

    //self.saveMetadata = function (model) {
    //    var deferred = $.Deferred();
    //    spapi.library.updateItem(model).done(function (data) {
    //        // log our call here
    //        deferred.resolve(data);
    //    }).fail(function (error) {
    //        // log our error here
    //        deferred.reject(error);
    //    });
    //    return deferred.promise()
    //};
    // end added section

    /*
    self.getAnnouncements = function(){
        var $deferred = $.Deferred(),
            announcementModel = new AnnouncementModel();

        spapi.getListItems(announcementModel).done(function(data){
            $deferred.resolve(data);
        });

        return $deferred.promise();
    };

    self.getDocuments = function(){
        var $deferred = $.Deferred(),
        var documentModel = new DocumentModel();

        spapi.getListItems(documentModel).done(function(data_docs){
            $deferred.resolve(data_docs);
        });

        return $deferred.promise();
    };

    self.getEvents= function(){
        var $deferred = $.Deferred();
        var eventModel = new EventModel();

        spapi.getListItems(eventModel).done(function(data_events){
            $deferred.resolve(data_events);
        });

        return $deferred.promise();
    };

    self.getBlogPosts= function(){
        var $deferred = $.Deferred();
        var blogPostModel = new BlogPostModel();

        spapi.getListItems(blogPostModel).done(function(data_blogPosts){
            $deferred.resolve(data_blogPosts);
        });

        return $deferred.promise();
    };

    self.getDiscussions = function(listName){
        var $deferred = $.Deferred(),
            discussionModel = new DiscussionModel();
            //waterCooler = 'WaterCooler';

        discussionModel.name = listName;
        discussionModel.listName = listName;
        spapi.getListItems(discussionModel).done(function(data_discussions ){
            $deferred.resolve(data_discussions);
        });

        return $deferred.promise();
    };
    */
}]);
