/* DISCUSSION PORTLET DIRECTIVE */
LegalPortal.directive('discussionPortlet', ['$timeout', 'discussionRepository', 'BASE_PATH', function ($timeout, discussionRepository, BASE_PATH) {
    return {
        restrict: 'A',
        templateUrl: BASE_PATH.portletUrl + 'discussion/discussion.template.html',
        scope: { 
            posts: '=',
            boards: '=',
            viewModal: '&',
            addModal: '&'
        },
        link: function (scope, element, attributes) {
            scope.setBoardIcon = function (post) {
                switch(post.board.listName) {
                    case 'JudgesDecisions':
                        return 'fa-gavel';
                        break;
                    case 'WaterCooler':
                        return 'fa-bullhorn';
                        break;
                }
            };

            scope.setBoardIconColor = function (post) {
                switch(post.board.listName) {
                    case 'JudgesDecisions':
                        return 'laf-label-green';
                        break;
                    case 'WaterCooler':
                        return 'laf-label-blue';
                        break;
                }
            };

            scope.showLastReplyBy = function (replies) {
                var reply = '({0})';
                var replyBy = '';
                if(replies && replies.length > 0) {
                    replyBy = reply.format(replies[replies.length-1].author);
                }
                return replyBy;
            };

	    	console.log('directive: missing lists %o', scope.portlet.list.missing);

        },
        controller: function ($scope) {

        	$scope.portlet = {
        		list: {
	        		exists: discussionRepository.list.exists,
					missing: discussionRepository.list.missing
				}
        	};        	
        }
    }
}]);