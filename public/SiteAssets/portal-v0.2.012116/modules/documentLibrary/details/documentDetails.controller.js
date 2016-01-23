
LegalPortal.controller('documentDetailsController', 
    ['$stateParams', '$scope', '$timeout', 'authorization', 'documentRepository', 'DOCUMENT_LIBRARY', 
    function ($stateParams, $scope, $timeout, authorization, documentRepository, DOCUMENT_LIBRARY) {
    'use strict';
    var documentId = -1,
        setProperties = function (property) {
            var values = [];
            if ($scope.document[property]) {
                if($scope.document[property].results) {
                    $scope.document[property].results.forEach(function (p) {
                        values.push(p.Label);
                    });
                    $scope.document[property] = values;                    
                } else {
                    // we have a string so we need to convert this to an array
                    $scope.document[property] = [$scope.document[property]];
                }
            }
        },
        getTermName = function () {
            // need to convert document.docType from SP-object to valid label
            if ($scope.document.docType) {
                documentRepository.getTermName($scope.document.docType.TermGuid).done(function (termName) {
                    $timeout(function () {
                        $scope.document.docType = termName;
                    });
                });
            }
        },
        getFileInfo = function () {
            documentRepository.getFileInfo('', DOCUMENT_LIBRARY.QUERYNAME, $stateParams.id, true).done(function (data) {
                $timeout(function () {
                    $scope.document.fileName = data.fileName;
                    $scope.document.submittedBy = data.submittedBy.Name;
                });
            });
        },
        mapComments = function(){
            console.log('mapComments called: %o', authorization.users);
            $scope.comments = $scope.comments.map(function(comment){
                comment.author = authorization.getUser(comment.authorId);
                return comment;
            });
                        
            console.log('mapped comments: %o', $scope.comments);
        };
                
    $scope.openDocument = function () {
        var wopi = '/_layouts/15/WopiFrame.aspx?sourcedoc={0}/{1}&action=default'.format(DOCUMENT_LIBRARY.NAME, $scope.document.fileName);
        window.open(wopi, 'Document');
    };
    
    $scope.comments = [];

    // get the document from cache
    $scope.document = documentRepository.getDocumentFromCache($stateParams.id);
        
    documentRepository.getComments($stateParams.id).then(function(data){
        console.log('comments: %o', data);
        data.forEach(function (c) {
            $scope.comments.push(c);
        });
        if(authorization.users.length > 0){
            // map comment authors
            mapComments($scope.comments);
        } else {
            // wait till users are loaded to map them to comment
            documentId = $stateParams.id;
            authorization.registerUsersCallback(mapComments);
        }
    });
        
    // do we have the TermGuid? Newly added docs don't & when refreshing page
    if (!$scope.document || ($scope.document.docType && !$scope.document.docType.TermGuid)) {
        documentRepository.getDocumentById($stateParams.id).done(function (document) {
            $scope.document = document;
            setProperties('issues');
            setProperties('groups');
            setProperties('taxKeywords');
            getTermName();
            getFileInfo();
        });
    } else {
        setProperties('issues');
        setProperties('groups');
        setProperties('taxKeywords');
        getTermName();
        getFileInfo();
    }
    
    console.log('doc metatdata: %o', $scope.document);        
    }
]);