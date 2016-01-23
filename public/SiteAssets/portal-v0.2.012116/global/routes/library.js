
LegalPortal.config(['$stateProvider', '$urlRouterProvider', 'BASE_PATH',
    function ($stateProvider, $urlRouterProvider, BASE_PATH) {
    'use strict';

    var baseUrl = BASE_PATH.modulesUrl;

    $stateProvider
        .state('documentLibrary', {
            url: '/documentLibrary',
            templateUrl: baseUrl + 'documentLibrary/grid/gridView.html',
            controller: 'gridViewController'
        })    

        .state('documentDetails', {
            url: '/documentDetails/:id',
            templateUrl: baseUrl + 'documentLibrary/details/documentDetails.html',
            controller: 'documentDetailsController'
        })
}]);

