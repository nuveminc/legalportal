
LegalPortal.service('$navigation', ['$stateParams', function ($stateParams) {
    'use strict';

    var navigation = this;
    navigation.crumb = {};

    navigation.crumb = {
    	section: '',
    	view: '',
        imgsrc: '',
        href: '',
    	visible: false
    };

    navigation.setBanner = function (section, view, href, imgsrc) {

        navigation.crumb.section = section;
        navigation.crumb.view = view;
        navigation.crumb.href = href;
        navigation.crumb.imgsrc = imgsrc;

        if(!navigation.crumb.section && !navigation.crumb.view)
            navigation.crumb.visible = false;
        else
            navigation.crumb.visible = true;    

        console.log('set crumb %o', navigation.crumb.visible);	
    };

    return navigation;
}
]);