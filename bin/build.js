/*
 * This is main building file.
 * It should be runned through gulp i.e. gulp clean --gulpfile ./bin/build.js
 *
 */
const gulp        = require('gulp');
const runSeq      = require('run-sequence');
const del         = require('del');
const plumber     = require('gulp-plumber');
const cache       = require('gulp-cached');
const webpack     = require('webpack');
const gulpWebpack = require('webpack-stream');
const path        = require('path');
const nodemon     = require('gulp-nodemon');
const livereload  = require('gulp-livereload');
const stylus      = require('gulp-stylus');
const fiddleMount = require('./fiddle-mount.js');
const fs          = require('fs');


/*
 * Function generating webpack config
 */
const webpackConfigCommon = require('./webpack.common.config.js');

/*
 * All paths used by buildin scripts
 */
const PATHS = {
  examples: path.resolve(__dirname, '../examples'),
  examplesOut: path.resolve(__dirname, '../htdocs/index.html'),
  vendor: path.resolve(__dirname, '../src/vendor'),
  requireJS: path.resolve(__dirname, '../src/js'),
  requireEntities: path.resolve(__dirname, '../src/js/entities'),
  srcJS: path.resolve(__dirname, '../src/jquery-usos.js'),
  outJS: 'jquery-usos.min.js',
  outJSPath: path.resolve(__dirname, '../lib/'),
  srcCSS: path.join(__dirname, '../src/jquery-usos.scss'),
  outCSS: path.join(__dirname, '../lib/'),
  srcAssets:  [
    // Do not include jquery-ui assets in final dist
    //path.join(__dirname, '../src/assets/jquery-ui-theme/**/*.*'),
    path.join(__dirname, '../src/assets/**/*.*'),
  ],
  outAssets: path.join(__dirname, '../lib/'),
  filesToClear: path.resolve(__dirname, '../lib/**/*.*'),
  filesToWatch: path.resolve(__dirname, '../src/**/*.*'),
  buildCache: path.resolve(__dirname, '../build-cache')
};

/*
 * Cleans output directory.
 */

gulp.task('clean', function(){
  return del([
    PATHS.filesToClear
  ], {force: true});
});

/*
 * Helpers for building js files.
 */

gulp.task('js:release', function(callback){
  return gulp.src(PATHS.srcJS)
    .pipe(cache('webpack', {optimizeMemory: true}))
    .pipe(plumber())
    .pipe(gulpWebpack( webpackConfigCommon(PATHS, 'prod') ))
    .pipe(gulp.dest(PATHS.outJSPath));
});

gulp.task('js:dev', function(callback){
  return gulp.src(PATHS.srcJS)
    .pipe(cache('webpack', {optimizeMemory: true}))
    .pipe(plumber())
    .pipe(gulpWebpack( webpackConfigCommon(PATHS, 'dev') ))
    .pipe(gulp.dest(PATHS.outJSPath));
});

gulp.task('build:release', function(callback){
  runSeq('clean', 'js:release', 'css:release', 'assets');
});

gulp.task('build:dev', function(callback){
  runSeq('clean', 'js:dev', 'css:dev', 'assets');
});


/*
 * Join and minify css through stylus.
 */

gulp.task('css:dev', function () {
  return gulp.src(PATHS.srcCSS)
    .pipe(stylus({
      'include css': true
    }))
    .pipe(gulp.dest(PATHS.outCSS));
});

gulp.task('css:release', function () {
  return gulp.src(PATHS.srcCSS)
    .pipe(stylus({
      'include css': true,
      compress: true
    }))
    .pipe(gulp.dest(PATHS.outCSS));
});

/*
 * Build all assets files (fonts, images etc.)
 */
gulp.task('assets', function () {
  return gulp.src(PATHS.srcAssets)
    .pipe(gulp.dest(PATHS.outAssets));
});

/*
 * Build release version
 */
 
gulp.task('release', function(){
  gulp.start('build:release', 'examples');
});

/*
 * Builds htdocs/index.html
 */
gulp.task('examples', function(){
  fiddleMount('*', PATHS.examples, (content) => {
    fs.writeFileSync(PATHS.examplesOut, content);
  }, false, {
    version: webpackConfigCommon(null, 'dev')['$VERSION']
  });
});