/* EVENT ITEM PORTLET DIRECTIVE */
LegalPortal.directive('eventItem', ['BASE_PATH', function (BASE_PATH) {
    return {
        restrict: 'A',
        scope: {
        	eventItem: '=',
        	viewModal: '&'
        },
        templateUrl: BASE_PATH.portletUrl + 'event/event.item.template.html',
        link: function(scope,element,attributes){
            scope.event = scope.eventItem;
            scope.portletUrl = BASE_PATH.portletUrl;
        }
    }
}]);