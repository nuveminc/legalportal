LegalPortal.directive('filePart', ['$timeout', 'workgroupsRepository', '$modal', function($timeout, workgroupsRepository, $modal) {
	return {
		restrict: 'A',
		templateUrl: '/SiteAssets/portal/app/workgroups/directives/filePart.template.html',
		scope: {
			title: '=moduleTitle',
			page: '=data',
			libraryName: '=libraryName'
		},	
		link: function(scope, element, attributes) {
			scope.module = {
				title: scope.title
			}
			console.log('page: %o', scope.page);
			workgroupsRepository.getFiles(scope.libraryName).done(function(documents){
				documents = documents.filter(function (item){
					return item.fileSystemObjectType !== 1;
				});
				$timeout(function(){
					scope.workgroupDocuments = documents;
				});
				console.log('get documents: %o', documents);
			});
		},		
		controller: function($scope) {
		    /**
		     * @description 
		     *  main open modal function
		     */
		   	var openModal = function (item) {
		        $modal.open({
		            templateUrl: '/SiteAssets/portal/app/workGroups/directives/addWorkgroupDocument.modal.html',
		            controller: 'addWorkgroupDocumentModal',
		            resolve: {
		                item: function () {
		                    return item;
		                }
		            },
		            backdrop: 'static',
		            size: 'md',
		            keyboard: false
		        }).result.then(function () {
		            // saveItem
		        }, function () {
		            // cancelEditItem
		        });
		    };
		
			$scope.openModalAddWorkgroupDocument = function(workgroupDocs, document) {
				document = document || {};
		        var item = {
		        	libraryName: $scope.libraryName,
		        	documents: workgroupDocs,
		        	document: document
		        };
		        openModal(item);
			};
			
		    $scope.openDocument = function (doc) {
		        var wopi = '/_layouts/15/WopiFrame.aspx?sourcedoc={0}/{1}&action=default'.format($scope.libraryName, doc.fileName.replace(/ /g, '%20'));
		        window.open(wopi, 'Document');
		    };
		}
	}
}]);