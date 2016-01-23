/* TWITTER PORTLET DIRECTIVE */
LegalPortal.directive('twitterPortlet', ['BASE_PATH', 'PORTLET', function (BASE_PATH, PORTLET) {
    var template = '<a class="twitter-timeline" data-dnt="true" href="https://twitter.com/{0}" data-widget-id="{1}" width="359" height="433">Tweets by @{0}</a>'
        .format(PORTLET.twitteAt, PORTLET.twitterId);
    return {
        restrict: 'A',
        template: template,
        link: function (scope, element, attributes) {
            var $ = function (id) { return document.getElementById(id); };
            function loadTweets(){
                (!function (d, s, id) { 
                    var js, 
                    fjs = d.getElementsByTagName(s)[0], 
                    p = /^http:/.test(d.location) ? 'http' : 'https'; 
                    if (!d.getElementById(id)) { 
                        js = d.createElement(s); 
                        js.id = id; 
                        js.src = p + "://platform.twitter.com/widgets.js"; 
                        fjs.parentNode.insertBefore(js, fjs); 
                    } 
                }(document, "script", "twitter-wjs"));
                console.log('run tweets');
            };
            var twitterDiv = $('twitter-wjs');
            if (twitterDiv) {twitterDiv.remove(); }
            loadTweets();
        }
    }
}]);