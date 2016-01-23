// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.
LegalPortal.controller('peopleModalController', ['$scope', '$modalInstance', '$timeout', 'item', 'workgroupsRepository', 'authorization',
	function ($scope, $modalInstance, $timeout, item, workgroupsRepository, authorization) {
    'use strict';

    var originalItem = angular.copy(item.person);
    $scope.newItem = (item.person) ? false : true;  

    $scope.page = item.page;
	$scope.people = authorization.users;
    $scope.person = (item.person) ? $scope.people.filter(function(p){ return p.title == item.person.displayName; })[0] : {};
    $scope.isSaving = false;
    $scope.isDeleting = false;

    $scope.modal = {
        save: function () {
            $scope.form.isSaving = true;
            $scope.form.validate();

            if ($scope.form.isValid) {
            	// fetch user info
            	var login = $scope.person.loginName.split('|')[1];
            	console.log('person login %o', $scope.person.loginName.split('|')[1]);
            	workgroupsRepository.getUserByAccountName(login).done(function(response) {
            		console.log('response %o', response);
            		if(response.d.DisplayName){
						var user = response.d;
						
						var person = {};
						
		                if ($scope.newItem){
		                    // Add the new link to linklist 
			            	person.photoUrl = user.PictureUrl || '/SiteAssets/portal/images/no_photo.png';
			            	person.title = user.Title || '';
			            	person.displayName = user.DisplayName;
							person.mySiteUrl = user.PersonalUrl;
		                    $scope.page.people.unshift(person);
		                } else {
		                	person = $scope.page.people.filter(function(p){
		                		return p.displayName == originalItem.displayName;
		                	})[0];
	
			            	person.photoUrl = user.PictureUrl || '/SiteAssets/portal/images/no_photo.png';
			            	person.title = user.Title || '';
			            	person.displayName = user.DisplayName;
							person.mySiteUrl = user.PersonalUrl;	                	
		                }
		                
		                var page = angular.copy($scope.page);
	
		                // save the page               
		                workgroupsRepository.saveListItem(page).done(function (data) {
		                    $modalInstance.close(data);
		                }).fail(function (err) {
		                    $scope.form.isSaving = false;
		                });
            		} else {
            			$timeout(function(){
	            			$scope.form.error.message = 'Sorry, that user was not found.<br/>Please contact an administrator';
	            			$scope.form.isValid = false;
            			});
            		}
            		var t = $scope.form;
            	});
            }
        },
        cancel: function () {
            if(originalItem){
                // item.linkItem.title = originalItem.title;
                // item.linkItem.url = originalItem.url;
                $scope.person.firstName = originalItem.firstName;
                $scope.person.lastName = originalItem.lastName;
                $scope.person.alias = originalItem.alias;
            }
            $modalInstance.dismiss('cancel');
        },
        deleteMsg: function (){
            $scope.isDeleting = true;          
        },
        delete: function(){
            // delete item
            var itemIndex = $scope.page.people.indexOf(item.person);
            $scope.page.people.splice(itemIndex,1);
            // save data  
            workgroupsRepository.saveListItem($scope.page)
            	.done(function (data) {
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
            var fields = [];
            for (var i = 0; i < fields.length; i++) {
                var field = fields[i];
                if (isUndefined($scope.person[field]) || $scope.person[field] === '') {
                    this.error.message = this.error[field];
                    this.isValid = false;
                    break;
                }
            }
            if(!this.isValid) {
	            $timeout(function (form) {
	                return function () {
	                    form.error.message = '';
	                    form.isValid = true;
	                }
	            }(this), 3500);
            }
        },
        error: {
            firstName: 'Please add a first name.',
            lastName: 'Please add a last name.',
            alias: 'Please add an alias.',
            extension:  'Please add an extension',
            message: ''
        },
        isValid: true,
        isSaving: false
    };

}]);