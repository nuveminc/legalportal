
LegalPortal.controller('addEventModalController', 
    ['$scope', '$modalInstance', '$timeout', 'eventRepository', 
    function ($scope, $modalInstance, $timeout, eventRepository) {
    'use strict';
    $scope.event = {
        eventDate: new Date(moment(Date.now()).format('YYYY-MM-DDT08:00:00Z')),
        endDate: new Date(moment(Date.now()).format('YYYY-MM-DDT08:00:00Z'))
    };
    // $scope.events = events || [];
    $scope.events =  [];
    $scope.isSaving = false;

    $scope.modal = {
        save: function () {
            $scope.form.isSaving = true;
            $scope.form.validate();

            if ($scope.form.isValid) {
                eventRepository.saveListItem($scope.event).done(function (data) {
                    $modalInstance.close(data);
                }).fail( function (err) {
                    $scope.form.isSaving = false;
                });
            }
        },
        cancel: function () {
            $modalInstance.dismiss('cancel');
        }      
    };

    $scope.form = {
        validate: function () {
            var fields = ['title','eventDate','endDate','category'];
            for (var i = 0; i < fields.length; i++) {
                var field = fields[i];
                if (field === 'eventDate' || field === 'endDate') {
                    if (new Date($scope.event.endDate) < new Date($scope.event.eventDate)) {
                        this.error.message = this.error.dateOrder;
                        this.isValid = false;
                        break;
                    }
                }
                if (isUndefined($scope.event[field]) || $scope.event[field] === '') {
                    this.error.message = this.error[field];
                    this.isValid = false;
                    break;
                }
            }
            $timeout(function (form) {
                return function () {
                    form.error.message = '';
                    form.isValid = true;
                }
            }(this), 3500);
        },
        error: {
            title: 'Please add a title for your event.',
            date: 'The event must have a start and end date/time.',
            dateOrder: 'The end date/time is before the start date/time.',
            category: 'A category has not been chosen.',
            message: ''
        },
        isValid: true,
        isSaving: false
    };

    // Disable weekend selection
    $scope.disabled = function (date, mode) {
        return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
    };

}]);
