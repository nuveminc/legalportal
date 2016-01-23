LegalPortal.controller('howToController', 
    ['$scope', 'howToRepository', '$navigation',
    function ($scope, howToRepository, $navigation) {
    'use strict';

    var ITEM_LIMIT = 12;

    // hide banner
    $navigation.setBanner(null,null);

    // set item limit
    $scope.listLimit = ITEM_LIMIT;
        
    $scope.openDocument = function(title){
    	console.log('title: %o', title);
        var wopi = '/_layouts/15/WopiFrame.aspx?sourcedoc={0}/{1}&action=default'.format(DOCUMENT_LIBRARY.NAME, $scope.document.fileName);
        window.open(wopi, 'Document');
    	
    };
    
    $scope.gridOptions = {
        paginationPageSizes: [20, 60, 120],
        paginationPageSize: 30,
        enableSorting: true,
        enablePagination: true,
        enableColumnResizing: true,
        enableGridMenu: true,
        columnDefs: [
            { name: 'id', field: 'id', visible: false},
            { name: 'Title', field: 'title', cellTemplate:'<div class="ui-grid-cell-contents"><a href="/_layouts/15/WopiFrame.aspx?sourcedoc=HowTo/{{row.entity.fileName}}" target="_blank" style="cursor:pointer;">{{row.entity[col.field]}}</a></div>' },
            { name: 'Description', field: 'description' },
            { name: 'Category', field: 'category' },
            { name: 'Uploaded By', field: 'author.title' }
        ],
        data: howToRepository.documentCache
    };
}]);