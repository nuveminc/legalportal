

LegalPortal.controller('blogPostModalController', 
    ['$scope', '$modalInstance', '$timeout', 'item', 'blogPostRepository', 
    function ($scope, $modalInstance, $timeout, item, blogPostRepository) {
    'use strict';
    var originalItem = angular.copy(item.blog);

    $scope.blogPost = item.blog;
    $scope.error = '';
    $scope.isSaving = false;
    $scope.updatingBlog = false;
    $scope.blogPosts = item.blogPosts;
    $scope.post = blogPostRepository.post;

    $scope.comment = {
        body: '',
        title: ''
    };

    $scope.modal = {
        //error: '',
        save: function () {
            $scope.form.isSaving = true;
            $scope.form.validate();

            if ($scope.form.isValid) {
                // save the post
                blogPostRepository.saveListItem($scope.blogPost).done(function (data) {
                    $modalInstance.close(data);
                }).fail(function (err) {
                    $scope.form.isSaving = false;
                });
            }
        },
        cancel: function () {
           // $scope.blogPost = copiedItem;
           if(originalItem){
                angular.extend($scope.blogPost, originalItem);
                if($scope.blogPost.postCategory) {
                    $scope.blogPost.postCategory = blogPostRepository.post.categories.filter(function(c){
                        return c.title === originalItem.postCategory.title; 
                    })[0];                    
                }
           }
            $modalInstance.dismiss('cancel');            
        },
        close: function () {
            $modalInstance.dismiss('close');
        },
        edit: function () {
            $scope.updatingBlog = true;
        }
    };

    $scope.modal.comment = {
        save: function () {
            $scope.form.isSaving = true;
            // the title is not used so we'll set it to be the same as the body
            $scope.comment.title = $scope.comment.body;
            $scope.comment.postId = $scope.blogPost.id;
             blogPostRepository.saveComment($scope.comment).done(function (comment) {
                $timeout(function () {
                    $scope.addComment = false;                    
                });
            }).fail(function (err) {
                $scope.form.isSaving = false;
            });
            $scope.modal.close();
        }
    };

    $scope.form = {
        validate: function () {
            var fields = ['title', 'postCategory', 'body'];
            for (var i = 0; i < fields.length; i++) {
                var field = fields[i];
                if (isUndefined($scope.blogPost[field]) || $scope.blogPost[field] === '') {
                    this.error.message = this.error[field];
                    this.isValid = false;
                    break;
                }
            }
            $timeout(function (form) {
                return function () {
                    form.error.message = '';
                    form.isValid = true;
                }
            }(this), 3500);
        },
        error: {
            title: 'Please add a title for your blog post.',
            body: 'Please add copy for your blog post.',
            category: 'Please select a category.',
            message: ''
        },
        isValid: true,
        isSaving: false
    };

}]);