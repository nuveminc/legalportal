
LegalPortal.controller('howToModalController', ['$scope', '$timeout', '$q', '$modalInstance', 'howToRepository', 'item', 'Upload', 
    function ($scope, $timeout, $q, $modalInstance, howToRepository, updateDocument, Upload) {
    'use strict';
    var self = this,
        error = function (err) {
            return function (msg) {
                console.log('error in %o: %o', err, msg);
            };
        };

    var categories = howToRepository.howToCategoryCache;

    // initialize $scope.document
    $scope.document = {
        categories: categories
    };

    $scope.isUpdating = (updateDocument.id);

    $scope.modal = {
        state: (!updateDocument.id) ? 'Add' : 'Update',
        save: function () {
            // save to API
            $scope.form.validate();

            if ($scope.form.isValid) {
                //if (!$scope.isUpdating){
                    $scope.form.save();   
                //} else {
                    //$scope.form.update();     
                //}
                
            }
        },
        cancel: function () {
            $modalInstance.dismiss('cancel');
        }
    };

    $scope.form = {
        validate: function () {
            var fields= ['title', 'category'];
            if ($scope.isUpdating) {
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
            // regex for taxonomy keywords
            var commaCheck = /^([A-Za-z0-9-]\s?)+([,]\s?([A-Za-z0-9-]\s?)+)*$/,
                anyChar = /(\w)+/,
                regex;

            if ((!isUndefined($scope.document.taxKeywords)) && ($scope.document.taxKeywords.length > 0)) {
                if ($scope.document.taxKeywords.indexOf(',') < 0) {
                    regex = anyChar;
                } else {
                    regex = commaCheck;
                }
                if(typeof $scope.document.taxKeywords === 'object'){
                    $scope.document.taxKeywords = $scope.document.taxKeywords.join(',');
                }
                if (!$scope.document.taxKeywords.match(regex)) {
                    this.error.message = this.error['taxKeywords'];
                    this.isValid = false;
                    return;
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
           // description: 'Please add a description for your document.',
            category: 'Please add a category for your document.',
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
            // map taxonomy keywords into an array
            var taxKeywordSet = [];
            var document = angular.copy($scope.document);

            $timeout(function () {
                // save to API
                $scope.form.isSaving = true;
                $scope.form.progress.message = 'Saving, please wait...';
                if (!$scope.isUpdating){
                    documentUpload();
                } else{
                    howToRepository.updateItem(document).done($scope.form.closeModal(results)).fail($scope.form.failure);
                }
            });

            // upload file and save metadata
            var documentUpload = function () {
                console.log('files: %o', $scope.document.files);
                var file = $scope.document.files[0];
                var promises = [];
                for (var i = 0; i < $scope.document.files.length; i++) {
                    var file = $scope.document.files[i];
                    var deferred = $q.defer();
                    promises.push(deferred.promise);
                    $timeout(function () {
                        $scope.form.progress.message = 'Uploading document ... please wait.';
                    });
                    howToRepository.uploadItem('', file, 'HowTo').done(saveFile(document, deferred)).fail($scope.form.failure);
                }
                $q.all(promises).then(function (results) {
                    console.log('promises: %o', results);
                    $scope.form.closeModal(results);
                });
            },
            saveFile = function (document, deferred) {
                return function (returnDoc) {
                    returnDoc = (returnDoc && returnDoc.id) ? returnDoc : document;
                    console.log('file saved: %o', returnDoc);
                    console.log('keywordSet: %o', taxKeywordSet);
                    // message file uploaded
                    $timeout(function () {
                        $scope.form.progress.message = 'Document uploaded ... saving metadata';
                    });
                    // add metadata terms
                    document.id = returnDoc.id;
                    // save metadata for setDocMetadata function argument
                    var metadata = {
                        id: document.id,
                        category: document.docType,
                    };
                    if(document.issues && document.issues.length > 0){
                        document.issues.forEach(function(item){
                            metadata.issues.push(item.issue);
                        });
                    }
                    var updateDoc = angular.copy(document);
                                        
                    // set title
                    if (document.multiples) {
                        // set title to be filename w/out extension
                        updateDoc.title = returnDoc.data.name.replace(/\.[^/.]+$/, '');
                    }
                                        
                    delete updateDoc.fileName;
                    delete updateDoc.category;
                    
                    var index = $scope.document.categories.indexOf($scope.document.category);
                    updateDoc.Category = {results:[index]};
                                        
                    howToRepository.updateItem(updateDoc).done(function(data){
                        $modalInstance.close(data);
                    }).fail($scope.form.failure)
                }
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
            if(newDocs && newDocs.length && newDocs.length > 0){
                newDocs.forEach(function (d) {
                    console.log('foreach doc: %o', d);
                    howToRepository.documentCache.unshift(d);
                });
            }
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

    // set document object properties if we have one (editing)
    if (Object.keys(updateDocument).length > 0) {
        angular.extend($scope.document, updateDocument);
        $scope.document.issues = mapIssues(updateDocument.issues);
        $scope.form.showMultiple = false;
    };

}]);