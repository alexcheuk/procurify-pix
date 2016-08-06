/* jshint node:true */
'use strict';
// generated on 2014-12-29 using generator-gulp-webapp 0.2.0
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('express', function () {
    var server = $.express;

    server.run(['./server.js'], {
        env: process.env.NODE_ENV || 'development',
        port: 35810
    }, false);
});

gulp.task('express-production', function () {
    var server = $.express;

    server.run({
        env: 'production',
        file: './server.js',
        port: 35810
    });
});

gulp.task('serve', ['express', 'watch'], function () {
    require('opn')('http://localhost:9010');
});

gulp.task('serve-production', ['express-production', 'watch'], function () {
    require('opn')('http://localhost:9010');
});

gulp.task('watch', function () {
    gulp.watch(['./server.js', './server/**/*.js'], ['express']);
});

gulp.task('default', ['watch'], function () {
    gulp.start('express');
});