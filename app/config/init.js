'use strict';

/**
 * module dependencies.
 */
var glob = require('glob'),
    chalk = require('chalk');

/**
 * module init function.
 */
module.exports = function () {
    /**
	 * set the environment variable
	 * look for a valid NODE_ENV variable and if one cannot be found load the development NODE_ENV
	 */
    console.log('process.env.NODE_ENV: %o', process.env.NODE_ENV);
	glob('./config/env/' + process.env.NODE_ENV + '.js', {
        sync: true
    }, function (err, environmentFiles) {
        if (!environmentFiles.length) {
            if (process.env.NODE_ENV) {
                console.error(chalk.red('No configuration file found for "' + process.env.NODE_ENV + '" environment using development instead'));
            } else {
                console.error(chalk.red('NODE_ENV is not defined! Using default development environment'));
            }
            
            process.env.NODE_ENV = 'development';
        } else {
            console.log(chalk.black.bgWhite('Application loaded using the "' + process.env.NODE_ENV + '" environment configuration'));
        }
    });

};