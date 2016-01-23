
LegalPortal.directive('butterbar', ['$rootScope', function ($rootScope) {
    return {
        link: function (scope, element, attrs) {
            element.addClass('hide');

            $rootScope.$on('$routeChangeStart', function () {
                element.removeClass('hide');
            });

            $rootScope.$on('$routeChangeSuccess', function () {
                element.addClass('hide');
            });
        }
    };
}]);


LegalPortal.directive('nvModalFooter', ['$timeOut', function ($timeOut) {
    return {
        link: function (scope, element, attrs) {

        }
    };
}]);

