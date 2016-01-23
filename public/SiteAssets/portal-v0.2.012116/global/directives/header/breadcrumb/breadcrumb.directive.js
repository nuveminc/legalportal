/* BLOG PORTLET DIRECTIVE */
LegalPortal.directive('breadcrumbPortlet', ['$stateParams', '$navigation', 'BASE_PATH', function ($stateParams, $navigation, BASE_PATH) {
    return {
        restrict: 'A',
        templateUrl: BASE_PATH.globalDirectivesUrl + 'header/breadcrumb/breadcrumb.html',
        scope: {
            posts: '='
        },
        link: function(scope,element,attributes){

            scope.crumb = $navigation.crumb;

        }
    }
}]);