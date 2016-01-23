/* BANNER PORTLET DIRECTIVE */
LegalPortal.directive('bannerPortlet', ['BASE_PATH', 'authorization', function (BASE_PATH, authorization) {
    return {
        restrict: 'A',
        templateUrl: BASE_PATH.globalDirectivesUrl + 'header/banner/banner.html',
        scope: {
            posts: '=',
            initialized: '='
        },
        link: function(scope, element, attributes){
            scope.banner = {
                logoUrl: BASE_PATH.images + 'logo.png',
                user: authorization.user,
                initialized: scope.initialized
            };
        }
    }
}]);