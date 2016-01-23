/********************************/
/* spapi/spapi.taxonomy.js      */
/********************************/

    var
    /**
     * [Term description]
     * @param {[type]} label [description]
     * @param {[type]} guid  [description]
     * @param {[type]} wssid [description]
     */
    Term = function (label, guid, wssid) {
        this.wssid = wssid || -1;
        this.label = label || '';
        this.guid = guid || '';
        this.toString = function () {
            return '{0};#{1}|{2}'.format( this.wssid, this.label, this.guid);
        }
    },
    /**
     * [NewTerm description]
     * @param {[type]} label [description]
     * @param {[type]} guid  [description]
     * @param {[type]} wssid [description]
     */
    NewTerm = function (label, guid, wssid) {
        return {
            wssid: wssid || -1,
            label: label || '',
            guid: guid || '',
            toString: function () {
                return '{0};#{1}|{2}'.format(this.wssid, this.label, this.guid);
            }
        };
    },
    /**
     * [updateItemTerms description]
     * @param  {[type]} context     [description]
     * @param  {[type]} item        [description]
     * @param  {[type]} termList    [description]
     * @param  {[type]} txFieldName [description]
     * @param  {[type]} txField     [description]
     * @param  {[type]} deferred    [description]
     * @return {[type]}             [description]
     */
    updateItemTerms = function (context, item, termList, txFieldName, txField, deferred) {
        var value = item.get_item(txFieldName);
        var terms = new Array();
        var termValueString = '';

        if (txField.get_allowMultipleValues()) {

            // loop through [terms] amd [termIds]
            termList.forEach(function (t) {
                terms.push("-1;#" + t.label + "|" + t.guid);
            });

            termValueString = terms.join(";#");
            var termValues = new SP.Taxonomy.TaxonomyFieldValueCollection(context, termValueString, txField);
            txField.setFieldValueByValueCollection(item, termValues);
        }
        else {
            var termValue = new SP.Taxonomy.TaxonomyFieldValue();
            termValue.set_label(termList[0].label);
            termValue.set_termGuid(termList[0].guid);
            termValue.set_wssId(-1);
            txField.setFieldValueByValue(item, termValue);
            termValueString = termList[0].label;
        }

        item.update();
        context.executeQueryAsync(function () {
            deferred.resolve('field updated: ' + termValueString);
            console.log('field updated with terms: %o', termValueString);
        }, function (sender, args) {
            console.log('{0}; {1}', args.get_message(), args.get_stackTrace());
        });
    },
    /**
     * [error description]
     * @param  {[type]} sender [description]
     * @param  {[type]} args   [description]
     * @return {[type]}        [description]
     */
    error = function (sender, args) {
        //alert(args.get_message() + '\n' + args.get_stackTrace());
    },
    /**
     * [getTermMatch description]
     * @param  {[type]} context   [description]
     * @param  {[type]} termSetId [description]
     * @param  {[type]} label     [description]
     * @return {[type]}           [description]
     */
    getTermMatch = function (context, termSetId, label) {
        var tSession = SP.Taxonomy.TaxonomySession.getTaxonomySession(context);
        var ts = tSession.getDefaultSiteCollectionTermStore();
        var tset = ts.getTermSet(termSetId);

        var lmi = new SP.Taxonomy.LabelMatchInformation(context);
        lmi.set_lcid(1033);
        lmi.set_trimUnavailable(true);
        lmi.set_termLabel(label);

        var termMatches = tset.getTerms(lmi);

        context.load(tSession);
        context.load(ts);
        context.load(tset);
        context.load(termMatches);
        return termMatches;
    },
    /**
     * [getTermIdForTerm description]
     * @param  {[type]} context   [description]
     * @param  {[type]} item      [description]
     * @param  {[type]} terms     [description]
     * @param  {[type]} fieldName [description]
     * @param  {[type]} txField   [description]
     * @param  {[type]} deferred  [description]
     * @return {[type]}           [description]
     */
    getTermIdForTerm = function (context, item, terms, fieldName, txField, deferred) {
        var termSetId = txField.get_termSetId().toString();
        var termList = [];

        if (Object.prototype.toString.call(terms) === '[object Array]') {
            terms.forEach(function(term) {
                // if we got the term from cache, then we can skip creating this.
                if(terms.length && !terms[0].guid) {
                    termList.push({ label: term, guid: null, wssId: -1 });
                } else {
                    term.label = term.name;
                    term.wssId = -1;
                    termList.push(term);
                    updateItemTerms(context, item, termList, fieldName, txField, deferred);
                    termList.length = 0;
                }
            });
                
            termList.forEach(function (termObj) {

                var tSession = SP.Taxonomy.TaxonomySession.getTaxonomySession(context);
                var ts = tSession.getDefaultSiteCollectionTermStore();
                var tset = ts.getTermSet(termSetId);

                var lmi = new SP.Taxonomy.LabelMatchInformation(context);
                lmi.set_lcid(1033);
                lmi.set_trimUnavailable(true);
                lmi.set_termLabel(termObj.label);

                var termMatch = tset.getTerms(lmi);

                context.load(tSession);
                context.load(ts);
                context.load(tset);
                context.load(termMatch);

                context.executeQueryAsync(function (ctx, itm, tm, trmLst, txFldName, trmObj, dfrd) {
                    return function () {
                        if (tm && tm.get_count() > 0) {
                            trmObj.guid = tm.get_item(0).get_id().toString();
                        }
                        var nullItems = trmLst.filter(function (t) { return t.guid === null; });
                        if (nullItems && nullItems.length === 0)
                            updateItemTerms(ctx, itm, trmLst, txFldName, txField, dfrd);
                    }
                }(context, item, termMatch, termList, fieldName, termObj, deferred), function (sender, args) {
                    error(args);
                });
            });
        } else {
            // really only have one
            var term = new Term(terms, null);
            var termMatch = getTermMatch(context, termSetId, terms);

            context.executeQueryAsync(function () {
                if (termMatch && termMatch.get_count() > 0) {
                    term.guid = termMatch.get_item(0).get_id().toString();
                    termList.push(term);
                    updateItemTerms(context, item, termList, fieldName, txField, deferred);
                }
            }, function (sender, args) {
                error(args);
            });

        }
    };


    /**
     * [taxonomy description]
     * @type {Object}
     */
    self.taxonomy = {
        spLibraryLoaded:  false,
        scriptLoadCallback:  [],

        errorCallback: function (err) {
            //alert(err.get_message());
        },
    
        setMetadataField:  function (listName, itemId, fieldName, terms) {        
            var deferred = $.Deferred();
            var internalDeferred = $.Deferred();
            if (isUndefined(terms)) { return deferred.reject('Err: term not defined'); }
            var context = SP.ClientContext.get_current();
            var list = context.get_web().get_lists().getByTitle(listName);
            var item = list.getItemById(itemId);
            var field = list.get_fields().getByInternalNameOrTitle(fieldName);
            var txField = context.castTo(field, SP.Taxonomy.TaxonomyField);

            context.load(field);
            context.load(txField);
            context.load(item);

            context.executeQueryAsync(function () {
                getTermIdForTerm(context, item, terms, fieldName, txField, deferred);
            });

            return deferred.promise();
        },

        getTermName:  function (termGuid, deferred) {
            deferred = (deferred) ? deferred : $.Deferred();
            if (!SPScriptLoader.scriptsLoaded()) {
                SPScriptLoader.registerCallback('taxonomy.getTermName', self.taxonomy.getTermName, [termGuid, deferred]);
            } else {
                var termSetName = termSetName;
                var context = SP.ClientContext.get_current();
                // get Session
                var session = SP.Taxonomy.TaxonomySession.getTaxonomySession(context);
                // Term Stores
                var termStore = session.getDefaultSiteCollectionTermStore();
                var term = termStore.getTerm(termGuid);

                context.load(term);
                context.executeQueryAsync(function () {
                    console.log('Term: %o', term);
                    deferred.resolve(term.get_name());
                }, function () {
                    console.log('getTermName: failed to get termstores: %o', arguments);
                });
            }
            return deferred.promise();
        },

        addNewTerm:  function (termName, termSetId) {
            var deferred = $.Deferred();
            var context = SP.ClientContext.get_current();
            var session = SP.Taxonomy.TaxonomySession.getTaxonomySession(context);
            var ts = session.getDefaultSiteCollectionTermStore();
            context.load(session);
            context.load(ts);
            var term = { setId: termSetId, name: termName }
            context.executeQueryAsync(function (termStore, term, ctx) {
                return function () {
                    console.log('term store: %o', termStore);
                    var LCID = '1033';
                    var newGuid = new SP.Guid.newGuid();
                    var termSet = termStore.getTermSet(term.setId);
                    var newTerm = termSet.createTerm(term.name, LCID, newGuid.toString());
                    ctx.load(newTerm);
                    ctx.executeQueryAsync(function () {
                        // success
                        console.log('success term store');
                        deferred.resolve();
                    },
                    function () {
                        // failed
                        console.log('addNewTerm: failed to get term store');
                        //TODO:  get those terms that already exist and handle this error
                        deferred.resolve();

                    });
                };
            }(ts, term, context), function () {
                console.log('error');
            });
            return deferred.promise();
        },
            
        loadTermsByTermset:  function(context, guid, deferred){
            deferred = (deferred) ? deferred : $.Deferred();

            if (!SPScriptLoader.scriptsLoaded()) {
                SPScriptLoader.registerCallback('taxonomy.loadTermsByTermset', self.taxonomy.loadTermsByTermset, [context, guid, deferred]);
            } else {            
                // get Session
                var session = SP.Taxonomy.TaxonomySession.getTaxonomySession(context);
                // Term Stores
                var termStore = session.getDefaultSiteCollectionTermStore();
                var termSet = termStore.getTermSet(guid);
                var terms = termSet.getAllTerms();

                context.load(terms);
                context.executeQueryAsync(function () {
                    console.log('taxonomy.loadTaxonomy : %o', terms);
                    var allTerms = [];
                    try {
                        var termsEnumerator = terms.getEnumerator();
                        while(termsEnumerator.moveNext()){
                            var taxTerm = termsEnumerator.get_current();
                            var term = {
                                guid: taxTerm.get_id().toString(),
                                name: taxTerm.get_name(),
                                path: taxTerm.get_pathOfTerm(),
                                isRoot: taxTerm.get_isRoot()
                            };
                            allTerms.push(term);
                        }
                        deferred.resolve(allTerms);
                    } catch(e) {
                        console.warn('exception: %o', e);
                        console.warn('guid: %o', guid);
                        if(!SPScriptLoader.isRegistered('taxonomy.loadTaxonomy'))
                            self.taxonomy.loadTermsByTermset(guid);
                    }
                }, function () {
                    console.log('failed to get termstores: %o', arguments);
                });
            }
            return deferred.promise();
        },

        loadTaxonomy:  function(termSets, deferred) {
            var deferred = (deferred) ? deferred : $.Deferred();
            if (!SPScriptLoader.scriptsLoaded()) {
                SPScriptLoader.registerCallback('taxonomy.loadTaxonomy', self.taxonomy.loadTaxonomy, [termSets, deferred]);
            } else {    
                var promises = [];
                termSets.forEach(function(item){
                    try{
                        var context = SP.ClientContext.get_current();
                        promises.push(self.taxonomy.loadTermsByTermset(context, item.guid));
                    }catch(e){
                        SPScriptLoader.registerCallback('taxonomy.loadTaxonomy', self.taxonomy.loadTaxonomy, [termSets, deferred]);
                    }
                });
                $all(promises).done(function(terms){
                    var index = 0, allTerms = {};
                    terms.forEach(function(t){
                        allTerms[termSets[index].name] = t;
                        index++;
                    });
                    deferred.resolve(allTerms);     
                });
            }
            return deferred.promise();
        },
        
        scriptBase:  '{0}//{1}/_layouts/15/'.format(document.location.protocol, document.location.host),

        protocol: (document.location.protocol.indexOf('https') > -1) ? 'https' : 'http',

    };