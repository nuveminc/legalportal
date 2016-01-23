
LegalPortal.service('authorization', 
    ['$http', '$timeout', 'dataProvider','BASE_PATH',
    function ($http, $timeout, dataProvider, BASE_PATH) {
    'use strict';
    var _spPageContextInfo = window._spPageContextInfo || { userId: 0 };
    var self = this,
        // callbacks registered for loading site users
        usersCallbacks = [],
        usersLoaded = false,
        // set userId from context or -0- if none
        userId = _spPageContextInfo.userId,
        UserModel = function () {
            this.data = {};
            this.name = 'Users';
            this.fields = [
                { name: 'id', spField: 'Id' }
                , { name: 'title', spField: 'Title' }
                , { name: 'isHiddenUI', spField: 'IsHiddenInUI' }
                , { name: 'loginName', spField: 'LoginName' }
                , { name: 'title', spField: 'Title' }
                , { name: 'principalType', spField: 'PrincipalType' }
                , { name: 'email', spField: 'Email' }
                , { name: 'isSiteAdmin', spField: 'IsSiteAdmin' }
                , { name: 'userId', spField: 'UserId' }
            ],
            this.filter = '?$expand=Groups';            
        },
        // get the current user object
        getCurrentUser = function (userId) {
            dataProvider.user.getProfile().done(function (data, status, headers, config) {
                console.log('getAllUsers: %o', data);
                var user = data.d;
                self.user.displayName = user.DisplayName;
                self.user.email = user.Email;
                self.user.loginName = user.Email;
                self.user.userName = user.AccountName;
                self.user.isSiteAdmin = user.IsSiteAdmin;
                self.user.photoUrl = user.PictureUrl || BASE_PATH.images + 'avatar9.jpg';
            });
            return;
            dataProvider.user.getCurrent(userId).done(function (data, status, headers, config) {
                $timeout(function(){
                    var name = [];
                    if (data.Title && data.Title.indexOf(' ') > -1) {
                        name = data.Title.split(' ');
                    } else if (data.Title.indexOf('\\' > -1)) {
                        name.push('');
                        name.push(data.Title.split('\\')[1].trim());
                    }

                    self.user.firstName = name[0].trim();
                    self.user.lastName = name[1].trim();
                    self.user.name = name[1].trim() + ' ' + name[0].trim();
                    self.user.email = data.Email;
                    self.user.loginName = data.LoginName || '';
                    self.user.userName = (data.LoginName) ? data.LoginName.split('\\')[1] : '';
                    self.user.isSiteAdmin = data.IsSiteAdmin;

                    self.user.groups = [];
                    data.Groups.forEach(function (g) {
                        self.user.groups.push({
                            name: g.Title.replace(/\s/g, ''),
                            description: g.Description
                        });
                    });
                    console.log('user: ', self.user);
                });

            }).fail(function (error, status, headers, config) {
                console.log('Error getUser: ', error);
            });
        },
        // get a list of all users to use as a reference to perform 
        // lookups on items to provide the user alias/name
        getAllUsers = function(){           
            dataProvider.user.getAll(new UserModel()).done(function (data, status, headers, config) {
                self.users = data;
                console.log('Users: %o',data);
                usersLoaded = true;
                usersCallbacks.forEach(function(cb){
                    cb();
                });
            });
        };

    // delcare user
    self.user = {};

    // all users
    self.users = [];

    self.getUser = function(userId){
        var user;
        user = self.users.filter(function(user){
            return user.id === userId;
        })[0];
        
        return user;
    };
    
    self.getUserName = function (userId) {
        var user  = self.users.filter(function(u){
            return u.id === userId;
        });
        
        if(user.length) {
            return user[0].title;
        } 
    }
    
    self.registerUsersCallback = function(fn){
        if(usersLoaded){
            fn();
        } else {
            usersCallbacks.push(fn);
        }
    };
     
    // initialize user
    getCurrentUser(userId);

    // get a list of all users to use as a reference to perform lookups on items to provide the user alias/name
    getAllUsers();

    return self;
}]);