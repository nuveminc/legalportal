'use strict';

/**
 * module dependencies.
 */
var _ = require('lodash');

/**
 * load app configurations
 */
module.exports = _.extend(
	require('./env/all'),
	require('./env/' + process.env.NODE_ENV) || {}
);