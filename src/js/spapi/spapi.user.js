    /********************************/
    /* spapi/spapi.user.js          */
    /********************************/    
    self.user = {
        /**
         * @description
         *  gets the current user profile properties
         *  along with the user's groups
         * 
         * @param {int} the user id - provided by SP
         * @returns {object} an object with the use profile properties
         */
        getProfile: function () {
            var deferred = $.Deferred(),
                options = {
                    url: '/_api/SP.UserProfiles.PeopleManager/GetMyProperties',
                    type: 'GET',
                    headers: {
                        'Accept': 'application/json;odata=verbose'
                    }
            };
            $.ajax(options).done(function (results) {
                deferred.resolve(results);
            }).fail(function(jqxhr, status, errMsg){
                // MOCK: return static data
                var err = { jqxhr: jqxhr, status: status, errMsg: errMsg };
                console.error('Cannot get user profile: %o', err);
            });
            return deferred.promise();
        },

        getCurrent: function (userId) {
            var deferred = $.Deferred(),
                config = {
                    url: '/_api/Web/GetUserById({0})'.format(userId),
                    headers: {
                        'Accept': 'application/json;odata=verbose'
                    }
                };
            $.ajax(config).done(function (user) {
                // get the user's groups
                config.url = '/_api/Web/GetUserById({0})/Groups'.format(user.d.Id);
                // call API to get the groups
                $.ajax(config).done(function (groups) {
                    var currentUser = user.d;
                    currentUser.Groups = groups.d.results;
                    deferred.resolve(currentUser);
                }).fail(function (jqxhr, status, errMsg) {
                    var err = new Event('SPAPI.getSPUserProfile => /Groups fetch failed', model, errMsg, status, jqxhr.responseText);
                    console.log('getSPUserProfile => /Groups fetch failed: %o', err);
                    deferred.reject(err);
                });
            }).fail(function (jqxhr, status, errMsg) {
                var err = new Event('SPAPI.getSPUserProfile => /Groups fetch failed', model, errMsg, status, jqxhr.responseText);
                console.log('getSPUserProfile fetch failed: %o', err);
                deferred.reject(err);
            });
            return deferred.promise();
        },

        getAllUsers: function (model){
            var deferred = $.Deferred(),
                //getConfig(SITE_USERS);
                config = {
                    url: '/_api/web/siteusers',
                    headers: {
                        'Accept': 'application/json;odata=verbose'
                    }
                };
            $.ajax(config).done(function (users) {
                successDataHandler(users.d, model, deferred);
            }).fail(function (jqxhr, status, errMsg) {
                var err = new Event('SPAPI.getSPUserProfile => /Groups fetch failed', model, errMsg, status, jqxhr.responseText);
                console.log('getSPUserProfile fetch failed: %o', err);
                deferred.reject(err);
            });
            return deferred.promise();            
        },
       
        getByAccountName: function (accountName) {
            var deferred = $.Deferred(),
                config = {
                    url: '/_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v=\'{0}\''.format(accountName),
                    headers: {
                        'Accept': 'application/json;odata=verbose'
                    }
                };
            $.ajax(config).done(function (user) {
                deferred.resolve(user);
            }).fail(function (jqxhr, status, errMsg) {
                var err = new Event('SPAPI.getByAccountName fetch failed', errMsg, status, jqxhr.responseText);
                console.log('getByAccountName fetch failed: %o', err);
                deferred.reject(err);
            });
            return deferred.promise();                           
        },

        find: function (query) {
            return self.getPeopleGroups(query);
        }
    };

