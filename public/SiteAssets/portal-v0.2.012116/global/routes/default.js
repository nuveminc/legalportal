
LegalPortal.config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
    'use strict';         
 
    $urlRouterProvider.otherwise('/dashboard');

}]);

