
LegalPortal.service('discussionRepository', 
	['$timeout', '$filter', 'dataProvider', 'BASE_PATH', 
	function ($timeout, $filter, dataProvider, BASE_PATH) {
    'use strict';
    var self = this,
        loadHandler = function () { },
		DiscussionModel = function(){
		    this.name = 'discussions',
		    this.siteUrl = BASE_PATH.subsiteUrl,
            this.listName = '',
            this.method = 'REST',
            this.fields = [
            	{ name: 'body', spField: 'Body' }
            	, { name: 'dateCreated', spField: 'Created_x0020_Date' }
            	, { name: 'modified', spField: 'Modified' }
            	, { name: 'isQuestion', spField: 'IsQuestion' }
            	, { name: 'subject', spField: 'Title' }
            	, { name: 'author', spField: 'Author' }
            	, { name: 'editor', spField: 'Editor' }
            	, { name: 'myEditor', spField: 'MyEditor' }
                , { name: 'parentFolderID', spField: 'ParentFolderID'}
            	, { name: 'parentItemEditor', spField: 'ParentItemEditor' }
                , { name: 'parentItemID', spField: 'ParentItemID' }
                , { name: 'id', spField: 'ID' }
		    	, { name: 'lastReplyBy', spField: 'LastReplyBy' }]
		},
		
        discussionBoards = {
            'JudgesDecisions': 'Judge\'s Decisions',
            'WaterCooler': 'Water Cooler'
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
		    $all(promises).then(function (results) {
		        loadHandler();
		    }, function (error) {
		        console.warn('error: loading discussions');
		    });
		};

	self.discussionBoards = discussionBoards;

	self.cache = {
	    allDiscussionPosts: []
	};

	self.registerLoadHandler = function (cb) {
	    loadHandler = cb;
	};

	self.getPosts = function (discussionBoardName) {
		// return promise
	    return dataProvider.getDiscussions(discussionBoardName).then(function (items) {

	    	// add each item to the cache
	        items.forEach(function (post) {              
	            self.cache[discussionBoardName].push(post);

	            // set additional property values
	            post.board = {
		            listName: discussionBoardName,
		            title: discussionBoards[discussionBoardName]
	            };

	            // set the post timestamp to the dateCreated
	            // timestamp is used to sort all discussions by latest date created
		        post.timestamp = $filter('date')(post.dateCreated, 'yyyy-MM-ddThh:mm:ss');          

	            // get the replies for each discussion
	            self.getReplies(post.board.listName, post.id).done(function (replies) {
                	// set the replies on the post
	                post.replies = replies;
	            	// do we have any replies
	                if(replies.length) {
		                // set the post timestamp to the dateCreated of the last reply
		                post.timestamp = $filter('date')(post.replies[post.replies.length - 1].dateCreated, 'yyyy-MM-ddThh:mm:ss');
	                }
	                $timeout(function () {
	                    self.cache['allDiscussionPosts'].push(post);
	                });
	            });
	        });
	     }, function (error) {
	     	$timeout(function () {
		     	self.list.missing.push(discussionBoardName);
	     	});
	     });
	};

	self.getReplies = function (discussionBoardName, discussionId) {
	    var replies = [], deferred = $.Deferred();
	    dataProvider.getMessages(discussionBoardName, discussionId).done(function (messages) {
	    	if(messages.length){
	            messages.forEach(function (msg) {
	                // TODO: extract model conversion (used when creating replies as well)
	                var uiMsg = {};
	                uiMsg.id = msg.id;
	                uiMsg.dateCreated = msg.dateCreated;
	                uiMsg.subject = msg.subject;
	                uiMsg.body = msg.body;
	                uiMsg.parentItemID = msg.parentItemID;
	                uiMsg.parentFolderID = msg.parentFolderID;
		            uiMsg.author = msg.author;
	                uiMsg.board = {};
	                uiMsg.board.listName = discussionBoardName;
	                uiMsg.board.title = discussionBoards[discussionBoardName];
	                replies.push(uiMsg);
	            });
	    	}	            
            deferred.resolve(replies);
        });
        return deferred.promise();
	};

	self.saveListItem = function (data) {
	    var model = new DiscussionModel(),
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
	
	self.list = {
		exists: false,
		missing: []
	};
	
	init();
	
	return self;
}]);