/**
 * SPAPI - A library to simplify working with SharePoint's Web Services
 * Version 0.9.1
 * @requires jQuery v1.11 or higher - jQuery 1.11+ recommended
 *
 * Copyright (c) 2013-2016 Nuvem, Inc.
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 **/
/********************************/
/* spapi/spapi.setup.js         */
/********************************/
/** 
 * @description a string formatting function to emulate the C#
 *              string.Format( <string>, args ) static method.
 */
String.prototype.format = function () {
    var args = arguments;
    return this.replace(/\{(\d+)\}/g, function (m, n) { return args[n]; });
};

window.unimplemented = window.unimplemented || function() {
    throw Error('this function is not implemented');
};

/**
 * @description utility function to check undefined
 *              TODO: should move this to a namespace
 **/
window.isUndefined = window.isUndefined || function (value) {
    return (typeof value === 'undefined');
};

/** 
 * @descripton collects and resolves all jQuery promises
 */
window.$all = window.$all || function (promises) {
    var accumulator = [];
    var ready = $.Deferred().resolve(null);

    promises.forEach(function (promise) {
        ready = ready.then(function () {
            return promise;
        }).then(function (value) {
            accumulator.push(value);
        });
    });

    return ready.then(function () { return accumulator; });
};

/** 
 * @description a stripped down/simplified version of 'require' 
 *              removes a dependency on the 'require' library - used to load
 *              jQuery library if not included - a SharePointAPI library dependancy
 * @param {string} the file (path) to load
 * @param {function} callback after file has loaded
 */
window.require = window.require || function (file, callback) {
    var scripts = document.getElementsByTagName('script'),
        script = scripts[scripts.length - 1],
        newScript = document.createElement('script');
    newScript.type = 'text\/javascript';

    if (typeof newScript.onload !== 'undefined') {
        // others
        newScript.onload = function () {
            if (!window.isUndefined(callback))
                callback();
        };
    } else {
        // IE
        newScript.onreadystatechange = function () {
            if (newScript.readyState === 'loaded' || newScript.readyState === 'complete') {
                newScript.onreadystatechange = null;
                if (!window.isUndefined(callback))
                    callback();
            }
        };
    }
    newScript.src = file;
    script.parentNode.insertBefore(newScript, script);
};