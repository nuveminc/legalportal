'use strict';
/**
 * main application entry file.
 */

// module dependencies.
// HACK: this should be set by init
// process.env.NODE_ENV = 'development'
var appPath = './app/',
	init = require(appPath + 'config/init')(),
    config = require(appPath + 'config/config'),
    chalk = require('chalk');

// init the express application
var app = require(appPath + 'config/express')();

// start the app by listening on <port>
app.listen(config.port);

// expose app
exports = module.exports = app;

// logging initialization
console.log('LP application started on port ' + config.port);
