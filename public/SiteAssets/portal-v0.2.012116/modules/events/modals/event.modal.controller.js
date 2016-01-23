
LegalPortal.controller('eventModalController', 
    ['$scope', '$modalInstance', '$filter', 'eventRepository', 'item', 
    function ($scope, $modalInstance, $filter, eventRepository, item) {
    'use strict';

    var originalItem;

    $scope.events = item.events;
    $scope.category = item.category;
    $scope.error = '';
    $scope.updatingEvent = false;
    $scope.activeEvent;

    $scope.updateEvent = function (event) {
        originalItem = angular.copy(event);
        $scope.activeEvent = angular.copy(event);;
        $scope.activeEvent.eventDate = $filter('eventDatePickerModal')($scope.activeEvent.eventDate);
        $scope.activeEvent.endDate = $filter('eventDatePickerModal')($scope.activeEvent.endDate);
        $scope.updatingEvent = true;
    }

    $scope.updateCancel = function () {
        $scope.event = originalItem;
        $scope.updatingEvent = false;
    }

    $scope.updateSave = function () {
        delete $scope.activeEvent.created;
        delete $scope.activeEvent.modified;
        delete $scope.activeEvent.author;
        delete $scope.activeEvent.editor;
        $scope.activeEvent.eventDate = new Date($scope.activeEvent.eventDate);
        $scope.activeEvent.endDate = new Date($scope.activeEvent.endDate);
        eventRepository.updateListItem($scope.activeEvent).done(function (data) {
            $modalInstance.close(data);
        })
    }

    $scope.save = function () {
        // save to API
        $scope.isSaving = true;
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    // TODO: wrap all scopes in modal
    $scope.modal = {
        close: $scope.cancel,
        cancel: $scope.cancel
    };

}]);
