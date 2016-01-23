LegalPortal.controller('mainController',
    ['$scope', '$modal', '$configuration', 'authorization', 'navigationRepository', 'BASE_PATH', 'PORTLET',
    function ($scope, $modal, $configuration, authorization, navigationRepository, BASE_PATH, PORTLET) {
    'use strict';
    console.log('loaded mainController')

    var main = $scope.main = {};

    main.imageUrl = BASE_PATH.imageUrl;

    main.initialized = PORTLET.setup;

    /**
     * @description
     *  main open modal function
     */
    main.openModal = function (templateUrl, controllerName, item, size) {
        $modal.open({
            templateUrl: templateUrl,
            controller: controllerName,
            resolve: {
                item: function () {
                    return item;
                }
            },
            backdrop: 'static',
            size: (size) ? size : 'md',
            keyboard: false
        }).result.then(function () {
            // saveItem
        }, function () {
            // cancelEditItem
        });
    };

    main.openModalAddDocument = function (doc) {
        doc = (doc) ? doc : {};
        var templateUrl = BASE_PATH.modulesUrl + 'documentLibrary/modals/addDocument.modal.html';
        var controller = 'documentModalController';
        main.openModal(templateUrl, controller, doc);
    };

    main.openModalAddComments = function (documentId, comments) {
        var templateUrl = BASE_PATH.globalModalsUrl + 'addComment.modal.html',
            // TODO:  add controller and item
            controller = 'addCommentModalController',
            item = {id: documentId, comments: comments};
        main.openModal(templateUrl, controller, item);
    };

    main.openModalAddHowTo = function (doc) {
        doc = (doc) ? doc : {};
        var templateUrl = BASE_PATH.modulesUrl + 'howTo/modals/howTo.modal.html';
        var controller = 'howToModalController';
        main.openModal(templateUrl, controller, doc);
    };

    main.openModalAddBlogPost = function () {
        var templateUrl = BASE_PATH.modulesUrl + 'blog/modals/addBlogPost.modal.html',
            controller = 'addBlogPostModalController',
            // TODO: standardize
            item = {},
            size = 'lg';
        main.openModal(templateUrl, controller, item, size);
    };

    main.openModalViewBlogPosts = function (blogPosts, blog) {
        var templateUrl = BASE_PATH.modulesUrl + 'blog/modals/blogPost.modal.html',
            controller = 'blogPostModalController',
            item = {blogPosts:blogPosts, blog:blog},
            size = 'lg';
        main.openModal(templateUrl, controller, item, size);
    };

    main.openModalAddEvent = function () {
        var templateUrl = BASE_PATH.modulesUrl + 'events/modals/addEvent.modal.html',
            controller = 'addEventModalController',
            // TODO: standardize
            item = {};
        main.openModal(templateUrl, controller, item);
    };

    main.openModalViewEvents = function (itemEvents, itemCategory) {
        var templateUrl = BASE_PATH.modulesUrl + 'events/modals/events.modal.html',
            controller = 'eventModalController',
            // TODO: standardize
            item = { events: itemEvents, category: itemCategory},
            size = 'lg';
        main.openModal(templateUrl, controller, item, size);
    };

    main.openModalAddDiscussion = function (itemBoards) {
        var templateUrl = BASE_PATH.modulesUrl + 'discussions/modals/addDiscussion.modal.html',
            controller = 'discussionModalController',
            // TODO: standardize
            item = { boards: itemBoards};
        main.openModal(templateUrl, controller, item);
    };

    main.openModalViewDiscussions = function (itemPost) {
        var templateUrl = BASE_PATH.modulesUrl + 'discussions/modals/discussions.modal.html',
            controller = 'discussionModalController',
            // TODO: standardize
            item = { post: itemPost },
            size = 'lg';
        main.openModal(templateUrl, controller, item, size);
    };

    // main.openModalAddLink = function (page) {
    //     page = (page) ? page : {};
    //     var templateUrl = BASE_PATH.modulesUrl + 'workGroups/modals/addLink.modal.html';
    //     var controller = 'addLinkModalController';
    //     main.openModal(templateUrl, controller, page);
    // };

    main.openModalAboutUs = function (page) {
        page = (page) ? page : {};
        var templateUrl = BASE_PATH.modulesUrl + 'workGroups/modals/aboutUs.modal.html',
            controller = 'aboutUsModalController';
        main.openModal(templateUrl, controller, page);
    };

    main.openModalLink = function (page, linkType, linkItem, key) {
        page = (page) ? page : {};
        linkType = (linkType) ? linkType : {};
        linkItem = (linkItem) ? linkItem : null;
        key = (key) ? key : null;
        var templateUrl = BASE_PATH.modulesUrl + 'workGroups/modals/link.modal.html',
            controller = 'linkModalController',
            item = { page: page, linkType: linkType, linkItem: linkItem, key: key};
        main.openModal(templateUrl, controller, item);
    };

    main.openModalExtLink = function (page, linkType, linkItem) {
        page = (page) ? page : {};
        linkType = (linkType) ? linkType : {};
        var templateUrl = BASE_PATH.modulesUrl + 'workGroups/modals/extLink.modal.html',
            controller = 'extLinkModalController',
            item = { page: page, linkType: linkType, linkItem: linkItem};
        main.openModal(templateUrl, controller, item);
    };

    main.openModalCatLink = function (page, linkType, category) {
        page = (page) ? page : {};
        linkType = (linkType) ? linkType : {};
        var templateUrl = BASE_PATH.modulesUrl + 'workGroups/modals/catLink.modal.html',
            controller = 'catLinkModalController',
            item = { page: page, linkType: linkType, category: category};
        main.openModal(templateUrl, controller, item);
    };

    main.openModalDocLink = function (page, linkType, doc) {
        page = (page) ? page : {};
        linkType = (linkType) ? linkType : {};
        var templateUrl = BASE_PATH.modulesUrl + 'workGroups/modals/docLink.modal.html',
            controller = 'docLinkModalController',
            item = { page: page, linkType: linkType, doc: doc};
        main.openModal(templateUrl, controller, item);
    };

    main.openModalPeople = function (page, linkType, person) {
        page = (page) ? page : {};
        linkType = (linkType) ? linkType : {};
        //person = (person) ? person : null;
        var templateUrl = BASE_PATH.modulesUrl + 'workGroups/modals/people.modal.html',
            controller = 'peopleModalController',
            item = { page: page, people: page[linkType], person: person };
        main.openModal(templateUrl, controller, item);
    };

    main.search = function(){
        var url = '/sites/enterpriseSearchCenter/Pages/results.aspx?k={0}'.format(main.keywords);
        window.open(url,'_blank');
    };

    main.registerKeypress = function(e){
        console.log('keypress');
        if(e.charCode === 13) {
            main.search();
        }
    };

    main.keywords = '';
    main.user = authorization.user;
    main.nav = navigationRepository.navigation;

}]);
