
LegalPortal.controller('documentController', 
    ['$scope', '$modal', '$timeout', 'BASE_PATH', 'documentRepository', 
    function ($scope, $modal, $timeout, BASE_PATH, documentRepository) {
    'use strict';
    var ITEM_LIMIT = 12;
    $scope.listLimit = ITEM_LIMIT;

    $scope.documents = documentRepository.documentCache;
    $scope.documentGrid = documentRepository.documentGrid;

    $scope.gridOptions = {
        paginationPageSizes: [10, 20, 30],
        paginationPageSize: 10,
        enableSorting: true,
        enablePagination: true,
        enableColumnResizing: true,
        enableGridMenu: true,
        columnDefs: [
            { name: 'id', field: 'id', visible: false},
            { name: 'Title', field: 'title', cellTemplate:'<div class="ui-grid-cell-contents"><a ui-sref="metadataUrl({id:{{row.entity.id}}})">{{row.entity[col.field]}}</a></div>' },
          //  { name: 'Title', field: 'title', cellTemplate:'<div class="ui-grid-cell-contents"><a ui-sref="metadataUrl({id:{{row.entity[col.field][0]}}})">{{row.entity[col.field]}}</a></div>' },
          //  { name: 'Title', field: 'title' },
            { name: 'Doc Type', field: 'docType' },
            { name: 'Groups', field: 'groups' },
            { name: 'Issues', field: 'issues' },
            { name: 'Keywords', field: 'taxKeywords' },
            { name: 'Context', field: 'context' },
            { name: 'Created By', field: 'createdBy' }
        ],
        data: $scope.documentGrid
    };
}]);