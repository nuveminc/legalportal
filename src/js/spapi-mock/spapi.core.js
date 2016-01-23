/********************************/
/* spapi-mock/spapi.core.js */
/********************************/

/**
 * this is the main SPAPI function (class)
 */
SPAPI = function () {
    // returns public functions
    return {
        discussions: discussions,
        list: list,
        library: library,
        search: search,
        taxonomy: taxonomy,
        user: user,
        workgroup: workgroup,
        ODataFilter: ODataFilter
    }
};

window.SPAPI = SPAPI;

/* UTILITY FUNCTIONS - TODO: need to move to another library? */
function unimplemented() {
    throw Error('this function is not implemented');
};

/**
 * @description
 *  utility function to check undefined
 **/
window.isUndefined = window.isUndefined || function (value) {
    return (typeof value === 'undefined');
};

/** @descripton
 *  resolves all promises
 */
window.$all = function (promises) {
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
 * @descripton
 *  a string formatting function to emulate the C#
 *  string.Format( <string>, args ) static method.
 */
String.prototype.format = function () {
    var args = arguments;
    return this.replace(/\{(\d+)\}/g, function (m, n) { return args[n]; });
};
