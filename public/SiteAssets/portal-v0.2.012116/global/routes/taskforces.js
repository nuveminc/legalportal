
LegalPortal.config(['$stateProvider', '$urlRouterProvider', 'BASE_PATH',
    function ($stateProvider, $urlRouterProvider, BASE_PATH) {
    'use strict';

    var baseUrl = BASE_PATH.modulesUrl;

    $stateProvider

        .state('civilRights', {
            url: '/civilRights',
            templateUrl: baseUrl + 'taskforces/blankTemplate.html',
            controller: 'taskforcesController'
        })
        .state('domesticViolence', {
            url: '/domesticViolence',
            templateUrl: baseUrl + 'taskforces/blankTemplate.html',
            controller: 'taskforcesController'
        })
        .state('HIVAIDS', {
            url: '/HIVAIDS',
            templateUrl: baseUrl + 'taskforces/blankTemplate.html',
            controller: 'taskforcesController'
        })
        .state('peopleDisabilities', {
            url: '/peopleDisabilities',
            templateUrl: baseUrl + 'taskforces/blankTemplate.html',
            controller: 'taskforcesController'
        })          
        .state('seniors', {
            url: '/seniors',
            templateUrl: baseUrl + 'taskforces/blankTemplate.html',
            controller: 'taskforcesController'
        })          
        .state('suburbanClients', {
            url: '/suburbanClients',
            templateUrl: baseUrl + 'taskforces/blankTemplate.html',
            controller: 'taskforcesController'
        })
        .state('veterans', {
            url: '/veterans',
            templateUrl: baseUrl + 'taskforces/blankTemplate.html',
            controller: 'taskforcesController'
        })
        .state('attorneysFeesCommittee', {
            url: '/attorneysFeesCommittee',
            templateUrl: baseUrl + 'taskforces/blankTemplate.html',
            controller: 'taskforcesController'
        })
        .state('employeeRecognitionCommittee', {
            url: '/employeeRecognitionCommittee',
            templateUrl: baseUrl + 'taskforces/blankTemplate.html',
            controller: 'taskforcesController'
        })
        .state('ethicsCommittee', {
            url: '/ethicsCommittee',
            templateUrl: baseUrl + 'taskforces/blankTemplate.html',
            controller: 'taskforcesController'
        })

        .state('executiveCommittee', {
            url: '/executiveCommittee',
            templateUrl: baseUrl + 'taskforces/blankTemplate.html',
            controller: 'taskforcesController'
        })
        .state('lepCommittee', {
            url: '/lepCommittee',
            templateUrl: baseUrl + 'taskforces/blankTemplate.html',
            controller: 'taskforcesController'
        })
        .state('summerInternCommittee', {
            url: '/summerInternCommittee',
            templateUrl: baseUrl + 'taskforces/blankTemplate.html',
            controller: 'taskforcesController'
        })
}]);