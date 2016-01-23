/********************************/
/* spapi-mock/spapi.user.js */
/********************************/

var user = (function () {
    function getCurrentUser(userId){
        var deferred = $.Deferred();
        setTimeout(function() {
            deferred.resolve({
                Title: 'Pace, Mark',
                Email: 'mpace',
                LoginName: 'NV-SP2013\\mpace',
                IsSiteAdmin: true,
                Groups: [
                    { Title: 'Approvers', Description: 'Members of this group can edit and approve pages, list items, and documents.' },
                    { Title: 'Designers', Description: 'Members of this group can edit lists, document libraries, and pages in the site. Designers can create Master Pages and Page Layouts in the Master Page Gallery and can change the behavior and appearance of each site in the site collection by using master pages and CSS files.' },
                    { Title: 'Hierarchy Managers', Description: 'Members of this group can create sites, lists, list items, and documents.' },
                    { Title: 'Portal Owners', Description: 'se this group to grant people full control permissions to the SharePoint site: LAF' },
                ]
            });
        }, 10);
        return deferred.promise();
    };

    function getProfile(model) {
        var deferred = $.Deferred(),
            url = '/api/' + 'UserProfile',
            config = {
                url: url,
                method: 'GET'
            };
        $.ajax(config).done(function (data) {
            deferred.resolve(data);
        }).fail();
        return deferred.promise();
    };
    function getCurrent(model) {
        var deferred = $.Deferred(),
            url = '/api/' + 'UserProfile',
            config = {
                url: url,
                method: 'GET'
            };
        $.ajax(config).done(function (data) {
            successDataHandler(data, model, deferred);
        }).fail();
        return deferred.promise();
    };
    function getAllUsers(model) {
        var deferred = $.Deferred(),
            url = '/api/' + 'UserProfile',
            config = {
                url: url,
                method: 'GET'
            };
        $.ajax(config).done(function (data) {
            successDataHandler(data, model, deferred);
        }).fail();
        return deferred.promise();
    };
    function getByAccountName(model){
        var deferred = $.Deferred(),
            url = '/api/' + 'UserProfile',
            config = {
                url: url,
                method: 'GET'
            };
        $.ajax(config).done(function (data) {
            successDataHandler(data, model, deferred);
        }).fail();
        return deferred.promise();
    };

    return {
        getCurrentUser: getCurrentUser,
        getProfile: getProfile,
        getCurrent: getCurrent,
        getAllUsers: getAllUsers,
        getByAccountName: getByAccountName
    };
})();