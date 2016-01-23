/* BLOG PORTLET DIRECTIVE */
LegalPortal.directive('navigationPortlet', ['BASE_PATH', function (BASE_PATH) {
    return {
        restrict: 'A',
        templateUrl: BASE_PATH.globalDirectivesUrl + 'header/navigation/navigation.html',
        scope: {
            addDocument: '&',
            searchKeywords: '=',
            searchClick: '&'
        },
        link: function(scope,element,attributes){

            scope.registerKeypress = function (e){
                console.log('keypress');
                if(e.charCode === 13) {
                    scope.searchClick();
                }
            };

            scope.expand = function() {
                $('.search-form').toggleClass('expand');
                $('.search-form').addClass("open");
            };

            scope.search = function () {
                scope.searchClick();
                $('input').val('');
                $('.search-form').toggleClass('expand');
                $('.search-form').removeClass("open");
            }

            $('input').click(scope.expand);
        }
    }
}]);