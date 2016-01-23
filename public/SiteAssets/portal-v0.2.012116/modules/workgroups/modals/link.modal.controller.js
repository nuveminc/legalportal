// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.
LegalPortal.controller('linkModalController', ['$scope', '$modalInstance', '$timeout', 'item', 'workgroupsRepository', function ($scope, $modalInstance, $timeout, item, workgroupsRepository) {
    'use strict';
    
    var originalItem = angular.copy(item.linkItem);
    $scope.newItem = (item.linkItem) ? false : true;
    $scope.link = (item.linkItem) ? item.linkItem : {};
    // set this only in the UI
    $scope.link.category = (item.key) ? item.key.replace(/_/g, ' ') : item.key;
    $scope.page = item.page;
    $scope.linkList = item.page[item.linkType];
    $scope.isSaving = false;
    $scope.isDeleting = false;

    $scope.modal = {
        save: function () {
            $scope.form.isSaving = true;
            $scope.form.validate();

            if ($scope.form.isValid) {
                // add underscore back to category name
                var category = $scope.link.category;
                category = (category) ? category.replace(/ /g,'_') : $scope.link.category;

                if ($scope.newItem){
                    // Add the new link to linklist under appropriate link category
                    $scope.linkList[category].push($scope.link);
                } else if (originalItem.category != $scope.link.category)
                {
                    var itemIndex = $scope.linkList[item.key].indexOf(item.linkItem);
                    $scope.linkList[item.key].splice(itemIndex,1);
                    // delete original item
                    console.log('delete original');

                    // Add the new link to linklist under appropriate link category
                    $scope.linkList[category].push($scope.link);
                }
                
                // remove this property before saving
                delete $scope.link.newCategory;
                delete $scope.link.category;

                var page = angular.copy($scope.page);

                // save the page
               workgroupsRepository.saveListItem($scope.page).done(function (data) {
                   $modalInstance.close(data);
               }).fail(function (err) {
                   $scope.form.isSaving = false;
               });
            }
        },
        cancel: function () {
            if(originalItem){
                $scope.link.title = originalItem.title;
                $scope.link.url = originalItem.url;
                $scope.link.category = originalItem.category;
            }
            $modalInstance.dismiss('cancel');
        },
        deleteMsg: function (){
            $scope.isDeleting = true;          
        },
        delete: function(){
            // delete item
            var itemIndex = $scope.linkList[item.key].indexOf(item.linkItem);
            $scope.linkList[item.key].splice(itemIndex,1);
            // save data  
            workgroupsRepository.saveListItem($scope.page).done(function (data) {
                    $scope.isDeleting = false;
                    $modalInstance.close(data);
                }).fail(function (err) {
                    // change msg to error 
                    $scope.isDeleting = false;
                });            
        },
        addCategory: function(){
            $scope.modal.addingCategory = true;
        },
        addingCategory: false,
        saveCategory: function(){
            var newCategory = $scope.link.newCategory;
            var newCategoryFormatted = (newCategory) ? newCategory.replace(/ /g,'_') : $scope.link.newCategory;
            $scope.linkList[newCategoryFormatted] = [];
            $scope.page[item.linkType][newCategoryFormatted] = [];
            
            var page = angular.copy($scope.page);

            workgroupsRepository.saveListItem(page).done(function (data) {
                $timeout(function(){
                    $scope.modal.addingCategory = false;
                    $scope.link.category = newCategoryFormatted.replace(/_/g,' ');
                    $scope.link.newCategory = '';
                });
            }).fail(function (err) {
               $scope.form.isSaving = false;
            });
        }
    };

    $scope.form = {
        validate: function () {
            var fields = ['title', 'url', 'category'];
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
            category: 'A category has not been chosen.',
            message: ''
        },
        isValid: true,
        isSaving: false
    };

}]);
