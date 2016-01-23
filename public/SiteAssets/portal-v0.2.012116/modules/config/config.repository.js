
LegalPortal.service('configRepository', 
	['$timeout', '$filter', 'dataProvider', 
	function ($timeout, $filter, dataProvider) {
    'use strict';
    var self = this,
		ConfigModel = function(){
		    this.name = 'config',
            this.listName = 'Config',
            this.fields = [
            	{ name: 'name', spField: 'Title' }
            	,{ name: 'value', spField: 'Value' }]
		},

		init = function () {
		    var promises = [];
            // get all discussions per discussion board
            Object.keys(discussionBoards).forEach(function (boardName) {
            	// initialize cache array
		        self.cache[boardName] = [];
		        var promise = self.getPosts(boardName);
		        // gets original post per discussion
		        promises.push(promise);  
		    });
		    $all(promises).done(function (results) {
		        // console.log('discussion call results %o', results);
		        console.log('all discussions', self.cache['allDiscussionPosts']);
		    });
		};


	self.getConfig = function () {
		dataProvider.getListItems(model).then(function (response) {

		}, function (error) {
			console.log('error: %o', error)
		});
	};
  

	self.saveConfigItem = function (data) {
	    var model = new ConfigModel(),
            discussionBoardName = model.listName = data.board.listName;
	   
	    model.data = data;
        // convert model data from ng-model (done in spapi)
        // if a reply exists, create reply message
	    if (data.reply != null) {
	        // create new model(2) for properties ?
	        var properties = new DiscussionModel();
	        // set model(2).fields where spField = Body to data.reply
	        properties.data = {};
	        properties.data.body = data.reply;
	        // delete reply from ng-model 
	        delete data.reply;
            // set properties to model(2)
	        var discussionItem = self.cache[discussionBoardName].filter(function (d) {
	            return(d.id === data.id);
	        })[0];

	        // need to send the DTO (original SP item post) since SP will only add a reply
	        // message that is created from the original item - haven't dug far enough
	        // to see what exactly are the required fields to create this object ... 
	        return dataProvider.createMessage(discussionItem.dto, properties).done(function (parentItem) {
	            return function (m) {
	                // TODO: extract model conversion (used when creating replies as well)
	                var uiMsg = {};
	                uiMsg.id = m.get_fieldValues().ID;
	                uiMsg.dateCreated = Date.now();
	                uiMsg.subject = parentItem.subject;
	                // uiMsg.subject = parentItem.get_fieldValues().Title;
	                uiMsg.body = m.get_fieldValues().Body;
	                uiMsg.parentItemID = parentItem.id;
	                // uiMsg.parentItemID = parentItem.get_fieldValues().ID;
	                uiMsg.parentFolderID = parentItem.parentFolderId;
	                // uiMsg.parentFolderID = parentItem.get_fieldValues().ParentFolderID;
	                uiMsg.board = {};
	                uiMsg.board.listName = discussionBoardName;
	                uiMsg.board.title = discussionBoards[discussionBoardName];

	                // get the discussion post that this belongs to and update ng-model to include this reply
	                var post = self.cache.allDiscussionPosts.filter(function (p) { return p.id === uiMsg.parentItemID })[0];
	                post.replies.push(uiMsg);
	            }
	        }(discussionItem));
	    }
        // create new discussion post
	    else {
	        return dataProvider.createDiscussion(discussionBoardName, model).done(function (d) {
	            self.cache[discussionBoardName].push(d);

	            // convert item data back to ng-model
	            // (TODO: extract model conversion (used when creating posts as well))
	            var discussionId = d.get_fieldValues().ID;
	            var uiPost = {};
	            uiPost.id = d.get_fieldValues().ID;
	            uiPost.dateCreated = d.get_fieldValues().Created;
	            uiPost.subject = d.get_fieldValues().Title;
	            uiPost.body = d.get_fieldValues().Body;
	            uiPost.parentFolderID = d.get_fieldValues().ParentFolderID;  // undefined
	            uiPost.parentItemID = d.get_fieldValues().ParentItemID;  // null
	            uiPost.board = {};
	            uiPost.board.listName = discussionBoardName;
	            uiPost.board.title = discussionBoards[discussionBoardName];
	            uiPost.replies = [];
	            
	            self.cache.allDiscussionPosts.unshift(uiPost);
	        });
	    }
	};

	init();
}]);