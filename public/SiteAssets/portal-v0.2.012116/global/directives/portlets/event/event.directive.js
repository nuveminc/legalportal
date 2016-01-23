/* EVENT PORTLET DIRECTIVE */
LegalPortal.directive('eventPortlet', ['$timeout', 'eventRepository','BASE_PATH',  function ($timeout, eventRepository, BASE_PATH) {
    return {
        restrict: 'A',
        templateUrl: BASE_PATH.portletUrl + 'event/event.template.html',
        scope: {
            data: '=',
            addModal: '&',
            viewModal: '&'
        },
        link: function(scope,element,attributes){
            scope.events = scope.data;
			scope.$watch(function(){
			    return eventRepository.list.exists;
			}, function (newValue) {
			    scope.portlet.listExists = newValue;
			});     

			scope.$watch(function(){
			    return eventRepository.list.missingCategories;
			}, function (newValue) {
				console.log('missing categories changed: %o', eventRepository.list.missingCategories);
			    scope.portlet.missingCategories = newValue;
			});     

        },
        controller: function ($scope) {
            $scope.portlet = {
                refresh: function () {
                    eventRepository.refresh();
                },
                listExists: eventRepository.list.exists,
                missingCategories: eventRepository.list.missingCategories
            };         
        }
    }
}]);