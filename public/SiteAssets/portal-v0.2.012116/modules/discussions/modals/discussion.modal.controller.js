
LegalPortal.controller('discussionModalController', ['$scope', '$timeout', '$modalInstance', 'discussionRepository', 'item', function ($scope, $timeout, $modalInstance, discussionRepository, item) {
    'use strict';
    $scope.post = item.post || {};
    $scope.boards = item.boards || [];
    $scope.replies = item.replies || [];
    $scope.error = '';
    $scope.customToolbar = [
        ['h1','h2','h3','h4','h5','h6','p','quote','bold','italics','underline','strikeThrough','clear'],
        ['justifyLeft','justifyCenter','justifyRight','indent','outdent','wordcount','charcount']
    ];

    var scrollHeight = '0px';
    if($scope.post.replies && $scope.post.replies.length > 0) {
        '350px'
    }

    $scope.slimscrollOpts = {
        height: scrollHeight, 
        railVisible: true,
        alwaysVisible: true,
        color: '#D7DCE2'
    }; 
    
    $scope.scrollHeight = {
        height: scrollHeight
    };

    $scope.reply = function () {
        $scope.isReplying = true;
    };

    $scope.modal = {
        save: function (reply) {
            // save to API
            (reply) ? $scope.form.validate(reply) : $scope.form.validate();

            if ($scope.form.isValid) {
                $scope.form.save();
            }
        },
        cancel: function () {
            $modalInstance.dismiss('cancel');
        }
    };


    $scope.form = {
        validate: function (reply) {
            if (reply) {
                var fields = ['subject', 'body', 'reply'];
            } else {
                var fields = ['subject', 'body', 'board'];
            }
            for (var i = 0; i < fields.length; i++) {
                var field = fields[i];
                if (isUndefined($scope.post[field]) || $scope.post[field] === '' || $scope.post[field].length === 0) {
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
            subject: 'Please add a subject for your discussion post.',
            body: 'Please add a discussion body to your post.',
            board: 'Please choose a discussion board for your new subject.',
            reply: 'Please add your reply to discussion post.',
            message: ''
        },
        progress: {
            message: ''
        },
        isValid: true,
        isSaving: false,
        save: function () {
            $timeout(function () {
                $scope.form.isSaving = true;
                $scope.form.progress.message = 'Saving, please wait...';
            });
            $timeout(function () {
                discussionRepository.saveListItem($scope.post).done(function () {
                    $modalInstance.close();
                }).fail($scope.form.failure);
            });
        },
        failure: function (err) {
            console.log('Error uploading: %o', err);
            $timeout(function () {
                $scope.form.isSaving = false;
                $scope.form.isValid = false;
                $scope.form.error.message = err.msg;
            });
        }
    };

}]);