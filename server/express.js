var express  = require('express');
var morgan = require('morgan');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var favicon = require('serve-favicon');
var compression = require('compression');

module.exports = function (app) {    

    app.set('views', './app/views');
    // app.engine('html', swig.renderFile);
    app.set('view engine', 'html');

    app.use(compression());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(methodOverride());

    if('production' === app.get('env')){
        app.use(favicon('./dist/favicon.ico'));
        app.use(express.static('./dist'));
        app.use(morgan('dev'));
    }

    if('development' === app.get('env')){
        app.use(express.static('./app'));
        app.use(morgan('dev'));
        app.use(errorHandler());
    }
};
