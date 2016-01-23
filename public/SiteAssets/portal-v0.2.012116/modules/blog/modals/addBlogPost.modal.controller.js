
LegalPortal.controller('addBlogPostModalController', 
    ['$scope', '$modalInstance', '$timeout', 'blogPostRepository', 
    function ($scope, $modalInstance, $timeout, blogPostRepository) {
    'use strict';  
    $scope.blogPost = {};
    $scope.post = blogPostRepository.post;
    
    $scope.modal = {
        error: '',
        save: function () {
            // save to API
            $scope.form.isSaving = true;
            $scope.form.validate();
            if ($scope.form.isValid) {
                $scope.blogPost.publishedDate = moment(new Date).format()
                blogPostRepository.saveListItem($scope.blogPost).done(function (data) {
                    $modalInstance.close(data);
                }).fail(function (err) {
                    $scope.form.isSaving = false;
                });
            }
        },
        cancel: function () {
            $modalInstance.dismiss('cancel');
        },
        fileDrop: function () {
            alert('override default drop');
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