/***********************************/
/* spapi/spapi.private.objects.js  */
/***********************************/
// TODO: should remove these as 'classes' 
    /**
     * generates HTTP headers for ajax calls
     * @param {string} verb which HTTP Action
     */
    HttpHeaders = function (action) {
        var headers = {
            'Accept': 'application/json; odata=verbose; charset=utf-8',
        };
        switch (action) {
            case 'GET':
                return headers;
            case 'MERGE':
                headers['Content-Type'] = 'application/json; charset=utf-8';
                headers['X-HTTP-Method'] = 'MERGE';
                headers['If-Match'] = '';
                return headers;
        }
    },

    /**
     * generates GET options for ajax call
     * @param {[type]} spUrl [description]
     */
    GETOptions = function (spUrl) {
        this.url = spUrl,
        this.type = 'GET',
        this.headers = new HttpHeaders('GET')
    },
    /**
     * generates POST options for ajax call
     * @param {gtring} spUrl sharepoint url
     * @param {object} model sp list data model
     */
    POSTOptions = function (spUrl,model) {
        this.url = spUrl,
        this.type = 'GET',
        this.headers = new HttpHeaders('GET')                
    },
    /**
     * @description
     *  Status states that are associated with Event logging
     */
    EventStatus = {
        Message:    'Message',
        Warning:    'Warning',
        Error:      'Error',
        Critical:   'Critical'
    },    
    /**
     *  Event model object used for logging events to list
     *  Event should be 'new'd since it represents an object instance
     * 
     * @param {string} action is the operation - e.g. create, update, etc.
     * @param {object} model used when performing CRUD operation
     * @param {string} error message to log
     * @param {string} status of event. use EventStatus to log a particular status - or custom
     * @param {string} stack trace from exception if available
     */
    Event = function (action, model, errMsg, status, stackTrace) {
        this.action = action;
        this.siteUrl = model.siteUrl;
        this.listName = model.listName;
        this.itemGuid = function (model) {
            var guid = '';
            if (model.data) {
                Object.keys(model.data).forEach(function (k) {
                    if (k === 'GUID') {
                        guid = model.data[k];
                    }
                });
            } return guid;
        }(model);
        this.errMsg = errMsg;
        this.status = status;
        this.stackTrace = stackTrace;
    },
