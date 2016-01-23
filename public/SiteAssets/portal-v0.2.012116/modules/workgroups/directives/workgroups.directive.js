LegalPortal.directive('getExtension', [function(){
    return {
        restrict: 'A',
        link: function(scope, element, attributes){
            var filename = scope.doc.fileName;
            var ext, className, title, a = '';
            if(filename){
                a = filename.split(".");
                if( a.length === 1 || ( a[0] === "" && a.length === 2 ) ) {
                    ext = "";
                } else {
                    ext = a.pop().toLowerCase();
                }
            } else {
                ext = '';
            }
            switch (ext){
                case 'pdf':
                    className = 'fa fa-file-pdf-o';
                    break;
                case 'docx':
                case 'doc':
                    className = 'fa fa-file-word-o';
                    break;
                case 'xlsx':
                case 'xls':
                    className = 'fa fa-file-excel-o';
                    break;
                case 'pptx':
                case 'ppt':
                    className = 'fa fa-file-powerpoint-o';
                    break;
                default:
                    className = 'fa fa-file-text-o';
            }
            element.addClass(className);
            element.attr('title', ext);
        }
    }
}]);