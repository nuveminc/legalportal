'use strict';

/**
 * module dependencies.
 */
var fs = require('fs'),
    http = require('http'),
    https = require('https'),
    express = require('express'),
    morgan = require('morgan'),
    compress = require('compression'),
    config = require('./config'),
    path = require('path'),
    routes = require('../routes/index');

module.exports = function () {
    // initialize express app
    var app = express();

    // setting application local variables
    app.locals.title = config.app.title;
    app.locals.description = config.app.description;
    app.locals.keywords = config.app.keywords;

    // passing the request url to environment locals
    app.use(function (req, res, next) {
        res.locals.url = req.protocol + '://' + req.headers.host + req.url;
        next();
    });

    // compress response
    app.use(compress({
        filter: function (req, res) {
            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
        },
        level: 9
    }));

    // showing stack errors
    app.set('showStackError', true);

    // environment dependent middleware
    if (process.env.NODE_ENV === 'development') {
        // enable logger (morgan)
        app.use(morgan('dev'));

        // disable views cache
        app.set('view cache', false);

    } else if (process.env.NODE_ENV === 'production') {
        // cache in memory in production
        app.locals.cache = 'memory';
    }

    // setting the app router and static folder
    app.use(express.static(path.resolve('./public')));

    app.use('/', routes);
    // assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid.
    // TODO: revisit this with some other scheme
    app.use(function (err, req, res, next) {
        // if the error object doesn't exists
        if (!err) return next();

        // log it
        console.error(err.stack);

        // return the error page
        res.status(500).render('500', {
            error: err.stack
        });
    });

    // assume 404 since no middleware responded
    app.use(function (req, res) {
        res.status(404).render('404', {
            url: req.originalUrl,
            error: 'Not Found'
        });
    });

    if (process.env.NODE_ENV === 'secure') {
        // log SSL usage
        console.log('Securely using https protocol');

        // load SSL key and certificate
        var privateKey = fs.readFileSync('./config/sslcerts/key.pem', 'utf8');
        var certificate = fs.readFileSync('./config/sslcerts/cert.pem', 'utf8');

        // create HTTPS Server
        var httpsServer = https.createServer({
            key: privateKey,
            cert: certificate
        }, app);

        // return HTTPS server instance
        return httpsServer;
    }

    // return Express server instance
    return app;
};
