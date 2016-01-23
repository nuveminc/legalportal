
LegalPortal.controller('workgroupsController', 
    ['$scope', '$state', '$timeout', 'workgroupsRepository', 'documentRepository', '$navigation', 'BASE_PATH', 
    function ($scope, $state, $timeout, workgroupsRepository, documentRepository, $navigation, BASE_PATH) {
    'use strict';
    var peopleList = [],
        mapPeople = function(pagePeople) {
            var selectedPeople = [];
            var promises = [];
            pagePeople.forEach(function(pp){
                var deferred = $.Deferred();
                promises.push(deferred.promise());
                workgroupsRepository.getUserByAccountName(pp).done(function(user){
                    deferred.resolve(user);
                });
                $all(promises).done(function(users){
                    console.log('users--%o', users);
                    users.forEach(function(user){
                        $scope.page.people.push(user);
                    });
                });             
            });
        };
    
    $scope.page = {};
    $scope.people = [];

    console.log('$state.current.name: ', $state.current.name);
    $scope.workgroup = { name: 'Workgroup_{0}'.format($state.current.name.charAt(0).toUpperCase() + $state.current.name.slice(1)) };
    
    $scope.showEdit = function(property){
        var show = false;
        show = ($scope.page[property]) ? (Object.keys($scope.page[property]).length > 0) : false;
        return show;
    }
    
    var init = function () {
		$scope.listName = $state.current.name;
		
        workgroupsRepository.getPage($state.current.name).then(function (page) {            
           
            var imgsrc = BASE_PATH.images + 'connection-24x24.png',
                siteHref = '/{0}'.format($state.current.name);

            page = page || {};
		

			if(!isUndefined(page.aboutUs)) {
	            $timeout(function () {
	
	                $navigation.setBanner('Workgroup', page.displayTitle, siteHref, imgsrc);
	                // should be an object
	                page.importantLinks = (!page.importantLinks) ? {} : page.importantLinks;
	                // should be an object
	                page.resourceLinks = (!page.resourceLinks) ? {} : page.resourceLinks;
	                // should be an array
	                page.externalLinks = (!page.externalLinks) ? [] : page.externalLinks;
	                // should be an array
	                page.importantDocuments = (!page.importantDocuments) ? [] : page.importantDocuments;
	                // should be an array
	                page.people = (!page.people) ? [] : page.people.sort(function(obj1, obj2){ return obj1.displayName > obj2.displayName; });
	                
	                $scope.page = page;
	                $scope.page.listExists = true;           
	            });			
			} else {
			    page.listExists = false;        	
			}
        }, function (error) {
        	$timeout(function () {
			    page.listExists = false;        	
        	});
        });

        // get site map
        workgroupsRepository.getSiteMap('/childrenFamilies').done(function (site) {
            $scope.site = site;
            console.log('site map: %o', site);
        });
    };
    init();

}]);



