
LegalPortal.controller('catLinkModalController', ['$scope', '$modalInstance', '$timeout', 'item', 'workgroupsRepository', function ($scope, $modalInstance, $timeout, item, workgroupsRepository) {
    'use strict';

    var category = angular.copy(item.category);
    $scope.key = category.replace(/_/g,' '); 
    $scope.page = item.page;
    $scope.linkList = item.page[item.linkType];
    $scope.isSaving = false;
    //$scope.error = {};

    $scope.modal = {
        save: function () {
            $scope.form.isSaving = true;
            $scope.form.validate();

            if ($scope.form.isValid) {
                var newCategory = $scope.key.replace(/ /g,'_');
                $scope.linkList[newCategory] = $scope.linkList[item.category];
                delete $scope.linkList[item.category];

                var page = angular.copy($scope.page);
                var linkList = angular.copy($scope.linkList);
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
            //$scope.key = category;
        }
    };

    $scope.form = {
        validate: function () {
            if ( isUndefined($scope.key) || $scope.key === '') {
                this.error.message = this.error['category'];
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
            category: 'Please add a category name.',
            message: ''
        },
        isValid: true,
        isSaving: false
    };

}]);