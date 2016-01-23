
LegalPortal.controller('addWorkgroupDocumentModal', 
    ['$scope', '$timeout', '$q', '$modalInstance', 'documentRepository', 'authorization', 'item', 'Upload', 
    function ($scope, $timeout, $q, $modalInstance, documentRepository, authorization, item, Upload) {
    'use strict';
    var self = this,
        libraryName = item.libraryName,
        error = function (err) {
            return function (msg) {
                console.log('error in %o: %o', err, msg);
            };
        },
        saveFile = function (document, deferred) {
            return function (returnDoc) {
                returnDoc = (returnDoc && returnDoc.id) ? returnDoc : document;
                console.log('file saved: %o', returnDoc);
                // message file uploaded
                //$timeout(function () {
                    $scope.form.progress.message = 'Document uploaded ... saving title';
                //});
                // add metadata terms
                document.id = returnDoc.id;
                var updateDoc = angular.copy(document);
    
                // save only title for document - remove other properties
                delete updateDoc.submittedBy;
                delete updateDoc.createdBy;
                delete updateDoc.fileName;
                delete updateDoc.fileSystemObjectType;
                delete updateDoc.authorId;
    
                // set title
                if (document.multiples) {
                    // set title to be filename w/out extension
                    updateDoc.title = returnDoc.data.name.replace(/\.[^/.]+$/, '');
                }
                
                documentRepository.updateItem(updateDoc, item.libraryName)
                    //.done(setMetadata(document, metadata, deferred))
                    .done(function(auth){
                        return function(){
                            console.log('udateDoc: %o', updateDoc);
                            updateDoc.createdBy = { Name: authorization.user.displayName };
                            updateDoc.fileName = document.fileName;
                            updateDoc.path = libraryName;
                            $scope.documents.unshift(updateDoc);
                            $scope.form.closeModal(updateDoc);
                        }
                    }(authorization))
                    .fail($scope.form.failure);
            }
        };        
        
    var originalDoc = (item.document) ? angular.copy(item.document) : {};        
           
    $scope.document = item.document;
    $scope.document.multiples = false,
    
    $scope.documents = item.documents;
    
    $scope.isUpdating = (item.document.title);

    $scope.modal = {
        state: (!item.id) ? 'Add' : 'Update',
        save: function () {
            // save to API
            $scope.form.validate();

            if ($scope.form.isValid) {
                $scope.form.save();
            }
        },
        cancel: function () {
            item.document.title = originalDoc.title;
            $modalInstance.dismiss('cancel');
        }
    };

    $scope.form = {
        validate: function () {
            var fields= ['title', 'files'];
            if ($scope.isUpdating || !$scope.document.multiples) {
                // remove 'files' requirement
                fields.pop();
            }
            if ($scope.document.multiples) {
                // remove 'title' requirement
                fields.shift();
            }
            for (var i = 0; i < fields.length; i++) {
                var field = fields[i];
                if (isUndefined($scope.document[field]) || $scope.document[field] === '' || $scope.document[field].length === 0) {
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
            title: 'Please add a title for your document.',
            file: 'Select \'Choose File\' to upload a document from your file system.',
            files: 'Drag and drop files to upload documents from your file system.',
            message: ''
        },
        progress:{
            message: ''
        },
        showMultiple: true,
        isValid: true,
        isSaving: false,
        save: function () {
            // upload file and save metadata
            var documentUpload = function () {

                var document = angular.copy($scope.document);
                console.log('files: %o', $scope.document.files);

                if(!$scope.document.files){
                    $scope.form.error.message = $scope.form.error.file;
                    $scope.form.isValid = false
                    return;
                } else {
                    $scope.form.isSaving = true;
                    $scope.form.progress.message = 'Saving, please wait...';                
                }
                
                var file = $scope.document.files[0];
                var promises = [];
                for (var i = 0; i < $scope.document.files.length; i++) {
                    var file = $scope.document.files[i];
                    var deferred = $q.defer();
                    promises.push(deferred.promise);
                    $timeout(function () {
                        $scope.form.progress.message = 'Uploading document ... please wait.';
                    });
                    
                    var privateFolder = (document.private) ? '/private' : '';
                    libraryName = item.libraryName + privateFolder;
                    
                    documentRepository.uploadItem('', file, libraryName)
                        .done(saveFile(document, deferred))
                        .fail($scope.form.failure);
                }
                $q.all(promises).then(function (results) {
                    console.log('promises: %o', results);
                    $scope.form.closeModal(results);
                });
            },            

            updateUI = function (doc, document, metadata, deferred) {
                return function (data) {
                    console.log('metadata saved: %o', data);
                    $scope.form.isSaving = false;
                    document.dateCreated = Date.now();
                    document.title = doc.Title;
                    document.docType = metadata.docType;
                    document.groups = metadata.groups;
                    document.issues = metadata.issues;
                    document.taxKeywords = metadata.taxKeywords;
                    //documentRepository.documentCache.unshift(document);
                    $scope.form.progress.message = 'Document updated.';

                    var item = {
                        id: metadata.id,
                        title: doc.Title,
                        context: document.context,
                        author: document.author,
                        docType: metadata.docType,
                        groups: metadata.groups,
                        issues: metadata.issues,
                        taxKeywords: metadata.taxKeywords,
                        dateCreated: Date.now()
                    };
                    console.log('updateUI:Item %o', item);
                    deferred.resolve(item);
                }
            };
            
            if(!$scope.isUpdating) {
                documentUpload();
            } else {
                console.log('saving title: %o', $scope.document.title);
                var updatedDoc = {
                    id: $scope.document.id,
                    title: $scope.document.title
                }
                documentRepository.updateItem(updatedDoc, item.libraryName)
                    //.done(setMetadata(document, metadata, deferred))
                    .done(function(results){
                        $scope.form.closeModal(updatedDoc);
                    })
                    .fail($scope.form.failure);
            }
            
        },
        failure: function (err) {
            console.log('Error uploading: %o', err);
            $timeout(function () {
                $scope.form.isSaving = false;
                $scope.form.isValid = false;
                $scope.form.error.message = err.msg;
            });
        },
        closeModal: function (newDocs) {
            console.log('promise docs: %o', newDocs);
            /*if(newDocs && newDocs.length && newDocs.length > 0){
                newDocs.forEach(function (d) {
                    console.log('foreach doc: %o', d);
                    documentRepository.documentCache.unshift(d);
                });
            }*/
            $modalInstance.close(newDocs);
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };


    $scope.showFileExplorer = function () {
        console.log('showFileExplorer');
        $timeout(function () {
            $('#fileUpload').trigger('click');
        }, 0, false);
    };

    $scope.log = '';

}]);