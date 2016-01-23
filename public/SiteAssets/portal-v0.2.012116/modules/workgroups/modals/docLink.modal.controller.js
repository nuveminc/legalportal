// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.
LegalPortal.controller('docLinkModalController', ['$scope', '$modalInstance', '$timeout', 'item', 'workgroupsRepository', 'documentRepository', function ($scope, $modalInstance, $timeout, item, workgroupsRepository, documentRepository) {
    'use strict';
    var originalItem = angular.copy(item.doc);
    $scope.documents = documentRepository.documentGrid;
    $scope.newItem = (item.doc) ? false : true;  
    //$scope.doc = (item.doc) ? convertUrl(item.doc) : {};
    
    $scope.page = item.page;
    $scope.isSaving = false;
    $scope.isDeleting = false;

    $scope.pageDocuments = [];

    $scope.documents.forEach( function(d){
        var doc = angular.copy(d);
        if ((!isUndefined(doc.groups)) && (doc.groups != null)){
            doc.groups = (Object.prototype.toString.call(doc.groups) != '[object Array]') ? doc.groups.split(", ") : doc.groups;
        }    
        var matchingGroup = doc.groups.filter(function(i) { return i == $scope.page.groupName; })[0];
        if (matchingGroup ){ 
            $scope.pageDocuments.push(doc);
        }
    });

    var getDoc = function(doc) {
        return $scope.pageDocuments.filter(function (d) {
            return d.id === doc.id;
        })[0];
    };

    $scope.doc = (item.doc) ? getDoc(item.doc) : {};


    $scope.modal = {
        save: function () {
            $scope.form.isSaving = true;
            $scope.form.validate();

            if ($scope.form.isValid) {
                var doc = angular.copy($scope.doc);

                if ($scope.newItem){
                    var link = { title: doc.title, id: doc.id };
                    // Add the new link to linklist 
                    if($scope.page[item.linkType] && $scope.page[item.linkType].length){
                        $scope.page[item.linkType].push(link);
                    } else {
                        $scope.page[item.linkType] = [link];
                    }
                } else if (originalItem != $scope.doc)
                {
                    // Add the new link to linklist under appropriate link category
                    item.doc.title = doc.title;
                    item.doc.id = doc.id;
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
                $scope.doc.title = originalItem.title;
                $scope.doc.url = originalItem.url;
            }
            $modalInstance.dismiss('cancel');
        },
        deleteMsg: function (){
            $scope.isDeleting = true;          
        },
        delete: function(){
            // delete item
            var itemIndex = $scope.page[item.linkType].indexOf(item.doc);
            $scope.page[item.linkType].splice(itemIndex,1);
            // save data  
            workgroupsRepository.saveListItem($scope.page).done(function (data) {
                    $scope.isDeleting = false;
                    $modalInstance.close(data);
                }).fail(function (err) {
                    // change msg to error 
                    $scope.isDeleting = false;
                });
            
        },
    };

    $scope.form = {
        validate: function () {
            var fields = ['title', 'id'];
            for (var i = 0; i < fields.length; i++) {
                var field = fields[i];
                if (isUndefined($scope.doc[field]) || $scope.doc[field] === '') {
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
            title: 'Please choose a document.',
            id: 'The link must have an URL.',
            message: ''
        },
        isValid: true,
        isSaving: false
    };

}]);