/* DOCUMENT PORTLET DIRECTIVE */
LegalPortal.directive('documentPortlet', ['BASE_PATH', function (BASE_PATH) {
    return {
        restrict: 'A',
        templateUrl: BASE_PATH.portletUrl + 'document/document.template.html',
        scope: { 
        	data: '=',
            addModal: '&'
        },
        link: function(scope,element,attributes){
        	scope.documents = scope.data;
        }
    }
}]);