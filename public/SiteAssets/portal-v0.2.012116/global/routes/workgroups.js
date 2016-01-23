
LegalPortal.config(['$stateProvider', '$urlRouterProvider', 'BASE_PATH',
    function ($stateProvider, $urlRouterProvider, BASE_PATH) {
    'use strict';

    var baseUrl = BASE_PATH.modulesUrl;

    $stateProvider

        .state('accountingFinance', {
            url: '/accountingFinance',
            templateUrl: baseUrl + 'workgroups/workgroup.html',
            controller: 'workgroupsController'
        })
        .state('administrationSupport', {
            url: '/administrationSupport',
            templateUrl: baseUrl + 'workgroups/workgroup.html',
            controller: 'workgroupsController'
        })
        .state('childrenFamilies', {
            url: '/childrenFamilies',
            templateUrl: baseUrl + 'workgroups/workgroup.html',
            controller: 'workgroupsController'
        })
        .state('civilPractice', {
            url: '/civilPractice',
            templateUrl: baseUrl + 'workgroups/workgroup.html',
            controller: 'workgroupsController'
        })
        .state('clientScreeningUnit', {
            url: '/clientScreeningUnit',
            templateUrl: baseUrl + 'workgroups/workgroup.html',
            controller: 'workgroupsController'
        })
        .state('clientSupportServices', {
            url: '/clientSupportServices',
            templateUrl: baseUrl + 'workgroups/workgroup.html',
            controller: 'workgroupsController'
        })         
        .state('communityEngagementUnit', {
            url: '/communityEngagementUnit',
            templateUrl: baseUrl + 'workgroups/workgroup.html',
            controller: 'workgroupsController'
        })
        .state('consumer', {
            url: '/consumer',
            templateUrl: baseUrl + 'workgroups/workgroup.html',
            controller: 'workgroupsController'
        })
        .state('externalRelations', {
            url: '/externalRelations',
            templateUrl: baseUrl + 'workgroups/workgroup.html',
            controller: 'workgroupsController'
        })
        .state('housing', {
            url: '/housing',
            templateUrl: baseUrl + 'workgroups/workgroup.html',
            controller: 'workgroupsController'
        })
        .state('humanResources', {
            url: '/humanResources',
            templateUrl: baseUrl + 'workgroups/workgroup.html',
            controller: 'workgroupsController'
        })                
        .state('immigrantWorkersRights', {
            url: '/immigrantWorkersRights',
            templateUrl: baseUrl + 'workgroups/workgroup.html',
            controller: 'workgroupsController'
        })
        .state('informationTechnology', {
            url: '/informationTechnology',
            templateUrl: baseUrl + 'workgroups/workgroup.html',
            controller: 'workgroupsController'
        })                
        .state('training', {
            url: '/training',
            templateUrl: baseUrl + 'workgroups/workgroup.html',
            controller: 'workgroupsController'
        })              
        .state('volunteerServicesUnit', {
            url: '/volunteerServicesUnit',
            templateUrl: baseUrl + 'workgroups/workgroup.html',
            controller: 'workgroupsController'
        })
        .state('publicBenefits', {
            url: '/publicBenefits',
            templateUrl: baseUrl + 'workgroups/workgroup.html',
            controller: 'workgroupsController'
        })         
}]);