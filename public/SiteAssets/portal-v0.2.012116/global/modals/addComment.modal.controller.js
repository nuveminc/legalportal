
LegalPortal.controller('addCommentModalController', 
    ['$scope', '$modalInstance', '$timeout', 'item', 'documentRepository', 
    function ($scope, $modalInstance, $timeout, item, documentRepository) {
    'use strict';
    
    $scope.comment = {};
    
    $scope.isSaving = false;
    $scope.isDeleting = false;

    $scope.modal = {
        save: function () {
            $scope.form.isSaving = true;
            $scope.form.validate();

            if ($scope.form.isValid) {
                // Detail View - save the document comment               
                documentRepository.saveComment($scope.comment.body, item.id).done(function (data) {
                    item.comments.push(data);
                    $modalInstance.close(data);
                }).fail(function (err) {
                    $scope.form.isSaving = false;
                });
            }
        },
        cancel: function () {
            /*if(originalItem){
                $scope.person.firstName = originalItem.firstName;
                $scope.person.lastName = originalItem.lastName;
                $scope.person.alias = originalItem.alias;
            }*/
            $modalInstance.dismiss('cancel');
        }
    };

    $scope.form = {
        validate: function () {
            var fields = ['body'];
            for (var i = 0; i < fields.length; i++) {
                var field = fields[i];
                if (isUndefined($scope.comment[field]) || $scope.comment[field] === '') {
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
            comment: 'Please add a comment.',
            message: ''
        },
        isValid: true,
        isSaving: false
    };

}]);