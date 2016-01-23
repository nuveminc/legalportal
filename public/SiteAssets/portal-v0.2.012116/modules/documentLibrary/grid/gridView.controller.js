
LegalPortal.controller('gridViewController', 
    ['$scope', '$modal', '$navigation', 'documentRepository', 'BASE_PATH','DOCUMENT_LIBRARY', 
    function ($scope, $modal, $navigation, documentRepository, BASE_PATH, DOCUMENT_LIBRARY) {
    'use strict';

    var ITEM_LIMIT = 12;
    
    $navigation.setBanner('View Documents', 'Central Library');
    $scope.listLimit = ITEM_LIMIT;

    $scope.documents = documentRepository.documentCache;
    $scope.documentGrid = documentRepository.documentGrid;

    $scope.documentLibrary = '/{0}/Forms/AllItems.aspx'.format(DOCUMENT_LIBRARY.NAME);
    
    if($scope.documentGrid.length == 0) {
        console.log('no documents loaded...')
    }
    $scope.gridOptions = {
        paginationPageSizes: [50, 100, 150],
        paginationPageSize: 50,
        enableSorting: true,
        enablePagination: true,
        enableColumnResizing: true,
        enableGridMenu: true,
        columnDefs: [
            { name: 'id', field: 'id', visible: false},
            { name: 'Title', field: 'title', cellTemplate:'<div class="ui-grid-cell-contents primary-link"><a ui-sref="documentDetails({id:{{row.entity.id}}})">{{row.entity[col.field]}}</a></div>' },
          //  { name: 'Title', field: 'title', cellTemplate:'<div class="ui-grid-cell-contents"><a ui-sref="metadataUrl({id:{{row.entity[col.field][0]}}})">{{row.entity[col.field]}}</a></div>' },
          //  { name: 'Title', field: 'title' },
            { name: 'Doc Type', field: 'docType' },
            { name: 'Groups', field: 'groups' },
            { name: 'Issues', field: 'issues' },
            { name: 'Additional Tags', field: 'taxKeywords' },
            { name: 'Context', field: 'context' },
            { name: 'Created By', field: 'createdBy' }
        ],
        data: $scope.documentGrid
    };
}]);