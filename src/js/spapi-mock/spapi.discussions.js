/***********************************/
/* spapi-mock/spapi.discussions.js */
/***********************************/

var discussions = (function(){

	var prefix = 'Discussions.{0}';
	function getDiscussions (listName, expand) {
		var deferred = $.Deferred(),
			config = {
				method: 'GET',
				url: '/api/' + prefix.format(listName)				
			};
		$.ajax(config).done(function (data) {
			var posts = [];
			var arrayIndex = Object.keys(data).length - 1;
			var items = data[arrayIndex]._Child_Items_;
	        items.forEach(function (d) {
                // TODO: extract model conversion (used when creating posts as well)
	            var discussionId = d.ID;
	            var uiPost = {};
	            uiPost.id = d.ID;
	            uiPost.dateCreated = d.Created;
	            uiPost.subject = d.Title;
	            uiPost.body = d.Body;
	            uiPost.parentFolderID = d.ParentFolderID;  // undefined
	            uiPost.parentItemID = d.ParentItemID;  // null
	            uiPost.author = d.Author.LookupId;

	            posts.push(uiPost);
	            // uiPost.author = ( id: d.Author.LookupId, value: d.Author.LookupValue };
	            // uiPost.board = {
		           //  listName: listName,
		           //  title: discussionBoards[discussionBoardName]           
	            // };

	            // self.getReplies(uiPost.board.listName, uiPost.id).done(function (replies) {
	            //     uiPost.replies = replies;
	            //     $timeout(function () {
	            //         self.cache['allDiscussionPosts'].push(uiPost);
	            //     });
	            // });
	        });
			deferred.resolve(posts);
		}).fail(function () {
			deferred.reject('not found');
		});
		return deferred.promise();
	};

	function createDiscussion (model, expand) {
		var deferred = $.Deferred();
		setTimeout(function() {
			deferred.resolve({});
		}, 10);
		return deferred.promise();
	};

	function getMessages (model, expand) {
		var deferred = $.Deferred();
		setTimeout(function() {
			deferred.resolve({});
		}, 10);
		return deferred.promise();
	};

	function createMessage (model, expand) {
		var deferred = $.Deferred();
		setTimeout(function() {
			deferred.resolve({});
		}, 10);
		return deferred.promise();
	};

	return {
		getDiscussions: getDiscussions,
		createDiscussion: createDiscussion,
		getMessages: getMessages,
		createMessage: createMessage
	};
})();