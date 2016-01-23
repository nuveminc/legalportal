    /********************************/
    /* spapi/spapi.web.js           */
    /********************************/    

    self.web = {
        getProperties: function () {
            var deferred = $.Deferred(),
                options = new GETOptions(SPWEB.format('')),
                model = new WebModel;
            $.ajax(options).done(function (data) {
                successDataHandler(data.d, model, deferred);
            });
            return deferred.promise();
        },
        createWeb: function () { },
        deleteWeb: function () { }
    };