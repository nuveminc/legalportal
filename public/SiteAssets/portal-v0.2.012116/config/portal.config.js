
var rootUrl = '/SiteAssets/portal-v0.2.012116';

LegalPortal.constant('BASE_PATH', {
    // name of subsite (leave trailing '/' e.g. /LegalPortal/)
    subsiteUrl:             '/',
    // DO NOT CHANGE THESE VALUES
    modulesUrl:             rootUrl + '/modules/',
    dataUrl:                rootUrl + '/data/',
    pageUrl:                rootUrl + '/app/',
    portletUrl:             rootUrl + '/global/directives/portlets/',
    images:                 rootUrl + '/lib/images/',
    globalDirectivesUrl:    rootUrl + '/global/directives/',
    globalModalsUrl:        rootUrl + '/global/modals/'
});

LegalPortal.constant('PORTLET', {
    weatherCity: 'Seattle',
    twitterAt: 'ReutersTech',
    twitterId: '685274550158753792',
    setup: true
});

LegalPortal.constant('DOCUMENT_LIBRARY', {
    NAME: 'Shared Documents',
    QUERYNAME: 'Documents'
});

LegalPortal.constant('TERMSTORE', {
    // Termstore Unique Identifier
    GUID: 'fb0add40-dde1-4939-b792-2f1a1db83c6e',
    // Term sets & unique identfiers
    TERMSETS: [
        { name: 'DocType', guid: 'bae365e8-2890-46da-b98e-7b4eb1446063'},
        { name: 'Groups', guid: 'e33657b5-3f90-4da4-8cf4-37e0826e67b5'},
        { name: 'Issues', guid: 'db3eefa8-b922-491d-9f7e-d97d4f119bac'},
        { name: 'TaxKeywords', guid: 'fb0add40-dde1-4939-b792-2f1a1db83c6e'}
    ]
});

var SPAPI = window.SPAPI || {};

LegalPortal.service('spapi',[SPAPI]);
