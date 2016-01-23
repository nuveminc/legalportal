//'use strict';

/* UTILITY FUNCTIONS - TODO: need to move to another library? */
/* @descripton
 *  a string formatting function to emulate the C#
 * 	string.Format( <string>, args ) static method.
 */
String.prototype.format = function () {
    var args = arguments;
    return this.replace(/\{(\d+)\}/g, function (m, n) { return args[n]; });
};