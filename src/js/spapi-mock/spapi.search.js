/********************************/
/* spapi-mock/spapi.search.js */
/********************************/
var search = (function(){

    function query (keywords) {
        var deferred = $.Deferred();
        if(!keywords){ throw new Error('keywords required for search'); }
        var data = {
                "request": {
                "Querytext": keywords,
                "EnableInterleaving": true,
                "StartRow": 0,
                "RowLimit": 20,
                "EnableStemming": false,
                "TrimDuplicates": false,
                "Timeout": 6000,
                "EnableNicknames": false,
                "EnablePhonetic": false,
                "EnableFQL": false,
                "HitHighlightedProperties": { "results": ["Title"] },
                "BypassResultTypes": false,
                "EnableQueryRules": false,
                "ProcessBestBets": false,
                "ClientType": "custom",
                "DesiredSnippetLength": 100,
                "MaxSnippetLength": 100,
                "SummaryLength": 150
              }
            };
        var config = {
            url: 'api/search/postquery',
            method: 'POST',
            data: JSON.stringify(data),
            headers: {'Content-Type':'application/json'},
            dataType: 'json'
        };

        $.ajax(config).done(function (data) {
            deferred.resolve(data);
        }).fail();

        return deferred.promise();
    };

    return {
        query: query
    };
})();