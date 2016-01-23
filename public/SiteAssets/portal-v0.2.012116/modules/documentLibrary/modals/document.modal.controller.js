
LegalPortal.controller('documentModalController', ['$scope', '$timeout', '$q', '$modalInstance', 'documentRepository', 'item', 'TERMSTORE', 'DOCUMENT_LIBRARY', 'Upload', 
function ($scope, $timeout, $q, $modalInstance, documentRepository, updateDocument, TERMSTORE, DOCUMENT_LIBRARY, Upload) {
    'use strict';
    var self = this,
        setDocMetadataFields = function (docMetadata) {
            var deferred = $.Deferred(),
                calls = [],
                library = DOCUMENT_LIBRARY.QUERYNAME;

            documentRepository.setMetadataField(library, docMetadata.id, 'DocType', docMetadata.docType).done(function (data) {
                documentRepository.setMetadataField(library, docMetadata.id, 'Groups', docMetadata.groups).done(function (data) {
                    documentRepository.setMetadataField(library, docMetadata.id, 'Issues', docMetadata.issues).done(function (data) {
                        if (docMetadata.taxKeywords.length > 0) {
                            documentRepository.setMetadataField(library, docMetadata.id, 'TaxKeyword', docMetadata.taxKeywords).done(function (data) {
                                deferred.resolve(data);
                            });
                        }
                        else {
                            deferred.resolve(data);
                        }
                    });
                });
            });

            return deferred.promise();
        },
        error = function (err) {
            return function (msg) {
                console.log('error in %o: %o', err, msg);
            };
        },
        mapIssues = function (issues) {
            var foundIssues = [];
            if(issues.length){
                issueValues.forEach(function (iv) {
                    issues.forEach(function (i) {
                        if (i === iv.issue) {
                            foundIssues.push(iv);
                        }
                    });
                });                
            }
            return foundIssues;
        },
        copyDocument = function (doc) {
            var document = {
                author: doc.author,
                context: doc.context,
                docType: doc.docType,
                fileName: doc.fileName,
                files: doc.files,
                groups: doc.groups,
                issues: doc.issues,
                taxKeywords: doc.taxKeywords,
                title: doc.title,
            };
            // conditionally add id since this supports both
            // adding a new document and updating the document
            if(doc.id) {
                document.id = doc.id;
            }
            return document;
        };
        

    var docTypeValues = [
        'Brief/Memorandum',
        'Brochure',
        'Checklist',
        'Discovery',
        'Event',
        'Form',
        'Grant',
        'Image/Picture',
        'Invoice',
        'Letter',
        'Minutes',
        'Motion',
        'Newsletter',
        'Order',
        'Other',
        'Pleading',
        'Policy',
        'Trial',
        'Video'
    ],
    
    /*groupValues = [
        'Accounting ＆ Finance',
        'Administration ＆ Support',
        'Children ＆ Families',
        'Civil Practice ＆ Procedure',
        'Client Screening',
        'Community Engagement',
        'Consumer',
        'External Relations/Fundraising',
        'Housing',
        'Human Resources',
        'Immigrants ＆ Workers\' Rts',
        'Information Technology',
        'Public Benefits',
        'Training',
        'Volunteer/Pro Bono Services'
    ],*/
        
    issueValues = [
        { issue: 'Donated Services', group: 'Accounting ＆ Finance' },
        { issue: 'Financial Statements', group: 'Accounting ＆ Finance' },
        { issue: 'Government Forms', group: 'Accounting ＆ Finance' },
        { issue: 'Travel/Expense Forms', group: 'Accounting ＆ Finance' },

        { issue: 'LAF Policy', group: 'Administration ＆ Support' },
        { issue: 'LSC Program Letter', group: 'Administration ＆ Support' },
        { issue: 'LSC Regulation', group: 'Administration ＆ Support' },
        { issue: 'Strategic Planning', group: 'Administration ＆ Support' },

        { issue: 'Custody/Visitation', group: 'Children ＆ Families' },
        { issue: 'DCFS', group: 'Children ＆ Families' },
        { issue: 'Divorce', group: 'Children ＆ Families' },
        { issue: 'DV', group: 'Children ＆ Families' },
        { issue: 'Education', group: 'Children ＆ Families' },
        { issue: 'Financial Issues', group: 'Children ＆ Families' },
        { issue: 'Juvenile', group: 'Children ＆ Families' },
        { issue: 'Maintenance/Support', group: 'Children ＆ Families' },

        { issue: 'Attorneys\' Fees', group: 'Civil Practice ＆ Procedure' },
        { issue: 'Courthouse Information', group: 'Civil Practice ＆ Procedure' },

        { issue: 'Client Screening and Intake', group: 'Client Screening' },

        { issue: 'Client Support Services', group: 'Client Support Services' },

        { issue: 'Calendar Event', group: 'Community Engagement' },
        { issue: 'Client Document', group: 'Community Engagement' },
        { issue: 'Clinic', group: 'Community Engagement' },
        { issue: 'Collaboration', group: 'Community Engagement' },
        { issue: 'Help Desk', group: 'Community Engagement' },
        { issue: 'Legal Help Material', group: 'Community Engagement' },
        { issue: 'Population', group: 'Community Engagement' },
        { issue: 'Region', group: 'Community Engagement' },

        { issue: 'Bankruptcy', group: 'Consumer' },
        { issue: 'Collections', group: 'Consumer' },
        { issue: 'Equity', group: 'Consumer' },
        { issue: 'Foreclosure', group: 'Consumer' },
        { issue: 'Fraud', group: 'Consumer' },
        { issue: 'Property Taxes', group: 'Consumer' },
        { issue: 'Utilities', group: 'Consumer' },

        { issue: 'Boards ＆ Committees', group: 'External Relations/Fundraising' },
        { issue: 'Department Planning', group: 'External Relations/Fundraising' },
        { issue: 'Donor Database Management', group: 'External Relations/Fundraising' },
        { issue: 'Fundraising Event', group: 'External Relations/Fundraising' },
        { issue: 'Individual Giving', group: 'External Relations/Fundraising' },
        { issue: 'Institutional Giving', group: 'External Relations/Fundraising' },
        { issue: 'Marketing ＆ Communications', group: 'External Relations/Fundraising' },

        { issue: 'CHA', group: 'Housing' },
        { issue: 'HACC', group: 'Housing' },
        { issue: 'Housing Choice Vouchers', group: 'Housing' },
        { issue: 'Housing Discrimination', group: 'Housing' },
        { issue: 'Multi-family Housing', group: 'Housing' },
        { issue: 'Other Housing Authorities', group: 'Housing' },
        { issue: 'Other Housing Subsidies', group: 'Housing' },
        { issue: 'Public Housing', group: 'Housing' },
        { issue: 'RPUSA (Rental Prop. Utility Serv. Act)', group: 'Housing' },
        { issue: 'Supportive Housing', group: 'Housing' },

        { issue: 'Employee Benefits for Staff', group: 'Human Resources' },
        { issue: 'Payroll', group: 'Human Resources' },
        { issue: 'Policies', group: 'Human Resources' },

        { issue: 'Citizenship', group: 'Immigrants ＆ Workers\' Rts' },
        { issue: 'Disability', group: 'Immigrants ＆ Workers\' Rts' },
        { issue: 'Discrimination', group: 'Immigrants ＆ Workers\' Rts' },
        { issue: 'Employee Benefits for Clients/Cases', group: 'Immigrants ＆ Workers\' Rts' },
        { issue: 'Employment', group: 'Immigrants ＆ Workers\' Rts' },
        { issue: 'Migrant', group: 'Immigrants ＆ Workers\' Rts' },
        { issue: 'Retaliation', group: 'Immigrants ＆ Workers\' Rts' },
        { issue: 'U-Visa', group: 'Immigrants ＆ Workers\' Rts' },
        { issue: 'VAWA', group: 'Immigrants ＆ Workers\' Rts' },

        { issue: 'Computer Hardware', group: 'Information Technology' },
        { issue: 'Computer Software', group: 'Information Technology' },
        { issue: 'IT Documentation', group: 'Information Technology' },
        { issue: 'Licenses', group: 'Information Technology' },

        { issue: 'Crime Victims', group: 'Public Benefits' },
        { issue: 'IDHS (Dept. Human Services)', group: 'Public Benefits' },
        { issue: 'IDPH (Dept. Public Health)', group: 'Public Benefits' },
        { issue: 'Medical', group: 'Public Benefits' },
        { issue: 'POA/Guardianship', group: 'Public Benefits' },
        { issue: 'SSA (Social Security Admin)', group: 'Public Benefits' },
        { issue: 'Township Benefits', group: 'Public Benefits' },
        { issue: 'Veterans Affairs', group: 'Public Benefits' },

        { issue: 'Orientation', group: 'Training' },
        { issue: 'Training', group: 'Training' },

        { issue: 'PAI/Pro Bono/Volunteer', group: 'Volunteer/Pro Bono Services' },
        { issue: 'VISTA', group: 'Volunteer/Pro Bono Services' }
    ];

    // initialize $scope.document
    $scope.document = {
        docTypes: docTypeValues,
        allGroups: documentRepository.taxonomyCache.Groups,
        //allGroups: groupValues,
        allIssues: issueValues,
        docType: '',
        groups: [],
        issues: []
    };

    $scope.isUpdating = (updateDocument.id);

    $scope.updateIssues = function (element) {
        console.log('show change called.');
        var filteredIssues = [], issueGroups = [], nonMatchingIssues = [], fullList = issueValues;
        // gets all issues for each group
        $scope.document.groups.forEach(function (g) {
            console.log('loop: %o', g);
            filteredIssues = issueValues.filter(function (i) {
                return i.group == g.name;
            });
            // collect all filteredIssues in issueGroups array
            filteredIssues.forEach(function (i) {
                issueGroups.push(i);
            });
        });

        // find items in full list not already accounted for in the groups
        fullList.forEach(function (fl) {
            var count = 0;
            $scope.document.groups.forEach(function (ig) {
                if (fl.group !== ig.name) {
                    count++;
                }
            });
            if (count === $scope.document.groups.length) {
                nonMatchingIssues.push(fl);
            }
        });
        // append non-matching items below chosen groups
        nonMatchingIssues.forEach(function (i) {
            issueGroups.push(i);
        });
        $timeout(function () {
            if (filteredIssues.length < 1) {
                $scope.document.allIssues = issues;
            } else {
                $scope.document.allIssues = issueGroups;
            }
        });

    };

    $scope.modal = {
        state: (!updateDocument.id) ? 'Add' : 'Update',
        save: function () {
            // save to API
            $scope.form.validate();

            if ($scope.form.isValid) {
                $scope.form.save();
            }
        },
        cancel: function () {
            $modalInstance.dismiss('cancel');
        }
    };

    $scope.form = {
        validate: function () {
            var fields= ['title', 'docType', 'groups', 'issues', 'files'];
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
            docType: 'Please add a document type for your document.',
            groups: 'Please add a group for your document.',
            issues: 'Please add an issue for your document.',
            taxKeywords:'Please add any keywords in a comma-delimited format.',
           // context: 'Please add a context for your document.',
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
            // copy the document manully - can't use angular.copy().
            // NG throws here for some reason? 
            // TODO: break out just the document from the modal properties
            var document = copyDocument($scope.document);
            
            // check for keywords
            if (!isUndefined(document.taxKeywords)) {
                if (document.taxKeywords.indexOf(',') > 0) {
                    taxKeywordSet = document.taxKeywords.split(',');
                } else if(typeof document.taxKeywords === 'object') {
                    taxKeywordSet = document.taxKeywords;
                } else {
                    taxKeywordSet.push(document.taxKeywords);
                }
                taxKeywordSet = taxKeywordSet.map(function (m) { return m.trim(); });
            }
    
            // explicitly digest the values so the ui updates
            $timeout(function () {
            
                // save to API
                $scope.form.isSaving = true;
                $scope.form.progress.message = 'Saving, please wait...';

                // do we have keywords - save them first?
                if (taxKeywordSet.length > 0) {
                    var calls = [];
                    $scope.form.progress.message = 'Saving, new keywords please wait...';
                    // loop thru addding new terms
                    console.log('keywordSet: %o', taxKeywordSet);
                    taxKeywordSet.forEach(function (i) {
                        // LP Server Keywords GUID
                        calls.push(documentRepository.addNewTerm(i, TERMSTORE.TERMSETS[3].guid));
                    });
                    // collect promises before proceeding to 'upload item'
                    if (!$scope.isUpdating){
                        $all(calls).done(documentUpload);
                    }
                    else{
                        var deferred = $.Deferred();
                        delete document.dateCreated;
                        $all(calls).done(saveFile(document, deferred));
                        deferred.promise().then(function(document){
                            angular.extend(updateDocument, document);
                            $scope.form.closeModal();
                        });
                    }
                }
                // otherwise we can directly update the document
                else {
                    // if we're not updating the document 
                    // then we need to upload it
                    if (!$scope.isUpdating){
                        documentUpload();
                    } else{
                        // update the fields on the document
                        documentRepository.updateItem(document)
                            // when complete, close the modal
                            .done($scope.form.closeModal(results))
                            // or show the failure
                            .fail($scope.form.failure);
                    }

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
                    // upload the file
                    documentRepository.uploadItem('', file, DOCUMENT_LIBRARY.NAME)
                        .done(saveFile(document, deferred))
                        .fail($scope.form.failure);
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
                        docType: document.docType,
                        groups: document.groups,
                        issues: [],
                        // TODO:  add error handling for keywords empty
                        //taxKeywords: $scope.document.taxKeywords.split(',')
                        taxKeywords: taxKeywordSet
                    };
                    if(document.issues && document.issues.length > 0){
                        document.issues.forEach(function(item){
                            metadata.issues.push(item.issue);
                        });
                    }
                    var updateDoc = copyDocument(document);
                    // save only title for document - remove other properties
                    delete updateDoc.docType;
                    delete updateDoc.groups;
                    delete updateDoc.issues;
                    delete updateDoc.taxKeywords;
                    delete updateDoc.submittedBy;
                    delete updateDoc.createdBy;
                    delete updateDoc.fileName;
                    // set title
                    if (document.multiples) {
                        // set title to be filename w/out extension
                        updateDoc.title = returnDoc.data.name.replace(/\.[^/.]+$/, '');
                    }
                    documentRepository.updateItem(updateDoc)
                        .done(setMetadata(document, metadata, deferred))
                        .fail($scope.form.failure)
                }
            },

            setMetadata = function (document, metadata, deferred) {
                return function (doc) {
                    console.log('document fields saved: %o', doc);
                    // updates the metadata term fields                           
                    setDocMetadataFields(metadata)
                        .done(updateUI(doc, document, metadata, deferred))
                        .fail($scope.form.failure);
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
                    documentRepository.documentCache.unshift(d);
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