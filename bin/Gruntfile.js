'use strict';

const path        = require('path');
const nodemon     = require('nodemon');
const fiddleMount = require('./fiddle-mount.js');
const fs          = require('fs');
const exportProj  = require('./export.js');

const webpackConfigCommon = require('./webpack.common.config.js');


module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-webpack');

    const buildingScriptPaths = require('../config.js').paths;

    /*
     *  Map paths from config to match current subdirectory
     */
    const PATHS =  {
        examples: path.resolve(__dirname, '..', buildingScriptPaths.examples),
        examplesOut: path.resolve(__dirname, '..', buildingScriptPaths.examplesOut),
        vendor: path.resolve(__dirname, '..', buildingScriptPaths.vendor),
        jquery: path.resolve(__dirname, '..', buildingScriptPaths.jquery),
        requireJS: path.resolve(__dirname, '..', buildingScriptPaths.requireJS),
        requireEntities: path.resolve(__dirname, '..', buildingScriptPaths.requireEntities),
        srcJS: path.resolve(__dirname, '..', buildingScriptPaths.srcJS),
        outJS: buildingScriptPaths.outJS,
        outJSPath: path.resolve(__dirname, '..', buildingScriptPaths.outJSPath),
        srcCSS: path.join(__dirname, '..', buildingScriptPaths.srcCSS),
        outCSS: path.join(__dirname, '..', buildingScriptPaths.outCSS),
        srcAssetsPath: path.join(__dirname, '..', buildingScriptPaths.srcAssetsPath),
        srcAssets:  buildingScriptPaths.srcAssets,
        outAssets: path.join(__dirname, '..', buildingScriptPaths.outAssets),
        filesToClear: buildingScriptPaths.filesToClear.map(function(dir) {
            return path.resolve(__dirname, '..', dir);
        }),
        filesToConcat: buildingScriptPaths.filesToConcat.map(function(dir) {
            return path.resolve(__dirname, '..', dir);
        }),
        filesToWatch: path.resolve(__dirname, '..', buildingScriptPaths.filesToWatch),
        buildCache: path.resolve(__dirname, '..', buildingScriptPaths.buildCache),
        exportProject: {
            in: {
                dist:   path.join('..', buildingScriptPaths.exportProject.in.dist),
                vendor: path.join('..', buildingScriptPaths.exportProject.in.vendor),
                devel:  path.join('..', buildingScriptPaths.exportProject.in.devel),
                css:    path.join('..', buildingScriptPaths.exportProject.in.css),
                fonts:  path.join('..', buildingScriptPaths.exportProject.in.fonts),
                images: path.join('..', buildingScriptPaths.exportProject.in.images),
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
        concat: {
            prod: {
                src: [PATHS.filesToConcat],
                dest: path.resolve(__dirname, '..', PATHS.outJSPath, PATHS.outJS)
            }
        },
        webpack: {
            dev: function() {
                return webpackConfigCommon('dev', PATHS)
            },
            prod: function() {
                return webpackConfigCommon('prod', PATHS)
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
                    dest: PATHS.outCSS,
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

    grunt.registerTask('export', 'Export the project into USOSWeb.', function () {
        const done = this.async();
        exportProj(PATHS.exportProject, done);
    });

    grunt.registerTask('build:examples', 'Build js-fiddle examples.', function () {
        fiddleMount('index.html', PATHS.examples, PATHS.examplesOut, {
            version: webpackConfigCommon('dev', null)['$VERSION']
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

    grunt.registerTask('concat-js.prod', [
        'concat:prod'
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
        'concat:prod',
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
