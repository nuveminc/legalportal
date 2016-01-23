    /**************************************/
    /* spapi/spapi.public.functions.js    */
    /**************************************/

    /**
     * @description
     *  exposes the local ODataFilter function as a public function
     */
    self.ODataFilter = ODataFilter;

    /**
     * convertModelData converts data to the specified model
     * @type {function}
     */
    self.convertModelData = convertModelData;

    /**
     * @description
     *  page context info from SP Page
     *  includes: 
     *      webServerRelativeUrl: /[site]/[subsite]
     *      webAbsoluteUrl: http://[server name]:[port]/[site]/[subsite]
     **/
    self.contextInfo = _spPageContextInfo;

    //self.logEvent = logEvent;

    /**
     * gets the SharePoint digest value 
     * for performing POST operations
     * @type {[type]}
     */
    self.getDigest = getDigest;

    /**
     * @description
     *  queries the search API to return search results
     * 
     * @param {object} a query object with the defined options for the SP Search API
     * @returns {object} an object with the search results 
     */
    self.search = function (queryObj) {
        return search(queryObj);
    };


    /**
     * @description
     *  queries for people or groups from the SP API - 
     *  which gets data from the UserProfile service/LDAP
     *  TODO: DEPRECATE IN FAVOR OF spapi.[user|group].find();
     * @param {object}  query object - an object with the following properties
     *  object.queryString         {string}  queryString the user supplied string for querying
     *  object.maxSuggestions      {int}     maxSuggestions the maximumn number of suggestions to return with query defaults to 30
     *  object.allowEmailAddresses {bool}    allowEmailAddresses fetches the email address with other data defaults to 'false'
     **/
    self.getPeopleGroups = function (query) {
        var deferred = $.Deferred(),
            maxSuggestions = (!isUndefined(query.maxSuggestions)) ? parseInt(query.maxSuggestions) : 30,
            allowEmailAddresses = (!isUndefined(query.allowEmailAddresses)) ? query.allowEmailAddresses.toString() : 'false',
            xmlData = ['<Request xmlns="http://schemas.microsoft.com/sharepoint/clientquery/2009" SchemaVersion="15.0.0.0" LibraryVersion="15.0.0.0" ApplicationName="Javascript Library">',
            '<Actions>',
                '<StaticMethod TypeId="{de2db963-8bab-4fb4-8a58-611aebc5254b}" Name="ClientPeoplePickerSearchUser" Id="0">',
                '<Parameters>',
                    '<Parameter TypeId="{ac9358c6-e9b1-4514-bf6e-106acbfb19ce}">',
                    '<Property Name="QueryString" Type="String">{0}</Property>',
                    '<Property Name="MaximumEntitySuggestions" Type="Number">{1}</Property>',
                    '<Property Name="AllowEmailAddresses" Type="Boolean">{2}</Property>',
                    '<Property Name="AllowMultipleEntities" Type="Boolean">true</Property>',
                    '<Property Name="AllUrlZones" Type="Boolean">false</Property>',
                    '<Property Name="EnabledClaimProviders" Type="String"></Property>',
                    '<Property Name="ForceClaims" Type="Boolean">false</Property>',
                    '<Property Name="PrincipalSource" Type="Number">15</Property>',
                    '<Property Name="PrincipalType" Type="Number">1</Property>',
                    '<Property Name="Required" Type="Boolean">false</Property>',
                    '<Property Name="SharePointGroupID" Type="Number">0</Property>',
                    '<Property Name="UrlZone" Type="Number">0</Property>',
                    '<Property Name="UrlZoneSpecified" Type="Boolean">false</Property>',
                    '<Property Name="Web" Type="Null" />',
                    '<Property Name="WebApplicationID" Type="String">{00000000-0000-0000-0000-000000000000}</Property>',
                    '</Parameter>',
                '</Parameters>',
                '</StaticMethod>',
                '</Actions>',
            '<ObjectPaths />',
            '</Request>'].join('').format(query.queryString, maxSuggestions, allowEmailAddresses);
        self.getDigest('').done(function (digest) {
            var config = {
                type: 'POST',
                contentType: 'text/xml',
                data: xmlData,
                dataType: 'json',
                url: self.contextInfo.webAbsoluteUrl + '/_vti_bin/client.svc/ProcessQuery',
                headers: {
                    'Accept': '*/*',
                    'X-RequestDigest': digest
                },
            };
            $.ajax(config).done(function (data) {
                var response = {
                    info: data[0],
                    results: JSON.parse(data[2])
                };
                deferred.resolve(response);
            });
        });

        return deferred.promise();
    };


    self.getLibraryItems = function (model) {
        var deferred = $.Deferred();
        getLibraryItems(model, deferred);
        return deferred.promise();
    };

    /**
     * @description: registers a model to 
     *  be used to fetch (getListItems), save, or update
     *  data in the specified web/list
     *
     * @param: {object} model configuration object 
     */
    self.addModel = function (model) {
        var msg = 'model with the same name already exists. please add "overwrite: [true|false]" property if you wish to override the existing model';
        if (model && model.name) {
            if (typeof MODELS[model.name] === 'undefined') {
                MODELS[model.name] = model;
            } //else {
            //    if (typeof model.override === 'undefined') {
            //        // the configuration should include an 'override' 
            //        // property set to 'true' to overrride any existing model
            //        console.warn(msg);
            //    }
            //}
        }
    };