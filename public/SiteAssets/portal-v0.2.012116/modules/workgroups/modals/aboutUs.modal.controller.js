
LegalPortal.controller('aboutUsModalController', ['$scope', '$state', '$modalInstance', '$timeout', 'item', 'workgroupsRepository', function ($scope, $state, $modalInstance, $timeout, item, workgroupsRepository) {
    'use strict';
    //$scope.CF = {};
    var copiedItem = angular.copy(item);
    $scope.page = item;
    $scope.isSaving = false;
    
    $scope.modal = {
        //error: '',
        save: function () {
            $scope.form.isSaving = true;
            $scope.form.validate();

            if ($scope.form.isValid) {
                // save the page
               workgroupsRepository.saveListItem($scope.page).done(function (data) {
                   $modalInstance.close(data);
               }).fail(function (err) {
                   $scope.form.isSaving = false;
               });
            }
        },
        cancel: function () {
            $modalInstance.dismiss('cancel');
            $scope.page.aboutUs = copiedItem.aboutUs;
        },
        fileDrop: function () {
            alert('override default drop');
        }
    };


    $scope.form = {
        validate: function () {
            if (isUndefined($scope.page.aboutUs) || $scope.page.aboutUs === '') {
                this.error.message = this.error['aboutUs'];
                this.isValid = false;
            }
            $timeout(function (form) {
                return function () {
                    form.error.message = '';
                    form.isValid = true;
                }
            }(this), 3500);
        },
        error: {
            aboutUs: 'Please add copy.',
            message: ''
        },
        isValid: true,
        isSaving: false
    };

}]);