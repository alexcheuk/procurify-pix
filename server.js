'use strict';

var express = require('express');
var path = require('path');
var fs = require('fs');
var app = express();

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
    next();
});

var socket = require('socket.io');
var server = require('http').Server(app);
var io = socket(server , { origins:'*:*' });

// Express settings
require('./server/express')(app);
require('./server/socket')(io);


// Routing
var routesPath = path.join(__dirname, 'server/routes');
fs.readdirSync(routesPath).forEach(function (file) {
    if (/(.*)\.(js$|coffee$)/.test(file)) {
        require(routesPath + '/' + file)(app);
    }
});

// app.use('*', function (req, res) {
//     return res.sendStatus(400);
// });

server.listen(8080, '0.0.0.0', function () {
    console.log('\n\n');
    console.log('====================================================');
    console.log('Procurify PIX API');
    console.log('====================================================');
    console.log('\n\n');
});