
LegalPortal.controller('dashboardController', 
	['$scope', '$navigation', 'authorization', 'blogPostRepository', 'discussionRepository', 'documentRepository', 'eventRepository',
    function ($scope, $navigation, authorization, blogPostRepository, discussionRepository, documentRepository, eventRepository) {
        'use strict';

        $scope.dashboard = {
            events: {},
            blogPosts: [],
            outreachEvents: [],
            upcomingEvents: [],
            trainingEvents: [],
            documents: [],
            lpDiscussions: [],
            jdDiscussions: [],
            wcDiscussions: [],
            allDiscussionPosts: [],
            discussionBoards: []
        };
       
        var dashboard = $scope.dashboard,
            refresh = function () {
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            },
            init = function () {
                $navigation.setBanner(null,null);

                dashboard.outreachEvents = eventRepository.cache.Outreach;
                dashboard.upcomingEvents = eventRepository.cache.Upcoming;
                dashboard.trainingEvents = eventRepository.cache.Training;
                dashboard.events = {
                    outreach: eventRepository.cache.Outreach,
                    upcoming: eventRepository.cache.Upcoming,
                    training: eventRepository.cache.Training,
                    all: eventRepository.cache.All
                };

                dashboard.blogPosts = blogPostRepository.blogCache;
                dashboard.documents = documentRepository.documentCache;
                dashboard.allDiscussionPosts = discussionRepository.cache.allDiscussionPosts;
                dashboard.discussionBoards = discussionRepository.discussionBoards;

                dashboard.user = authorization.user;
            };

        init();
    }
]);