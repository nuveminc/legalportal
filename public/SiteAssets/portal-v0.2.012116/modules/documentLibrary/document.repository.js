
LegalPortal.service('documentRepository',
    ['$timeout', 'authorization', 'dataProvider', 'TERMSTORE', 'BASE_PATH',
    function($timeout, authorization, dataProvider, TERMSTORE, BASE_PATH){
    'use strict';
    var self = this,
        loadHandler = function () { },
        searchResults = {
            totalRows: 0,
            rows: []
        },
        taxFilter = function(value){
            return value ? value.split(';')[1].split('|')[2] : '';
        },
        hitFilter = function(value){
            return value.replace(/[a-z]+[0-9]+/gi, 'b') + '...';
        },
        DocumentModel = function (id) {
            this.data = {};
            this.name = 'documents';
		    this.siteUrl = BASE_PATH.subsiteUrl,
            this.listName = 'Documents';
            this.fields = [
                { name: 'id', spField: 'ID' }
                , { name: 'context', spField: 'Context' }
                , { name: 'dateCreated', spField: 'Created' }
                , { name: 'submittedBy', spField: 'CreatedBy' }
                , { name: 'description', spField: 'DocumentDescription' }
                , { name: 'modified', spField: 'Modified' }
                , { name: 'title', spField: 'Title' }
                , { name: 'author', spField: 'Author0' }
                , { name: 'editor', spField: 'Editor' }
                , { name: 'checkoutUser', spField: 'CheckoutUser' }
                , { name: 'docType', spField: 'DocType' }
                , { name: 'groups', spField: 'Groups', type: 'multivalue' }
                , { name: 'issues', spField: 'Issues', type: 'multivalue' }
                , { name: 'taxKeywords', spField: 'TaxKeyword', type: 'multivalue' }
                , { name: 'fileName', spField: 'Name' }
            ],
            this.filter = '?$orderby=Created%20desc';
        }, 
        CommentModel = function(documentId){
            this.data = {};
            this.name = 'documentComments';
            this.listName = 'DocumentComments';
            this.fields = [
                { name: 'id', spField: 'ID' }
                , { name: 'documentId', spField: 'DocumentId' }
                , { name: 'body', spField: 'Body' }
                , { name: 'parentId', spField: 'parentId' }
                , { name: 'authorId', spField: 'AuthorId' }
                , { name: 'created', spField: 'Created' }
            ],
            this.filter = '?$filter=DocumentId eq \'{0}\''.format(documentId);
        },
        SearchResultsModel = function (results) {            
            this.fields = [
                { name: 'docId', spField: 'DocId' }
                , { name: 'title', spField: 'Title' }
                , { name: 'author', spField: 'Author' }
                , { name: 'size', spField: 'Size' }
                , { name: 'description', spField: 'Description' }
                , { name: 'summary', spField: 'HitHighlightedSummary', filter: hitFilter }
                , { name: 'properties', spField: 'HitHighlightedProperties', filter: hitFilter }
                , { name: 'viewsRecent', spField: 'ViewsRecent' }
                , { name: 'fileType', spField: 'FileType' }
                , { name: 'rank', spField: 'Rank' }
                , { name: 'originalPath', spField: 'OriginalPath' }
                , { name: 'docType', spField: 'owstaxIdDocType', filter: taxFilter }
                , { name: 'groups', spField: 'owstaxIdGroups', filter: taxFilter }
                , { name: 'issues', spField: 'owstaxIdIssues', filter: taxFilter }
            ]           
        },
        addRefinementItem = function(category, item){
            if(self[category] && item[category].length > 0){
                var refinement = self[category];
                if(refinement.length > 0){
                    var refinementItem = refinement.forEach(function(r){
                        return r.label === item[category];
                    }); 
                    if(refinementItem && refinementItem.length > 0){
                        refinementItem.count++;                 
                    } else {
                        refinement.push({ category: category, label: item[category], count: 1 });                       
                    }
                } else {
                    refinement.push({ category: category, label: item[category], count: 1 });                       
                }
            }                       
        },
        convertModelData = function(result){
            var model = new SearchResultsModel();
            var item;
            if(result){
                item = {};
                model.fields.forEach(function(field){
                    Object.keys(result).forEach(function(prop){
                        if(prop === field.spField){
                            if(field.filter){
                                item[field.name] = field.filter(result[prop]);
                                if(self[field.name] && item[field.name].length > 0){
                                    addRefinementItem(field.name, item);
                                }
                            }else{
                                item[field.name] = result[prop];                                    
                            }
                        }
                    });
                });
                $timeout(function(){
                    self.searchResults.rows.push(item);                 
                });
            }
        },

        termSetItems = ['docType', 'group', 'issues', 'taxKeywords'],

        MetaDataObject = function (item) {
            this.__metadata = { 
                type:'SP.Taxonomy.TaxonomyFieldValue' 
            }, 
            this.Label = item.label || '';
            this.TermGuid = item.guid || '';
            this.WssId =-1 
        },

        
        formatMetadata = function (data, mmobj, multivalueset) {
            var metadataObject = new MetaDataObject(mmobj);
            if (mmobj.termset === 'issues' || mmobj.termset === 'group' || mmobj.termset === 'taxKeywords') {
                if ((typeof data[mmobj.termset] === 'object') && (!multivalueset)) {
                    data[mmobj.termset] = [];
                }
                data[mmobj.termset].push(metadataObject);
            } else {
                data[mmobj.termset] = metadataObject;
            }
            return data;
        }, 
        setDocType = function (doc) {
            // need to convert document.docType from SP-object to valid label
            if(doc.docType && doc.docType.TermGuid){
                self.taxonomyCache.DocType.forEach(function(term){
                    if(term.guid == doc.docType.TermGuid){
                        doc.docType = term.name;
                    }
                });
            }
        },        
        setProperties = function(doc) {
            var props = ['issues', 'groups', 'taxKeywords'];
            props.forEach(function (property) {
                if(doc[property] && (typeof doc[property] === 'object')){
                    if(doc[property].results && doc[property].results.length > 0){
                        var items = [];
                        doc[property].results.forEach(function (item) {
                            items.push(item.Label);
                        });
                        doc[property] = items.join(', ');       
                    } else {
                        doc[property] = '';
                    }
                } else {
                    doc[property] = '';
                }
            });
        },
        init = function () {
            self.getDocuments().done(function (responseData) {
                console.log('documents: %o', responseData);
                if (responseData.length > 0) {
                    responseData.forEach(function (d) {
                        if (d.title != null) {
                            setProperties(d);
                            self.documentCache.push(d);
                            self.documentGrid.push(d);
                        }
                    });
                }
            });
                               
            // load all taxonomy values 
            self.loadTaxonomy(TERMSTORE.TERMSETS).done(function(allTerms){
                self.taxonomyCache = allTerms;
                console.log('all terms: %o', allTerms);
                // we can now update all documents 
                self.documentCache.forEach(function(d){
                    // we can map the properties using the taxonomy values
                    setDocType(d);
                    self.documentGrid.push(d);
                });
            });
        };
        
    self.taxonomyCache = [];
    self.documentCache = [];
    self.documentGrid = [];
    self.searchResults = searchResults;
    self.docType = [];
    self.groups = [];
    self.issues = [];
    
    self.getMetadataFields = function () {
        return dataProvider.getMetadataFields();
    }
        
    self.getDocuments = function (documents) {
        return dataProvider.getLibraryFiles(new DocumentModel);
    };

    self.search = function (keywords) {
        console.log('documentReposiroty.searched called: %o', keywords);
        // intialize cached values      
        self.searchResults.totalRows = 0;
        self.searchResults.rows.length = 0;
        self.docType.length = 0;
        self.groups.length = 0;
        self.issues.length = 0;

        dataProvider.search(keywords).done(function (results) {       
            console.log('dataProvider.search results: %o', results);
            if(results.d.postquery.PrimaryQueryResult){
                var relevantResults = results.d.postquery.PrimaryQueryResult.RelevantResults,
                    items = [];
    
                // set total rows
                self.searchResults.totalRows = relevantResults.TotalRows;
                self.searchResults.keywords = keywords;
                
                // loop through rows in table
                relevantResults.Table.Rows.results.forEach(function (row) {
                    var item = {};
                    // loop through cells in row
                    row.Cells.results.forEach(function (cell) {
                        item[cell.Key] = cell.Value;
                    });
                    convertModelData(item);
                });
            }
        });
    };
    
    var mapComments = function(){
    
    };
    
    self.saveComment = function(comment, documentId, parentId){
        var deferred = $.Deferred();
        var model = new CommentModel();
        model.data.body = comment;
        model.data.documentId = documentId;
        model.data.parentId = parentId || 0;
        dataProvider.saveComment(model).then(function(data){
            data.author = authorization.getUser(data.authorId);
            deferred.resolve(data);
        });
        return deferred.promise();
    };

    
    self.getComments = function(documentId){
        var model = new CommentModel(documentId);
        return dataProvider.getComments(model);
    };

    self.getFileInfo = function (siteUrl, libraryName, fileId, expand) {
        var model = new DocumentModel();
        model.siteUrl = siteUrl;
        model.listName = libraryName;
        model.data.id = fileId;
        return dataProvider.library.getFileInfo(model, expand);
    };

    self.getDocumentById = function (id) {
        var model = new DocumentModel(id);
        model.data.id = id;
        return dataProvider.library.getDocumentById(model);
    };

    self.getDocumentFromCache = function (id) {
        var document = self.documentCache.filter(function (i) { return i.id == id })[0];
    };

    self.uploadItem = function (siteUrl, file, libraryName, model, folderName) {
        var model = new DocumentModel();
        return dataProvider.library.uploadItem(siteUrl, file, libraryName, model, folderName);
    };

    self.updateItem = function (data, libraryName) {
        var model = new DocumentModel();        
        model.data = data;
        model.listName = libraryName || model.listName;
        
        console.log('model.data: %o', model.data)
        return dataProvider.library.updateItem(model);
    };

    self.setMetadataField = function (libraryName, itemId, fieldName, term) {
        return dataProvider.setMetadataField(libraryName, itemId, fieldName, term);
    };

    self.getTermName = function (termSetName) {
        return dataProvider.getTermName(termSetName);
    };

    self.addNewTerm = function (termName, termSetId) {
        return dataProvider.addNewTerm(termName, termSetId);
    };
    
    self.loadTaxonomy = function (termSets) {
        return dataProvider.loadTaxonomy(termSets);
    };

    self.registerLoadHandler = function (cb) {
        loadHandler = cb;
    };
    
    init();

}]);