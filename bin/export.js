/*
 * Script for exporting build and devel files into the USOSweb project.
 * Usage: node ./bin/export.js
 */
 'use strict';

const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const ncp = require('ncp').ncp;
const colors = require('colors');
const del = require('del');

// Path to config storage
const exportConfigPath = path.resolve(__dirname, '../.export.json');

colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

const validateExportDir = function (paths, value) {
    value = path.resolve(__dirname, '..', value);
    try {
        if (fs.lstatSync(value).isDirectory()) {
            ([paths.out.dist]).map(function (requiredPath) {
                const lstat = fs.lstatSync(path.resolve(value, requiredPath, '..'));
            });
        }
    } catch(e) {
        return {
            'success' : 'false',
            'message' : 'Problem accessing path: ' + e.toString() + '\nPlease enter a valid directory.'
        };
    }

    return { 'success' : true };
};

const loadConfigFromInput = function (paths) {
    return new Promise( function (resolve) {
        inquirer.prompt([
            {
                type: 'input',
                name: 'exportPath',
                message: "Please specify the export path (root USOSweb directory, e.g. ../usosweb):",
                validate: function (value) {
                    const result = validateExportDir(paths, value);
                    if (!result.success) {
                        return result.message;
                    }
                    return result.success;
                }
            },
            {
                type: 'confirm',
                name: 'saveExportPath',
                message: 'Save the export path in local .export.json file?',
                default: true
            }
        ]).then(function (answers) {
            if (answers.saveExportPath) {
                fs.writeFile(exportConfigPath, JSON.stringify({exportPath: answers.exportPath}), function (err) {
                    if (err) throw err;
                    console.log(('[+] File .export.json created.').info);
                });
            }
            resolve({exportPath: answers.exportPath});
        });
    });
};

const loadConfigFromFile = function (paths, data) {
    return new Promise (function (resolve) {
        console.log(('[+] Loaded config from .export.json file').info);
        inquirer.prompt([
            {
                type: 'confirm',
                name: 'continueWithCurrentConfig',
                message: 'Continue with loaded config?',
                default: true
            }
        ]).then(function (answers) {
            if (!answers.continueWithCurrentConfig) {
                loadConfigFromInput(paths).then( function (conf) {
                    resolve(conf);
                });
            } else {
                const conf = JSON.parse(data);
                inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'proceedPath',
                        message: 'Files will be exported to ' + conf.exportPath + '. Proceed?',
                        default: true
                    }
                ]).then(function (answers) {
                    if (answers.proceedPath) {
                        resolve(conf);
                    } else {
                        loadConfigFromInput(paths).then( function (conf) {
                            resolve(conf);
                        });
                    }
                });
            }
        });
    });
};

/*
 * Cleans current exported files
 */
const cleanExportPath = function (paths, outPath) {
    console.log(('[-] Removing previous build from ' + outPath).info);

    if (paths.in.vendor) {
        const tgtPath = path.resolve(outPath, paths.out.vendor);
        console.log((`    del ${tgtPath}`).debug);
        del.sync([ path.resolve(tgtPath, '**', '*.*') ], {force: true});
    }

    if (paths.in.devel) {
        const tgtPath = path.resolve(outPath, paths.out.devel);
        console.log((`    del ${tgtPath}`).debug);
        del.sync([ path.resolve(tgtPath, '**', '*.*') ], {force: true});
    }

    if (paths.in.fonts) {
        const tgtPath = path.resolve(outPath, paths.out.fonts);
        console.log((`    del ${tgtPath}`).debug);
        del.sync([ path.resolve(tgtPath, '**', '*.*') ], {force: true});
    }

    if (paths.in.images) {
        const tgtPath = path.resolve(outPath, paths.out.images);
        console.log((`    del ${tgtPath}`).debug);
        del.sync([ path.resolve(tgtPath, '**', '*.*') ], {force: true});
    }
};

/*
 * Performs export operation for given USOSweb path and configuration object.
 */
