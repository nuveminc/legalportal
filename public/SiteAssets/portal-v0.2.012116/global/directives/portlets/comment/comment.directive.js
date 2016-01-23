/* COMMENT PORTLET DIRECTIVE */
LegalPortal.directive('commentPortlet', ['BASE_PATH', function (BASE_PATH) {
    var name = 'comment';

    return {
        restrict: 'A',
        templateUrl: BASE_PATH.portletUrl + '{0}/{0}.template.html'.format(name),
        scope: {
            data: '=',
            addModal: '&',
            viewModal: '&'
        },
        link: function(scope,element,attributes){
            scope.comments = scope.data;        
        }
    }
}]);