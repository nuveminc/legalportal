
LegalPortal.controller('imageModalController', ['$scope', '$timeout', '$modalInstance', 'blogPostRepository', 'item',
    function ($scope, $timeout, $modalInstance, blogRepository, item) {
    'use strict';
        // initialize the form
    var modal = { form: { } },
        errMsgs = {
            file: 'Select \'Choose File\' to upload a document from your file system.',
            files: 'Drag and drop files to upload documents from your file system.',
            message: ''
        },
        cancelFn = function () {
            $modalInstance.dismiss('cancel');
        },
        closeFn = function (filePath) {
            $modalInstance.close(filePath);
        },        
        errorFn = function (err) {
            return function (msg) {
                console.log('error in %o: %o', err, msg);
            };
        },        
        failFn = function (err) {
            // TODO: need to hook this up ...
            console.log('error: %o', err);
        },
        // should point to a generic service
        // $validation.validate(modal.form);
        validateFn = function () {
            var fields= ['files'];
            var isValid = true;

            // validate fields
            for (let i = 0; i < fields.length; i++) {
                var field = fields[i];
                if (isUndefined($scope.item[field]) || $scope.item[field] === '' || $scope.item[field].length === 0) {

                    modal.form.error.message = errMsgs[field];
                    modal.form.isValid = false;
                    isValid = false;

                    $timeout(function () {
                        modal.form.error.message = '';
                        modal.form.isValid = true;
                    }, 3500);

                    break;
                }
            }

            return isValid;
        },
        saveFn = function (document, deferred) {
            // validate form
            if(modal.form.validate()) {
                if($scope.item.files.length > 1) {
                    console.log('multiple files added');
                } else {                    
                    // upload file
                    blogRepository.uploadItem('/blog', $scope.item.files[0], 'Photos').done(function (response) {
                        // TODO: figure out why response is both object and has data attribute?
                        console.log('image upload response: %o', response.data);
                        modal.close(response.data.serverRelativeUrl);                          
                    }).fail(modal.form.fail);
                }
            }
        },
        
        showFileExplorer = function () {
            console.log('showFileExplorer');
            $timeout(function () {
                $('#fileUpload').trigger('click');
            }, 0, false);
        };        

        
    var modal = {
        cancel: cancelFn,
        close:  closeFn,
        showFileExplorer: showFileExplorer,
        form: {
            validate: validateFn,
            error: errorFn,
            progress: {
                message: ''
            },
            showMultiple: true,
            isValid: true,
            isSaving: false,
            save: saveFn
        }
    };

    $scope.modal = modal;
    $scope.item = { files: null };

}]);