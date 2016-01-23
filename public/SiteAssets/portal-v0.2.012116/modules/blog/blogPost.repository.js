
LegalPortal.service('blogPostRepository', ['$timeout', '$filter', 'dataProvider', 'authorization', function ($timeout, $filter, dataProvider, authorization) {
    'use strict';
     var self = this,
        BlogPostModel = function(){
            this.name = 'blogs';
            this.listName = 'Posts';
            this.siteUrl = '/Blog';
            this.fields = [
                { name: 'id', spField: 'Id' }
                , { name: 'title', spField: 'Title' }
                , { name: 'body', spField: 'Body' }
                , { name: 'numComments', spField: 'NumComments' }
                , { name: 'postCategory', spField: 'PostCategoryId' }
                , { name: 'publishedDate', spField: 'PublishedDate' }
                , { name: 'averageRating', spField: 'AverageRating' }
                , { name: 'ratingCount', spField: 'RatingCount' }
                , { name: 'likesCount', spField: 'LikesCount' }
                , { name: 'modified', spField: 'Modified' }
                , { name: 'created', spField: 'Created' }
                , { name: 'authorId', spField: 'AuthorId' }
                , { name: 'editor', spField: 'Editor' }
            ];
        },
        CategoryModel = function () {
            this.name = 'Blog Categories';
            this.listName = 'Categories';
            this.siteUrl = '/Blog';
            this.fields = [
                { name: 'id', spField: 'Id' }
                , { name: 'title', spField: 'Title' }
                , { name: 'color', spField: 'Color' }
                , { name: 'modified', spField: 'Modified' }
                , { name: 'created', spField: 'Created' }
            ];
        },
        CommentModel = function () {
            this.name = 'Blog Comments';
            this.listName = 'Comments';
            this.siteUrl = '/Blog';
            this.fields = [
                { name: 'id', spField: 'ID' }
                //, { name: 'contentTypeId', spField: 'ContentTypeId', readOnly: true }
                , { name: 'title', spField: 'Title' }
                , { name: 'body', spField: 'Body' }
                , { name: 'postId', spField: 'PostTitleId' }
                , { name: 'authorId', spField: 'AuthorId' }
                , { name: 'editorId', spField: 'EditorId' }
                , { name: 'modified', spField: 'Modified', readOnly: true }
                , { name: 'created', spField: 'Created', readOnly: true }
            ];
        },
        ImageModel = function () {
            this.name = 'Blog Image';
            this.listName = 'Photo';
            this.siteUrl = '/Blog';
            this.fields = [
                { name: 'author', spField: 'Author' }
                , { name: 'checkInComment', spField: 'CheckInComment' }
                , { name: 'checkOutType', spField: 'CheckOutType' }
                , { name: 'checkedOutByUser', spField: 'CheckedOutByUser' }
                , { name: 'contentTag', spField: 'ContentTag' }
                , { name: 'customizedPageStatus', spField: 'CustomizedPageStatus' }
                , { name: 'eTag', spField: 'ETag' }
                , { name: 'exists', spField: 'Exists' }
                , { name: 'length', spField: 'Length' }
                , { name: 'level', spField: 'Level' }
                , { name: 'listItemAllFields', spField: 'ListItemAllFields' }
                , { name: 'lockedByUser', spField: 'LockedByUser' }
                , { name: 'majorVersion', spField: 'MajorVersion' }
                , { name: 'minorVersion', spField: 'MinorVersion' }
                , { name: 'modifiedBy', spField: 'ModifiedBy' }
                , { name: 'name', spField: 'Name' }
                , { name: 'serverRelativeUrl', spField: 'ServerRelativeUrl' }
                , { name: 'timeCreatedTimeCreated', spField: 'TimeCreated' }
                , { name: 'timeCreated', spField: 'TimeCreated' }
                , { name: 'title', spField: 'Title' }
                , { name: 'uiVersion', spField: 'UIVersion' }
                , { name: 'uiVersionLabel', spField: 'UIVersionLabel' }
            ];
        },
        orderBy = $filter('orderBy'),
        setCategory = function (data) {
            var category = null;
            if(data.postCategory.results && data.postCategory.results.length > 0){
                var id = data.postCategory.results[0];
                category = self.post.categories.filter(function(c){
                    return c.id === id;
                })[0];
            }
            data.postCategory = category;
        },
        setPostComment = function (comment) {
            self.blogCache.forEach(function(blog){
                if(blog.id === comment.postId) {
                    if(!blog.comments) {
                        blog.comments = [comment];
                    } else {
                        blog.comments.push(comment);
                    }
                    comment.author = authorization.getUserName(comment.authorId);
                }
            });
        },
        setAuthor = function (data) {
            data.author = authorization.getUserName(data.authorId);
            return data;
        },
        /**
         * [init description]
         * @return {[type]} [description]
         */
        init = function () {
            // start with getting categories
            self.getBlogCategories();
        };
	
    /**
     * [post description]
     * @type {Object}
     */
    self.post = {
        categories: []
    };

    /**
     * [blogCache description]
     * @type {Array}
     */
    self.blogCache = [];

    self.getBlogCategories = function () {
        dataProvider.blog.getCategories(new CategoryModel).then(function (response){
            console.log('Categories: %o', response);
            response.forEach(function(category) {
                self.post.categories.push(category);
            });
            // now we can get the posts
            self.getBlogPosts();
        }, function (error) {
        	$timeout(function () {
				self.siteExists = false;
        	});
        	console.warn('error fetching blog categories');
        });
    };

    self.getBlogComments = function () {
        dataProvider.blog.getComments(new CommentModel).done(function (response){
            console.log('Comments: %o', response);
            response.forEach(function(comment) {
                setPostComment(comment);
            });
        });
    };

    self.getLikes = function () {
    	self.blogCache.forEach(function (post) {
    		if(post.likesCount && post.likesCount > 0) {
	    		self.checkUserLike(post).done(function (p) {
	    			return function (likes) {
	    				var users = [];
	    				likes.forEach(function (like) {
	    					users.push(like.user.name);
	    				});
	    				p.likeUsers = users.join(', ');
	    			}
	    		}(post));
    		}
    	});
    };

    self.getBlogPosts = function () {
        return dataProvider.blog.getPosts(new BlogPostModel()).done(function (responseData) {
            // reverse order of blog posts to put last in first
            if (responseData.length > 0) {
                responseData.reverse();
                responseData.forEach(function (d) {
                    setCategory(d);
                    setAuthor(d);
                    self.blogCache.push(d);
                });
                // get the post comments
                self.getBlogComments();
                // get the for all posts
                self.getLikes();
            }
        });
    };

    self.saveListItem = function (data) {
        var model = new BlogPostModel();
        model.data = angular.copy(data);
        // need to get the category from the mapped array
        var cat = self.post.categories.filter(function(category, indx){
            return (category.title === data.postCategory.title)
        });
        // if we have a match, then get the category
        if(cat) {
            // get the index of the category
            var index = self.post.categories.indexOf(cat[0]);
            // indices in SP are -1- based not -0-
            if(index === 0) index++;
            // set the value based on the post index value
            var value = self.post.categories[index];
            // reset the post category on the blog post to the original version
            model.data.postCategory = { results: [cat[0].id] };
        } else {
            // if we don't have a category - remove it
            delete model.data.postCategory;
        }
        // now save the post to SP
        return dataProvider.saveListItem(model).done(function (item) {
            if(!model.data.Id){
                self.blogCache.unshift(data);
            }
        });
    };

    self.saveComment = function (comment) {
        var model = new CommentModel();
        // remove unused id's
        delete comment.authorId;
        delete comment.editorId;
        model.data = comment;
        return dataProvider.list.saveItem(model).done(function (item) {
            self.blogCache.forEach(function(blog) {
                if(blog.id == item.postId){
                    $timeout(function() {
                        if(!blog.comments) {
                            blog.comments = [item];
                        } else {
                            blog.comments.unshift(item);
                        }
                    });

                }
            });
        });
    };

    self.likePost = function (post, likePost) {
    	return dataProvider.social.setLike('/blog', 'Posts', post.id, likePost);
    };

    self.checkUserLike = function (post) {
    	return dataProvider.social.checkUserLike ('/blog', 'Posts', post.id);
    };


    self.uploadItem = function (siteUrl, file, libraryName, model, folderName) {
        return dataProvider.library.uploadItem(siteUrl, file, libraryName, new ImageModel(), folderName);
    };

    self.refresh = function () {
        self.getBlogPosts();
    };
    
    /**
     * @description flag indicating site existence 
     * @type {boolean}
     */
	self.siteExists = true;   

    init();

}]);
