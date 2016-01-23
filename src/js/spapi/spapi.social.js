/********************************/
/* spapi/spapi.social.js        */
/********************************/
self.social = {

  setLike: function (siteUrl, listName, itemId, likeState) {
    var deferred = $.Deferred(),
        listGUID = '';

    siteUrl = siteUrl || '';
    var context = new SP.ClientContext(siteUrl);
    list = context.get_web().get_lists().getByTitle(listName);
    context.load(list);
    context.executeQueryAsync(function () {
    var listGUID = list.get_id().toString();

      Microsoft.Office.Server.ReputationModel.Reputation.setLike(context, listGUID , itemId, likeState);

      context.executeQueryAsync(function (response) {
            // Do something if successful
            console.log('successfully liked the post!');
            deferred.resolve(response);
        }, function (sender, args) {
            // Do something if error
            console.warn('Error: {0}'.format(args.get_message()));
            deferred.reject('Error: {0}'.format(args.get_message()));
      });
      }, function (sender, args) {
          // Do something if error
          console.log('error fetching list id');
    });
    return deferred.promise();
  },

  checkUserLike: function (siteUrl, listName, itemId, deferred) {

    var deferred = (deferred) ? deferred : $.Deferred();

    if (!SPScriptLoader.scriptsLoaded()) {
        SPScriptLoader.registerCallback('social.checkUserLike', self.social.checkUserLike, [siteUrl, listName, itemId, deferred]);
    } else {
      siteUrl = siteUrl || '';
      var context = new SP.ClientContext(siteUrl);
      var list = context.get_web().get_lists().getByTitle(listName);
      var item = list.getItemById(itemId);

      context.load(item, "LikedBy", "ID", "LikesCount");

      context.executeQueryAsync(function (success) {
        // Check if the user id of the current users is in the collection LikedBy.
        var likes  = [];
        var likedBys = item.get_item('LikedBy');
        if(likedBys) {
          likedBys.forEach(function(item) {
            var like = {
              id: itemId,
              user : {
                id: item.get_lookupId(),
                name: item.get_lookupValue()
              }
            };
            likes.push(like);
          });
        }
        return deferred.resolve(likes);
      }, function (sender, args) {
        //Custom error handling if needed
        console.warn('error: %o', args);
      });
    }
    return deferred.promise();
  }

};
