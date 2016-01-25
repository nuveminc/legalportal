
LegalPortal.service('eventRepository', 
	['$timeout', 'dataProvider', '$filter', 'BASE_PATH',
	function ($timeout, dataProvider, $filter, BASE_PATH) {
    'use strict';
    var self = this,
		eventTypes = [
			'Outreach',
			'Upcoming',
			'Training'
		],
		EventModel = function () {
		    this.name = 'events',
		    this.siteUrl = BASE_PATH.subsiteUrl,
            this.listName = 'Events',
            this.fields = [
            	{ name: 'participantsPicker', spField: 'ParticipantsPicker', dataSvc: null }
            	, { name: 'category', spField: 'Category', dataSvc: 'CategoryValue' }
            	, { name: 'overbook', spField: 'Overbook', dataSvc: null }
            	, { name: 'created', spField: 'Created', dataSvc: 'Created' }
            	, { name: 'description', spField: 'Description', dataSvc: 'Description' }
            	, { name: 'endDate', spField: 'EndDate', dataSvc: 'EndTime' }
            	, { name: 'freeBusy', spField: 'FreeBusy', dataSvc: null }
            	, { name: 'location', spField: 'Location', dataSvc: 'Location' }
            	, { name: 'modified', spField: 'Modified', dataSvc: 'Modified' }
            	, { name: 'facilities', spField: 'Facilities', dataSvc: null }
            	, { name: 'eventDate', spField: 'EventDate', dataSvc: 'StartTime' }
            	, { name: 'title', spField: 'Title', dataSvc: 'Title' }
            	, { name: 'author', spField: 'Author', dataSvc: 'CreatedById' }
            	, { name: 'editor', spField: 'Editor', dataSvc: 'ModifiedById' }
                , { name: 'id', spField: 'Id' }
                , { name: 'allDayEvent', spField: 'fAllDayEvent', dataSvc: 'AllDayEvent' }]
		},
        parseUnixEpoch = $filter('parseUnixEpoch'),
        cacheEventType = function (type, data) {
            var eventType, missingCategory;
            data = (data instanceof Array) ? data : [data];
            for (var x = 0; x < data.length; x++) {
	            missingCategory = false
                if (typeof data[x].description == 'undefined') { data[x].description = 'No Description Entered' }
		        data[x].description = unescape(data[x].description);
		        data[x].eventDate = parseUnixEpoch(data[x].eventDate);
		        data[x].endDate = parseUnixEpoch(data[x].endDate);
		        eventType = data[x].category;
		        if (eventType === type) {
		            self.cache[eventType].push(data[x]);
		            self.cache.All.push(data[x]);
		        } else {
		            missingCategory = true
		        }
		    }
		    
		    if(missingCategory) {
		    	console.warn('missing category found');
		    	$timeout(function () {
					self.list.missingCategories = true;
				});
		    }
        },
		init = function () {
		    var calls = [];
		    eventTypes.forEach(function (type) {
		        calls.push(self.getEvents(type));
		    });
		    $all(calls).done(function () {
		    	$timeout(function () {
					self.list.exists = true;
		        	console.log('timeout: announcement list.exists %o', self.list.exists);
		    	});
	        	console.log('announcement list.exists %o', self.list.exists);
                self.cache.All.sort(function(a, b) {return (a.eventDate - b.eventDate)});
                self.cache.Community.sort(function(a, b) {return (a.eventDate - b.eventDate)});
                self.cache.Upcoming.sort(function(a, b) {return (a.eventDate - b.eventDate)});
                self.cache.Training.sort(function(a, b) {return (a.eventDate - b.eventDate)});
		    });
		};
    	
	self.cache = {
	    Outreach: [],
	    Upcoming: [],
	    Training: [],
	    All: []
	};

	self.getEvents = function (eventName) {
	    var eventModel = new EventModel();
	    var date = new Date,
            year = date.getFullYear(),
            month = ((date.getMonth() + 1) < 10) ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1),
    	    day = (date.getDate() < 10) ? '0' + date.getDate() : date.getDate(),
            dateString = '{0}-{1}-{2}'.format(year, month, day),
            filter = "?$filter=StartTime ge datetime'{0}'&$top=100&$orderby=StartTime desc".format(dateString);
	    var odata = new dataProvider.ODataFilter();
	    odata.where('StartTime').datetime().ge(dateString).top(100);
	    console.log('datetime query: %o', odata.getQuery());
	    eventModel.filter = filter;
        return dataProvider.getListItems(eventModel).then(function (responseData) {
            cacheEventType(eventName, responseData);
        }, function (error) {
        	console.warn('unable to get Events list');
        	$timeout(function(){
				self.list.exists = false;
        	});

        });
	};

    /**
     * @description: converts the current time using the current timezone
     *  into a unix epoch time in seconds an
     */
	self.toEpochLocal = function (date) {
	    var epochDate = moment(date).format('X') * 1000;
	    var localDateOffset = date.getTimezoneOffset() * 60000;
	    var currentEpochDate = epochDate - localDateOffset;
	    return currentEpochDate;
	};

	self.saveListItem = function (data) {
	    var model = new EventModel();
        console.log('saved event: %o', data);
        model.data = data;
        // if 'All Day Event', remove time element of datetime string
        if (model.data.allDayEvent) {
            model.data.eventDate = new Date(moment(model.data.eventDate).format('L'));
            model.data.endDate = new Date(moment(model.data.endDate).format('L'));
        }
        return dataProvider.saveListItem(model).done(function (item) {
            data.eventDate = self.toEpochLocal(data.eventDate);
            data.endDate = self.toEpochLocal(data.endDate);
            data.id = item.id;
            cacheEventType(data.category, data);
        });
	};

	self.updateListItem = function (data) {
	    var model = new EventModel();
	    console.log('saved event: %o', data);
	    model.data = data;
	    // if 'All Day Event', remove time element of datetime string
	    if (model.data.allDayEvent) {
	        model.data.eventDate = new Date(moment(model.data.eventDate).format('L'));
	        model.data.endDate = new Date(moment(model.data.endDate).format('L'));
	    }
	    return dataProvider.saveListItem(model).done(function (item) {
	        // unix epoch date needs a multiplier x 1000
	        data.eventDate = self.toEpochLocal(data.eventDate);
	        data.endDate = self.toEpochLocal(data.endDate);
	            eventTypes.forEach(function (e) {
	                var oldEvent = self.cache[e].filter(function (i) { return i.id == item.Id; })[0];
	                var index = self.cache[e].indexOf(oldEvent);
	                if (oldEvent) {
	                    self.cache[e].splice(index,1);
	                    return;
	                }
	            });
	         cacheEventType(data.category, data);
	    });
	};

	self.registerLoadHandler = function (cb) {
	    loadHandler = cb;
	};

	self.refresh = function () {
		init();
	};

	self.list = {
		exists: true,
		missingCategories: false
	};
	
	init();
	
}]);