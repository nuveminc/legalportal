
LegalPortal.config(['$stateProvider', '$urlRouterProvider', 'BASE_PATH',
    function ($stateProvider, $urlRouterProvider, BASE_PATH) {
    'use strict';

    var baseUrl = BASE_PATH.modulesUrl;

    $stateProvider
      .state('/', {
          url: '/dashboard',
          templateUrl: baseUrl + 'dashboard/dashboard.html',
          controller: 'dashboardController'
      })

      .state('dashboard', {
          url: '/dashboard',
          templateUrl: baseUrl + 'dashboard/dashboard.html',
          controller: 'dashboardController'
      })

      .state('howTo', {
          url: '/howto',
          templateUrl: baseUrl + 'howTo/howTo.html',
          controller: 'howToController'
      });
}]);
