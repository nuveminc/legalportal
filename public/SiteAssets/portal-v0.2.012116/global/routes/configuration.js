
LegalPortal.config(['$stateProvider', '$urlRouterProvider', 'BASE_PATH',
    function ($stateProvider, $urlRouterProvider, BASE_PATH) {
    'use strict';

    var baseUrl = BASE_PATH.modulesUrl;

    $stateProvider
        .state('configuration', {
            url: '/configuration',
            templateUrl: baseUrl + 'config/views/config.default.view.html',
            controller: 'config.default.controller'
        })

        .state('config-setup', {
            url: '/config-setup',
            templateUrl: baseUrl + 'config//views/config.setup.view.html'
            //controller: 'config.setup.ontroller'
        })

        .state('portlet-values', {
            url: '/portlet-values',
            templateUrl: baseUrl + 'config//views/form.portlet-values.html',
            controller: 'configController'
        })

        .state('termstore-values', {
            url: '/termstore-values',
            templateUrl: baseUrl + 'config//views/form.termstore-values.html',
            controller: 'configController'
        });

}]);


