
    /********************************/
    /* spapi/spapi.constants.js     */
    /********************************/

    var self = this,
    // displays console.log mesages to assist with debugging
    DEBUG = true,

    LOG_EVENTS = false,

    // instance of SPWikiPage - used to manipulate wiki pages
    //PAGE = new SPWikiPage(),

    // cached MODELS - includes cached data
    MODELS = {},

    // cached list names and corresponding guids
    SITE_LISTS = [],

    // default handler called on event success is called by all CRUD events.
    // This handler can be overwritten using the 'model' configuration: 'model.successDataHandler'
    successHandler = function () { return 'default succcess handler not implemented'; },

    // handler called on event failure is called by all CRUD events
    // This handler can be overwritten using the 'model' configuration: 'model.failureDataHandler'
    failureHandler = function () { return 'default error handler not implemented'; },

    // sp end-points
    SPROOT = '{0}/_api',
    SPSITE = SPROOT + '/Site',
    SPWEB = SPROOT + '/Web',

    SPLIST = SPWEB + '/Lists',
    SPLIST_ITEMS = SPLIST + '/GetByTitle(\'{1}\')/Items',
    //spListItemUpdate = SPLIST + '/GetByTitle(\'{1}\')/Items({2})',
    //spListItemGet = SPLIST + '/GetByTitle(\'{1}\')/Items({2})',
    SPLIST_ITEM_BY_ID = SPLIST + '/GetByTitle(\'{1}\')/Items({2})',
    SPLIST_ITEM = SPLIST + '/GetByTitle(\'{1}\')/Items()',
    spListByGuid = SPLIST + '(\'{1}\')',
    // will return file information if used with a library
    SPLIST_ITEM_BY_LIST_DATA_SVC = '{0}/_vti_bin/ListData.svc/{1}({2})',
    // will return file information if used with a library
    SPLIST_ITEMS_BY_LIST_DATA_SVC = '{0}/_vti_bin/ListData.svc/{1}',

    // name of the choice property to get values from
    FILTER_CHOICE = '$filter=EntityPropertyName eq \'{0}\''

    ;