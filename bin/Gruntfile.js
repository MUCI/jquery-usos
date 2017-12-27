'use strict';

/*
 * This is main building file.
 * It should be runned through gulp i.e. gulp clean --gulpfile ./bin/build.js
 *
 */

const path        = require('path');
const nodemon     = require('gulp-nodemon');
const fiddleMount = require('./fiddle-mount.js');
const fs          = require('fs');
const exportProj  = require('./export.js');

/*
 * Function generating webpack config
 */
const webpackConfigCommon = require('./webpack.common.config.js');


module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.loadNpmTasks('grunt-webpack');

    /*
     * All paths used by buildin scripts
     */
    const relConfigPaths = require('../config.js').paths;

    /*
     *  Map paths from config to match current subdirectory
     */
    const PATHS =  {
      examples: path.resolve(__dirname, '..', relConfigPaths.examples),
      examplesOut: path.resolve(__dirname, '..', relConfigPaths.examplesOut),
      vendor: path.resolve(__dirname, '..', relConfigPaths.vendor),
      requireJS: path.resolve(__dirname, '..', relConfigPaths.requireJS),
      requireEntities: path.resolve(__dirname, '..', relConfigPaths.requireEntities),
      srcJS: path.resolve(__dirname, '..', relConfigPaths.srcJS),
      outJS: relConfigPaths.outJS,
      outJSPath: path.resolve(__dirname, '..', relConfigPaths.outJSPath),
      srcCSS: path.join(__dirname, '..', relConfigPaths.srcCSS),
      outCSS: path.join(__dirname, '..', relConfigPaths.outCSS),
      srcAssetsPath: path.join(__dirname, '..', relConfigPaths.srcAssetsPath),
      srcAssets:  relConfigPaths.srcAssets,
      outAssets: path.join(__dirname, '..', relConfigPaths.outAssets),
      filesToClear: relConfigPaths.filesToClear.map(function(dir) {
          return path.resolve(__dirname, '..', dir);
      }),
      filesToWatch: path.resolve(__dirname, '..', relConfigPaths.filesToWatch),
      buildCache: path.resolve(__dirname, '..', relConfigPaths.buildCache),
      exportProject: {
        in: {
          dist:   path.join('..', relConfigPaths.exportProject.in.dist),
          vendor: path.join('..', relConfigPaths.exportProject.in.vendor),
          devel:  path.join('..', relConfigPaths.exportProject.in.devel),
          css:    path.join('..', relConfigPaths.exportProject.in.css),
          fonts:  path.join('..', relConfigPaths.exportProject.in.fonts),
          images: path.join('..', relConfigPaths.exportProject.in.images),
        },
        out: {
          dist:   'www/js/jquery-usos/latest-bundle.min.js',
          vendor: 'www/js/jquery-usos',
          devel:  'www/js/jquery-usos/devel',
          css:    'www/css/jquery-usos/jquery-usos.css',
          fonts:  'www/css/jquery-usos/fonts',
          images: 'www/css/jquery-usos/images'
        }
      }
    };


    grunt.initConfig({
        clean: {
            build: {
                options: {
                    force: true
                },
                src: PATHS.filesToClear
            }
        },
        webpack: {
            dev: function() {
                return webpackConfigCommon(PATHS, 'dev')
            },
            prod: function() {
                return webpackConfigCommon(PATHS, 'prod')
            }
        },
        stylus: {
          dev: {
            options: {
              paths: [],
              'include css': true
            },
            files: [{
              src: [ PATHS.srcCSS ],
              dest: PATHS.outCSS,
              ext: '.css'
            }]
          },
          prod: {
            options: {
              paths: [],
              'include css': true,
              compress: true
            },
            files: [{
              src: [ PATHS.srcCSS ],
              dest: path.relative(__dirname, PATHS.outAssets),
              ext: '.css'
            }]
          }
        },
        copy: {
          assets: {
            files: [{
              expand: true,
              cwd: PATHS.srcAssetsPath,
              src: PATHS.srcAssets,
              dest: PATHS.outAssets
            }],
          },
        },
    });

    grunt.registerTask('nodemon:server', 'Run static localhost server.', function() {
        const done = this.async();
        nodemon({
          'script': './bin/server.js'
        });
    });

    grunt.registerTask('export', 'Export the project into USOSWeb.', function() {
        const done = this.async();
        exportProj(PATHS.exportProject, done);
    });

    grunt.registerTask('build:examples', 'Build js-fiddle examples.', function() {
      const done = this.async();
      fiddleMount('index.html', PATHS.examples, PATHS.examplesOut, () => {
        done();
      }, {
        version: webpackConfigCommon(null, 'dev')['$VERSION']
      });
    });

    grunt.registerTask('css:prod', [
        'stylus:prod'
    ]);

    grunt.registerTask('css:dev', [
        'stylus:dev'
    ]);

    grunt.registerTask('js:prod', [
        'webpack:prod'
    ]);

    grunt.registerTask('js:dev', [
        'webpack:dev'
    ]);

    grunt.registerTask('build:dev', [
        'clean:build',
        'js:dev',
        'css:dev',
        'copy:assets',
        'build:examples'
    ]);

    grunt.registerTask('build:prod', [
        'clean:build',
        'js:prod',
        'css:prod',
        'copy:assets',
        'build:examples'
    ]);

    grunt.registerTask('server', [
        'build:dev',
        'nodemon:server'
    ]);

    grunt.registerTask('default', [
        'build:prod'
    ]);
};
