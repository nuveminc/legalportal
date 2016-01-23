    /**************************************/
    /* spapi/spapi.discussions.js         */
    /**************************************/
   
    self.discussions = {

        discussionsCache: [],
        messagesCache: [],

        convertModelData: function (model) {
            var data = {};
            model.fields.forEach(function (field) {
                // convert domain specific field names to spField name
                if (model.data[field.name]) {
                    if (field.type && field.type === 'multivalue') {
                        data[field.spField] = { results: [model.data[field.name]] };
                    }
                    data[field.spField] = model.data[field.name];
                } else if (model.data[field.spField]) {
                    // handle cases where data supplied uses spField names
                    data = model.data[field.spField];
                }
            });
            return data;
        },

        /**
         * Create a discussion item: SP.Utilities.Utility.createNewDiscussion
         * @param  {string} listName   discussion list name
         * @param  {object} model      data model used for discussion 
         * @return {[type]}            [description]
         */
        createDiscussion: function (listName, properties) {
            var deferred = $.Deferred(),
                properties = convertModelData(properties);
                spCSOM = function (param) {
                    var context = new SP.ClientContext.get_current();
                    var web = context.get_web();

                    var list = web.get_lists().getByTitle(param.listName);
                    context.load(list);

                    var discussionItem = SP.Utilities.Utility.createNewDiscussion(context, list, param.properties.Subject);
                    for (var propName in param.properties) {
                        if (propName == 'Subject') continue;
                        discussionItem.set_item(propName, param.properties[propName])
                    }
                    discussionItem.update();
                    context.load(discussionItem);

                    context.executeQueryAsync(
                        function () {
                            param.deferred.resolve(discussionItem);
                        },
                        function () {
                            param.deferred.reject({ error: 'error creating discussion item' })
                        }
                    );
                };

            if (!SPScriptLoader.scriptsLoaded()) {
                SPScriptLoader.registerCallback('createDiscussion', spCSOM, [{ deferred: deferred, listName: listName, properties: properties }]);
            } else {
                spCSOM({ deferred: deferred, listName: listName, properties: properties });
            }

            return deferred.promise();
        },

        // Load all discussions per Board: SP.CamlQuery.createAllFoldersQuery (Discussion Content Type derives from Folder Content Type)
        getDiscussions: function (listName) {
            var deferred = $.Deferred(),
                spCSOM = function (param) {
                    var context = new SP.ClientContext.get_current(),
                        web = context.get_web(),
                        list = web.get_lists().getByTitle(param.listName);

                    context.load(list);

                    var qry = SP.CamlQuery.createAllFoldersQuery(),
                        discussionItems = list.getItems(qry);

                    context.load(discussionItems);

                    context.executeQueryAsync(
                        function () {
                            var enumerator = discussionItems.getEnumerator();
                            var items = [];
                            while (enumerator.moveNext()) {
                                var item = enumerator.get_current();
                                var post = {};
                                var discussionId = item.get_fieldValues().ID;
                                post.dto = item;
                                post.id = item.get_fieldValues().ID;
                                post.dateCreated = item.get_fieldValues().Created;
                                post.subject = v.get_fieldValues().Title;
                                post.body = item.get_fieldValues().Body;
                                post.parentFolderID = v.get_fieldValues().ParentFolderID;  // undefined
                                post.parentItemID = item.get_fieldValues().ParentItemID;  // null
                                post.author = item.get_fieldValues().Author.get_lookupValue();                                
                                items.push(post);
                            }
                            param.deferred.resolve(items);
                        },
                        function () {
                            param.deferred.reject({ error: 'error getting discussion items' })
                        }
                    );
                };

            if (!SPScriptLoader.scriptsLoaded()) {
                SPScriptLoader.registerCallback(listName, spCSOM, [{ deferred: deferred, listName: listName }]);
            } else {
                spCSOM({ deferred: deferred, listName: listName });
            }

            return deferred.promise();
        },

        // Create a message item (or add reply to discussion item):  SP.Utilities.Utility.createNewDiscussionReply 
        createMessage: function (discussionItem, properties) {
            var deferred = $.Deferred(),
                //discussionItem = convertModelData(discussionItem);
                properties = convertModelData(properties);
                spCSOM = function (param) {
                    var context = new SP.ClientContext.get_current(),
                        messageItem = SP.Utilities.Utility.createNewDiscussionReply(context, param.discussionItem);

                    //for (var field in param.properties.data) {
                    //    messageItem.set_item(field.spField, param.properties[field.spField])
                    //}
                    messageItem.set_item('Body', param.properties.Body);
                    messageItem.update();

                    context.executeQueryAsync(
                        function () {
                            param.deferred.resolve(messageItem);
                        },
                        function () {
                            param.deferred.reject({ error: 'error creating message item' })
                        }
                    );
                };


            if (!SPScriptLoader.scriptsLoaded()) {
                SPScriptLoader.registerCallback('createMessage', spCSOM, [{ deferred: deferred, discussionItem: discussionItem, properties: properties }]);
            } else {
                spCSOM({ deferred: deferred, discussionItem: discussionItem, properties: properties });
            }

            return deferred.promise();
        },
        //self.createMessages = function (discussionItem, messagesProperties, OnItemsAdded, OnItemsError) {
        //    var context = new SP.ClientContext.get_current();
        //    var messageItems = [];
        //    $.each(messagesProperties, function (i, properties) {
        //        messageItems.push(SP.Utilities.Utility.createNewDiscussionReply(context, discussionItem));
        //        for (var propName in properties) {
        //            messageItems[i].set_item(propName, properties[propName])
        //        }
        //        messageItems[i].update();
        //    });

        //    context.executeQueryAsync(
        //        function () {
        //            OnItemsAdded(messageItems);
        //        },
        //        OnItemsError
        //    );
        //};
        // Load all Messages per Discussion Item: SPBuiltInFieldId.ParentFolderId 
        getMessages: function (listName, discussionId) {
            var deferred = $.Deferred(),
                createAllMessagesByDiscussionIDQuery = function (discussionId) {
                    var qry = new SP.CamlQuery;
                    var viewXml = "<View Scope='Recursive'> \
                                <Query> \
                                    <Where> \
                                        <Eq> \
                                            <FieldRef Name='ParentFolderId' /> \
                                            <Value Type='Integer'>" + discussionId + "</Value> \
                                        </Eq> \
                                    </Where> \
                                </Query> \
                            </View>";
                    qry.set_viewXml(viewXml);
                    return qry;
                },
                spCSOM = function (param) {
                    var context = new SP.ClientContext.get_current(),
                        web = context.get_web(),
                        list = web.get_lists().getByTitle(listName);

                    context.load(list);

                    var qry = createAllMessagesByDiscussionIDQuery(discussionId),
                        messageItems = list.getItems(qry);

                    context.load(messageItems);

                    context.executeQueryAsync(
                        function () {
                            var enumerator = messageItems.getEnumerator();
                            var items = [];
                            while (enumerator.moveNext()) {
                                var post = {};
                                var item = enumerator.get_current();
                                var discussionId = item.get_fieldValues().ID;
                                post.dto = item;
                                post.id = item.get_fieldValues().ID;
                                post.dateCreated = item.get_fieldValues().Created;
                                post.subject = v.get_fieldValues().Title;
                                post.body = item.get_fieldValues().Body;
                                post.parentFolderID = v.get_fieldValues().ParentFolderID;  // undefined
                                post.parentItemID = item.get_fieldValues().ParentItemID;  // null
                                post.author = item.get_fieldValues().Author.get_lookupValue();                                
                                items.push(post);
                            }
                            param.deferred.resolve(items);
                        },
                        function () {
                            param.deferred.reject({ error: 'error getting message items' })
                        }
                    );
                };

            if (!SPScriptLoader.scriptsLoaded()) {
                SPScriptLoader.registerCallback('discussions.getMessages', spCSOM, { deferred: deferred, listName: listName, discussionId: discussionId });
            } else {
                spCSOM({ deferred: deferred, listName: listName, discussionId: discussionId });
            }

            return deferred.promise();
        }
    };