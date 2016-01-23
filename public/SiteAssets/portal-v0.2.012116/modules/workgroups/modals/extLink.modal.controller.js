// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.
LegalPortal.controller('extLinkModalController', ['$scope', '$modalInstance', '$timeout', 'item', 'workgroupsRepository', function ($scope, $modalInstance, $timeout, item, workgroupsRepository) {
    'use strict';

    var originalItem = angular.copy(item.linkItem);
    var linkType = item.linkType;
    $scope.newItem = (item.linkItem) ? false : true;  
    $scope.link = (item.linkItem) ? item.linkItem : {};
    $scope.page = item.page;
    $scope.isSaving = false;
    $scope.isDeleting = false;

    $scope.modal = {
        save: function () {
            $scope.form.isSaving = true;
            $scope.form.validate();

            if ($scope.form.isValid) {

                var link = angular.copy($scope.link);

                if ($scope.newItem){
                    $scope.page[linkType] = ($scope.page[linkType]) ? ($scope.page[linkType]) : [];
                    // Add the new link to linklist                    
                    $scope.page[linkType].push($scope.link);
                }
                var page = angular.copy($scope.page);

                // save the page               
                workgroupsRepository.saveListItem(page).done(function (data) {
                    $modalInstance.close(data);
                }).fail(function (err) {
                    $scope.form.isSaving = false;
                });
            }
        },
        cancel: function () {
            if(originalItem){
                angular.extend($scope.link, originalItem);
            }
            $modalInstance.dismiss('cancel');
        },
        deleteMsg: function (){
            $scope.isDeleting = true;          
        },
        delete: function(){
            // delete item
            var itemIndex = $scope.page[linkType].indexOf(item.linkItem);
            $scope.page[linkType].splice(itemIndex,1);
            // save data  
            workgroupsRepository.saveListItem($scope.page).done(function (data) {
                    $scope.isDeleting = false;
                    $modalInstance.close(data);
                }).fail(function (err) {
                    // change msg to error 
                    $scope.isDeleting = false;
                });
            //$modalInstance.dismiss('cancel');
            
        },
    };

    $scope.form = {
        validate: function () {
            var fields = ['title', 'url'];
            for (var i = 0; i < fields.length; i++) {
                var field = fields[i];
                if (isUndefined($scope.link[field]) || $scope.link[field] === '') {
                    this.error.message = this.error[field];
                    this.isValid = false;
                    break;
                }
            }
            if (!$scope.link['url'].match(/^[a-zA-Z]+:\/\//)){
                $scope.link['url'] = 'http://' + $scope.link['url'];
            }
            $timeout(function (form) {
                return function () {
                    form.error.message = '';
                    form.isValid = true;
                }
            }(this), 3500);
        },
        error: {
            title: 'Please add a title for your link.',
            url: 'The link must have an URL.',
            message: ''
        },
        isValid: true,
        isSaving: false
    };

}]);