/********************************/
/* spapi/spapi.core.js          */
/********************************/
/**
 * @description
 *
 * SharePointAPI v0.10.111114
 * This library contains functions 
 * for accessing SharePoint list/library items
 * by querying the 2010/2013 API using CSOM/REST (not yet complete).
 * The library uses a model configuration object
 * which can specify the web, list or library from which to access data.
 * A model is used to bind sharepoint item field values to a plain 'old'
 * javascript object (POJO) to be used in client-side scripts. Queries can be built
 * using CAML directly or can take the form of objectCAML (experimental).
 * Templates can be used and then bound to a DOM element on the page.
 * This feature can be use to build interactive UI's that call the SharePoint API to
 * manage data without having to create compiled web parts because it is
 * implemented as javascript on the client and requires no install package.
 *
 * @returns {object} new SharePointAPI object instance
 */

var
/**
 * @description
 * sharepoint namespace contains functions for accessing sharepoint data
 *
 * @returns {Object} sharepoint utility object
 */
SharePointAPI = function () {
    // returns public functions
    return {
        list: list,
        library: library,
        discussions: discussions,
        taxonomy: taxonomy,
        search: search,
        // TODO: move this into 'user'
        user: user,
        ODataFilter: ODataFilter
    }
};

var SPScriptLoader = function () {
    var scriptsLoaded = false,
        callbackStack = [],

    init = function () {
        console.log('script loader loading...');
        var scriptBase = '{0}//{1}/_layouts/15/'.format(document.location.protocol, document.location.host);
        var protocol = (document.location.protocol.indexOf('https') > -1) ? 'https' : 'http';
        require('{0}://ajax.aspnetcdn.com/ajax/4.0/1/MicrosoftAjax.js'.format(protocol), function () {
            require(scriptBase + 'SP.Runtime.js', function () {
                require(scriptBase + 'SP.js', function () {
                    require(scriptBase + 'SP.Taxonomy.js', function () {
                        console.log('script loader done...');
                        scriptsLoaded = true;
                        callbackStack.forEach(function (cb) {
                            console.log('cb: %o, args: %o', cb.name, cb.args);
                            cb.fn.apply(this, cb.args);
                        });
                    });
                });
            });
        });
    },

    registerCallback = function (name, fn, args) {
        var callback = { name: name, fn: fn, args: args };
        callbackStack.push(callback);
    },

    isRegistered = function (name){
        var cb = null;
        if(callbackStack.length > 0) {
            cb = callbackStack.filter(function(c){
                return c.name === name;
            });                
        }
        return (cb.length);
    };

    init();

    return {
        registerCallback: registerCallback,
        isRegistered: isRegistered,
        scriptsLoaded: function () { return scriptsLoaded; }
    };

}();

window.SPAPI = SharePointAPI;