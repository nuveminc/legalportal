/**
 * @description: kp-grid directive
 */
LegalPortal.directive('nvFileUpload', ['dataProvider', '$timeout', function (dataProvider, $timeout) {
    return {
        restrict: 'A',
        // TODO: should add a scope attribute to allow button name to change
        template: ['<div class="{{btnClass}}" ng-click="uploadItem()" ng-disabled="isImporting">{{btnText}}</div><span ng-show="{{isRequired}}" class="{{isRequiredClass}}">*</span>',
            '<input id="fileImport" type="file" style="visibility:hidden;" accept=".xlsx" />'].join(''),
        require: 'ngModel',
        scope: {
            btnText: '@',
            btnClass: '@',
            isRequired: '=',
            isRequiredClass: '@',
            subSiteUrl: '=',
            uploadImmediately: '=',
            fileName: '='
        },
        link: function (scope, element, attrs, ctrl) {
            var toastStatus,
                handleFile = function () {
                    var file = ($(this)[0].files.length === 1) ? $(this)[0].files[0] : null;
                    ctrl.$setViewValue($(this)[0].files);
                    if (file) {
                        $timeout(function () {
                            scope.fileName = file.name;
                        });
                    }
                };
            scope.uploadItem = function () {
                $('#fileImport').attr({ accept: '*' }).trigger('click');
            };

            $('#fileImport').on('change', handleFile);
        },
        controller: function ($scope) {
            console.log('nvFileUpload controller called')
        }
    }
}]);