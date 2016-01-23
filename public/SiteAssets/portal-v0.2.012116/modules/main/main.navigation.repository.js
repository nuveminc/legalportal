LegalPortal.service('navigationRepository', ['dataProvider', function (dataProvider) {

	var self = this;
	var NavigationModel = function(){
        this.data = {};
        this.name = 'Navigation';
        this.listName = 'Navigation';
        this.fields = [
            { name: 'id', spField: 'ID' }
            , { name: 'title', spField: 'Title' }
            , { name: 'sref', spField: 'Sref' }
            , { name: 'groupName', spField: 'GroupName' }
            , { name: 'column', spField: 'Column' }
            , { name: 'orderIndex', spField: 'OrderIndex' }
        ]
	};
	/**
	 * creates a navigation tree in the form of
	 * [
	        { groupName: 'WORK GROUPS', 
	            columns: [
	                { items: [
	                    {sref: 'accountingFinance', title: 'Accounting & Finance'},
	                    {sref: 'administrationSupport', title: 'Administration & Support'},
	                    {sref: 'childrenFamilies', title: 'Accounting & Finance'},
	                ] },
	                { items: [
	                    {sref: 'accountingFinance', title: 'Accounting & Finance'},
	                    {sref: 'administrationSupport', title: 'Administration & Support'},
	                    {sref: 'childrenFamilies', title: 'Accounting & Finance'},
	                ] }
	            ] 
	        },
	        { groupName: 'TASK FORCES / COMMITTEES', columns: [] }
	    ];	
	 * @param  {object} navData the flat data from the list
	 * @return {object} a structured model to use in the navigation menu
	 */
	var createNavTree = function (navData) {
		//var sections = ['Library', 'Work Groups','Task Forces / Committees','Staff Resources', 'How To'];
		var sections = ['Work Groups','Task Forces / Committees'];
		var columns = ['C1', 'C2'];
		var groups = [];
		// enumerate sections
		sections.forEach(function(sectionName){
			// get all the items with the specified section name (top nav)
			var section = navData.filter(function(item){				
				return item.groupName === sectionName;
			});
			// create a new group object
			var group = {
				groupName: sectionName,
				columns: []
			};
			// enumerate the columns for each section
			columns.forEach(function (column) {
				var columnItems = section.filter(function(item){
					return item.column === column;
				});
				// if we have items in this column
				// then add this column to the groups
				if(columnItems.length > 0){
					var items = { items: columnItems };
					group.columns.push(items);
				}
			});
			// add the group
			groups.push(group);
		});

		return groups;
	};

	// console.log('loaded navigationRepository');
	// dataProvider.getListItems(new NavigationModel()).done(function (data) {
	// 	console.log('loaded navigation data');
	// 	var groups = createNavTree(data);
	// 	groups.forEach(function(group){
	// 		self.navigation.push(group);
	// 	});
	// });

	self.navigation = [];

	return self;
}]);