LegalPortal.controller('documentSearchController', 
	['$stateParams', '$scope', '$timeout', 'BASE_PATH', 'documentRepository', 
	function ($stateParams, $scope, $timeout, BASE_PATH, documentRepository) {
    'use strict';
    console.log('documentSearchController: loaded');
	var filters = [],
		resultSet = [],
		resetResults = function () {
			$scope.searchResults.rows.length = 0;
			resultSet.forEach(function(doc){
			    $scope.searchResults.rows.push(doc);
			});	
		},
		filter = function(){
	    	var results = [];
			var searchResults = angular.copy($scope.searchResults.rows);
	    	if(filters.length > 0){
	    		filters.forEach(function(filter){
				    results = results.concat(searchResults.filter(function(result){
				    	return ((result[filter.category].indexOf(filter.label) > -1) && (results.indexOf(result) < 0));
				    }));
		    		searchResults = results;
	    		});
		    	$scope.searchResults.rows = results;
			    /*results.forEach(function(doc){
			    	$scope.searchResults.rows.push(doc);
			    });*/
	    	} else {
	    		resetResults();
	    	}	
		},
		// list of refinement to track filters (checked)
		refinements = {
			docType: { values: [], checked: false, results: [] },
			group: { values: [], checked: false, results: [] },
			issue: { values: [], checked: false, results: [] }
		};
	
	resultSet = documentRepository.searchResults.rows;
	// bind reference for first time loading
    $scope.searchResults = documentRepository.searchResults;

	// bind to scope for ui
	$scope.refinements = refinements;
    // set each group for displaying refinements
    $scope.refinements.docType.values = documentRepository.docType;
    $scope.refinements.group.values = documentRepository.groups;
    $scope.refinements.issue.values = documentRepository.issues;

    
    // refinement filter function - adds/removes filters
    // from the list to be filtered from the result set
    $scope.refinementFilter = function(refinement, refinementState){
    	if(refinementState.checked){
    		filters.push(refinement);
    	} else {
    		var index = filters.indexOf(refinement);
    		filters.splice(index, 1);
    	}
    	if(filters.length > 0) {
	    	filter();
    	} else {
	    	resetResults();
    	}
    };
	console.log('documentSearchController: $stateParams.keywords: %o', $stateParams.keywords);
	// query for the search term
    documentRepository.search($stateParams.keywords);
}]);