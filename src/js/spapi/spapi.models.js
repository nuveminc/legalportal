/********************************/
/* spapi/spapi.models.js        */
/********************************/
    /**
     * @description
     *  Web(site) model to enumerate web properties
     *  the fields are the return data from the call to the API
     */
    WebModel = function () {
        this.name = "Web Properties",
        this.fields = [
            { name: 'allowRssFeeds', spField: 'AllowRssFeeds' }
            , { name: 'appInstanceId', spField: 'AppInstanceId' }
            , { name: 'configuration', spField: 'Configuration' }
            , { name: 'created', spField: 'Created' }
            , { name: 'customMasterUrl', spField: 'CustomMasterUrl' }
            , { name: 'description', spField: 'Description' }
            , { name: 'documentLibraryCalloutOfficeWebAppPreviewersDisabled', spField: 'DocumentLibraryCalloutOfficeWebAppPreviewersDisabled' }
            , { name: 'enableMinimalDownload', spField: 'EnableMinimalDownload' }
            , { name: 'id', spField: 'Id' }
            , { name: 'language', spField: 'Language' }
            , { name: 'lastItemModifiedDate', spField: 'LastItemModifiedDate' }
            , { name: 'masterUrl', spField: 'MasterUrl' }
            , { name: 'quickLaunchEnabled', spField: 'QuickLaunchEnabled' }
            , { name: 'recycleBinEnabled', spField: 'RecycleBinEnabled' }
            , { name: 'serverRelativeUrl', spField: 'ServerRelativeUrl' }
            , { name: 'syndicationEnabled', spField: 'SyndicationEnabled' }
            , { name: 'title', spField: 'Title' }
            , { name: 'treeViewEnabled', spField: 'TreeViewEnabled' }
            , { name: 'uiVersion', spField: 'UIVersion' }
            , { name: 'uiVersionConfigurationEnabled', spField: 'UIVersionConfigurationEnabled' }
            , { name: 'url', spField: 'Url' }
            , { name: 'webTemplate', spField: 'WebTemplate' }
        ]
    },
    /**
     * @description
     *  document model represents an uploaded document
     *  the fields are the return data from the call to the API
     */
    DocumentModel = function (doc) {
        this.name = doc.Name || '',
        this.listName = doc.ServerRelativeUrl || '',
        this.fields = [
            { name: 'authorUrl', spField: 'Author', type: '__deferred' }
            , { name: 'checkInComment', spField: 'CheckInComment' }
            , { name: 'checkOutType', spField: 'CheckOutType' }
            , { name: 'contentTag', spField: 'ContentTag' }
            , { name: 'customizedPageStatus', spField: 'CustomizedPageStatus' }
            , { name: 'eTag', spField: 'ETag' }
            , { name: 'exists', spField: 'Exists' }
            , { name: 'length', spField: 'Length' }
            , { name: 'level', spField: 'Level' }
            , { name: 'listItemAllFieldsUrl', spField: 'ListItemAllFields', type: '__deferred' }
            , { name: 'lockedByUserUrl', spField: 'LockedByUser', type: '__deferred' }
            , { name: 'majorVersion', spField: 'MajorVersion' }
            , { name: 'minorVersion', spField: 'MinorVersion' }
            , { name: 'modifiedByUrl', spField: 'ModifiedBy', type: '__deferred' }
            , { name: 'name', spField: 'Name' }
            , { name: 'serverRelativeUrl', spField: 'ServerRelativeUrl' }
            , { name: 'timeCreated', spField: 'TimeCreated' }
            , { name: 'lastModified', spField: 'TimeLastModified' }
            , { name: 'title', spField: 'Title' }
            , { name: 'versionsUrl', spField: 'Versions', type: '__deferred' }]
    },

    /**
     * @description
     *  Wiki Page model represents a wiki page
     *  the fields are the return data from the call to the API
     */
    WikiPageModel = function () {
        this.name = 'Wiki',
        this.listName = 'SitePages',
        this.fields = [
            { name: 'id', spField: 'ID' }
            , { name: 'title', spField: 'Title' }
            , { name: 'created', spField: 'Created' }
            , { name: 'authorId', spField: 'AuthorId' }
            , { name: 'editorId', spField: 'EditorId' }
            , { name: 'checkoutUserId', spField: 'CheckoutUserId' }
            , { name: 'guid', spField: 'GUID' }
            , { name: 'wikiField', spField: 'WikiField' }
            , { name: 'oDataVersion', spField: 'OData__UIVersionString' }
            , { name: 'oDataCopySource', spField: 'OData__CopySource' }
            , { name: 'contentTypeId', spField: 'ContentTypeId' }
            , { name: 'fileSystemObjectType', spField: 'FileSystemObjectType' }
        ]
    },