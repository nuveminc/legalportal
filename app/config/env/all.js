'use strict';
/**
 * module configuration
*/
module.exports = {
	app: {},
	port: process.env.PORT || 5000,
	sessionSecret: 'MuZ-Session-Secret',
	sessionCollection: 'sessions',
	assets: {
		lib: {
			css: [],
			js: []
		},
		css: [],
		js: [],
		tests: []
	}
};