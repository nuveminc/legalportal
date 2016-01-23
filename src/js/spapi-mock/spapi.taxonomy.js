/********************************/
/* spapi-mock/spapi.taxonomy.js */
/********************************/
var taxonomy = (function(){

    function setMetadataField (model) {
        var deferred = $.Deferred();
        setTimeout(function() {
            deferred.resolve('Unimplemented');
        }, 10);
        return deferred.promise();
    };

    function getTermName (termSetName) {
        var deferred = $.Deferred();
        setTimeout(function() {
            deferred.resolve(termSetName);
        }, 10);
        return deferred.promise();
    };

    function addNewTerm (model) {
        var deferred = $.Deferred();
        setTimeout(function() {
            deferred.resolve('Unimplemented');
        }, 10);
        return deferred.promise();
    };

    function loadTaxonomy (termSets) {
        var deferred = $.Deferred();
        var promises = [];
        termSets.forEach(function(termSet){
             console.log('get taxonomy data: ', 'TaxTerms.' + termSets.name );
             var config = {
                url: '/api/TaxTerms.' + termSet.name,
                method: 'GET'
            };    
            promises.push($.ajax(config));       
        });

        $all(promises).done(function(terms){
            var index = 0, allTerms = {};
            terms.forEach(function(t){
                allTerms[termSets[index].name] = t;
                index++;
            });
            deferred.resolve(allTerms);     
        });      
        return deferred.promise();
    };


    return {
        setMetadataField: setMetadataField,
        getTermName: getTermName,
        addNewTerm: addNewTerm,
        loadTaxonomy: loadTaxonomy
    };
})();