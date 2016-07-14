(function (require) {
    'use strict';

    // Gulp dependencies
    var gulp = require('gulp'),
        $ = require('gulp-load-plugins')(),
        del = require('del'),
        sass = require('gulp-sass'),

        karmaServer = require('karma').Server,
        runSequence = require('run-sequence'),

        projectName = 'doclerapp',
        minifiedCssFileName = projectName + '.min.css',
        minifiedJsFileName =  projectName + '.min.js';



    // Setting up the test task
    gulp.task('test-e2e', function(callback) {
        gulp.src(['dummy_spec.js'])
            .pipe(gulpProtractorAngular({
                'configFile': 'protractor.conf.js',
                'debug': false,
                'autoStartStopServer': true
            }))
            .on('error', function(e) {
                console.log(e);
            })
            .on('end', callback);
    });


    // Unit testing
    gulp.task('test-unit', ['build-js'], function(done) {
        var server = new karmaServer({
            configFile: __dirname + '/karma.conf.js',
            singleRun: true
        }, done);

        server.start();
    });


    // Codewatcher
    gulp.task('autotest', function() {
        return gulp.watch(['src/scripts/**/*.js', 'test/unit/spec/*.js'], ['test-unit']);
    });


    gulp.task('watch', function() {
        return gulp.watch(['src/**/*.*'], ['package']);
    });

    // Run JSHint linter. If it fails, the build process stops.
    gulp.task('jshint', function () {
        var src = [
            '!src/scripts/modules/**',
            'src/**/scripts/**/*.js',
            'gulpfile.js'
        ];

        return gulp.src(src)
            .pipe($.jshint({esversion: 6}))
            .pipe($.jshint.reporter('jshint-stylish'))
            .pipe($.jshint.reporter('fail'));
    });


    // Clean up build and destination folders
    gulp.task('clean', function (cb) {
        del(['dist/'], cb);
    });


    // Compile and minify scss files into css file.
    gulp.task('build-css', function () {
        var src = [ 'src/styles/_bootstrap.scss' ], dest = 'dist/';

        // copy fonts
        gulp.src('src/styles/fonts/**').pipe(gulp.dest(dest + 'fonts'));

        // compile scss to css
        return gulp.src(src)
            .pipe($.concat(minifiedCssFileName))
            .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
            .pipe($.minifyCss({compatibility: 'ie9'}))
            .on('error', function (err) {
                $.util.log($.util.colors.red(err));
            })
            .pipe(gulp.dest(dest + 'styles/'));
    });


    // Minify javascript files.
    gulp.task('build-js', function () {

        var src = [
                'node_modules/angular/angular.min.js',
                'node_modules/angular-touch/angular-touch.min.js',
                'src/scripts/app.js'
            ],
            dest = 'dist/scripts';

        return gulp.src(src)
            .pipe($.babel({
                presets: ['babel-preset-es2015-script']
            }))
            .pipe($.concat(minifiedJsFileName))
            .pipe($.uglify({mangle:false}))
            .on('error', function (err) {
                $.util.log($.util.colors.red(err));
            })
            .pipe(gulp.dest(dest))
            .pipe($.size({
                title: 'javascripts'
            }));
    });


    // Minify HTML files and templates.
    gulp.task('build-html', function () {
        var dest = 'dist/';

        gulp.src('src/templates/*.html')
            .pipe(gulp.dest(dest + 'templates'));

        return gulp.src('src/index.html')
            .pipe($.htmlReplace({
                'css': 'styles/' + minifiedCssFileName,
                'js': 'scripts/' + minifiedJsFileName
            }))
            .pipe($.htmlmin({collapseWhitespace: true}))
            .pipe(gulp.dest(dest))
            .pipe($.size({
                title: 'templates'
            }));
    });


    // Doing tests
    gulp.task('test-all', function() {
        runSequence('test-unit', 'test-e2e');
    });


    // Build all
    gulp.task('build-all', function () {
        runSequence('package', 'test-unit');
    });


    // Package
    gulp.task('package', function() {
        runSequence('clean', 'jshint', 'build-css', 'build-js', 'build-html');
    });


    // Default task, build all
    gulp.task('default', ['build-all']);

})(require);