const doExport = function (paths, outPath, onExportExit) {

    cleanExportPath(paths, outPath);

    let completedTasksCount = 0;
    let allTasksCount = 0;

    const onStartTask = function () {
        ++allTasksCount;
    };

    const onEndTask = function () {
        ++completedTasksCount;
        if (allTasksCount <= completedTasksCount) {
            console.log(('[^] Export to "' + outPath + '" finished.').info);
            onExportExit();
        }
    };

    console.log(('[+] Exported files will be placed in the directory "' + outPath + '".').info);
    onStartTask();

    if (paths.in.dist) {
        console.log('[+] Copying bundle...'.info);
        const srcPath = path.resolve(__dirname, paths.in.dist);
        const tgtPath = path.resolve(outPath, paths.out.dist);
        console.log((`    from ${srcPath} to ${tgtPath}`).debug);
        onStartTask();
        fs.createReadStream(srcPath).pipe(fs.createWriteStream(tgtPath)).on('finish', function () {
            onEndTask();
        });
    }

    if (paths.in.vendor) {
        console.log('[+] Copying vendor files...'.info);
        const srcPath = path.resolve(__dirname, paths.in.vendor);
        const tgtPath = path.resolve(outPath, paths.out.vendor);
        console.log((`    from ${srcPath} to ${tgtPath}`).debug);

        onStartTask();
        ncp(srcPath, tgtPath, function (err) {
            onEndTask();
            if (err) {
                return console.error(err);
            }
        });
    }

    if (paths.in.devel) {
        console.log('[+] Copying development files...'.info);
        const srcPath = path.resolve(__dirname, paths.in.devel);
        const tgtPath = path.resolve(outPath, paths.out.devel);
        console.log((`    from ${srcPath} to ${tgtPath}`).debug);

        onStartTask();
        ncp(srcPath, tgtPath, function (err) {
            onEndTask();
            if (err) {
                return console.error(err);
            }
        });
    }

    if (paths.in.css) {
        console.log('[+] Copying css bundle...'.info);
        const srcPath = path.resolve(__dirname, paths.in.css);
        const tgtPath = path.resolve(outPath, paths.out.css);
        console.log((`    from ${srcPath} to ${tgtPath}`).debug);

        onStartTask();
        fs.createReadStream(srcPath).pipe(fs.createWriteStream(tgtPath)).on('finish', function () {
            onEndTask()
        });
    }

    if (paths.in.fonts) {
        console.log('[+] Copying fonts...'.info);
        const srcPath = path.resolve(__dirname, paths.in.fonts);
        const tgtPath = path.resolve(outPath, paths.out.fonts);
        console.log((`    from ${srcPath} to ${tgtPath}`).debug);

        onStartTask();
        ncp(srcPath, tgtPath, function (err) {
            onEndTask();
            if (err) {
                return console.error(err);
            }
        });
    }

    if (paths.in.images) {
        console.log('[+] Copying images...'.info);
        const srcPath = path.resolve(__dirname, paths.in.images);
        const tgtPath = path.resolve(outPath, paths.out.images);
        console.log((`    from ${srcPath} to ${tgtPath}`).debug);

        onStartTask();
        ncp(srcPath, tgtPath, function (err) {
            onEndTask();
            if (err) {
                return console.error(err);
            }
        });
    }

    onEndTask();
};

module.exports = function(paths, onExportExit) {
    fs.readFile(exportConfigPath, function (err, data) {
        const configPromise = err? loadConfigFromInput(paths) : loadConfigFromFile(paths, data);

        const processConfig = function(config) {
            const validationResult = validateExportDir(paths, config.exportPath);

            if (!validationResult.success) {
                console.log(validationResult.message);
                loadConfigFromFile(paths, null).then( function (newConfig) {
                    processConfig(newConfig);
                });
            } else {
                doExport(paths, config.exportPath, onExportExit);
            }
        };

        configPromise.then( function (config) {
            processConfig(config)
        });
    });
};
