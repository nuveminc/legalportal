
LegalPortal.config(['$stateProvider', '$urlRouterProvider', 'BASE_PATH',
    function ($stateProvider, $urlRouterProvider, BASE_PATH) {
    'use strict';

    var baseUrl = BASE_PATH.modulesUrl;

    $stateProvider

        .state('employeeBenefits', {
            url: '/employeeBenefits',
            templateUrl: baseUrl + 'staffresources/blankTemplate.html',
            //controller: 'staffresourcesController'
        })
        .state('policies', {
            url: '/policies',
            templateUrl: baseUrl + 'staffresources/blankTemplate.html',
            //controller: 'staffresourcesController'
        })
        .state('cba', {
            url: '/cba',
            templateUrl: baseUrl + 'staffresources/blankTemplate.html',
            //controller: 'staffresourcesController'
        })
        .state('paylocity', {
            url: '/paylocity',
            templateUrl: baseUrl + 'staffresources/blankTemplate.html',
            //controller: 'staffresourcesController'
        })
        .state('staffTraining', {
            url: '/staffTraining',
            templateUrl: baseUrl + 'staffresources/blankTemplate.html',
            //controller: 'staffresourcesController'
        })
        .state('forms', {
            url: '/forms',
            templateUrl: baseUrl + 'staffresources/blankTemplate.html',
            //controller: 'staffresourcesController'
        })
        .state('officeAdmin', {
            url: '/officeAdmin',
            templateUrl: baseUrl + 'staffresources/blankTemplate.html',
            //controller: 'staffresourcesController'
        })                

}]);