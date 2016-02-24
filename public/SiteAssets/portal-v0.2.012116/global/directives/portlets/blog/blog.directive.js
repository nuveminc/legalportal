/* BLOG PORTLET DIRECTIVE */
LegalPortal.directive('blogPortlet', ['$timeout', 'authorization', 'blogPostRepository', 'BASE_PATH',
	function ($timeout, authorization, blogPostRepository, BASE_PATH) {
    return {
        restrict: 'A',
        templateUrl: BASE_PATH.portletUrl + 'blog/blog.template.html',
        scope: {
            data: '=',
            addModal: '&',
            viewModal: '&'
        },
        link: function(scope,element,attributes){
            scope.posts = scope.data;
        },
        controller: function($scope){
			
            $scope.setCategoryColor = function(blog) {
                var bg = { 'background-color': '#c0c0c0' };
                if(blog.postCategory){
                    bg = { 'background-color': blog.postCategory.color || 'red' };
                }
                return bg;
            };

			$scope.likePost = function (post) {
				var likePost = true;
				if(post.likeUsers && post.likeUsers.indexOf(authorization.user.displayName) > -1) {
					likePost = false;
				}

				blogPostRepository.likePost(post, likePost).done(function (response) {
					$timeout(function () {
						if(likePost) {
							post.likesCount = post.likesCount + 1;
							// initialize the property
							if(!post.likeUsers) { post.likeUsers = ''; }
							post.likeUsers += authorization.user.displayName;
						} else {
							post.likesCount = post.likesCount - 1;
							var users = post.likeUsers.split(', ');
							var index = users.indexOf(authorization.user.displayName);
							users.splice(index, 1);
							post.likeUsers = users.join(', ');
						}
					});
				});

				post.isLiked = likePost;

				scope.$watch(function(){
				    return blogPostRepository.siteExists;
				}, function (newValue) {
					console.warn('blog siteExists changed: %o', blogPostRepository.siteExists);
				    scope.portlet.siteExists = newValue;
				});
			};

			$scope.showUserLikes = function (post) {
				if(post.likeUsers && post.likeUsers.indexOf(authorization.user.displayName) > -1) {
					return true;
				} else {
					return false;
				}
			};

			$scope.portlet = {
				refresh: function () {
					blogPostRepository.refresh();
				},
				siteExists: blogPostRepository.siteExists
			};

        }
    }
}]);
