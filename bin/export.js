/*
 * Script for exporting build and devel files into the usosweb project.
 * Usage:
 *    node ./bin/export.js
 *
 * It will prompt for any info it needs.
 */
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

// Checks if directories/files exist inside usosweb folder
const validateExportDirStructure = (paths, dir) => {
  let result = true;
  ([paths.out.dist]).map((requiredPath) => {
    try {
      const lstat = fs.lstatSync(path.resolve(dir, requiredPath, '..'));
      if(!lstat.isDirectory() && !lstat.isFile()) {
        result = 'Invalid USOSWeb directory: ${requiredPath} in not a valid file/directory!';
      }
    } catch(e) {
      result = `Directory ${dir} does not contain ${requiredPath} therefore it's not valid usosweb directory!`;
    }
  });
  return result;
};

// Checks if gven directory is a valid usosweb project
const validateExportDir = (paths, value) => {
  value = path.resolve(__dirname, '..', value);
  let isDir = false;
  try {
    if(fs.lstatSync(value).isDirectory()) {
      return validateExportDirStructure(paths, value);
    }
  } catch(e) {
     return 'Problem accessing path: '+e.toString();
  }
  return 'Please enter a valid directory.';
};

/* Loads configuration
 * loadConfigFile - should i load config from .export.json?
 * data           - if loadConfigFile is true this must be contents of .export.json
 *                  otherwise may be null - in that case we prompt user for data
 * proceed(o)     - callback called for parsed configuration object
 */
const loadConfig = (paths, loadConfigFile, data, proceed) => {
  if(!loadConfigFile) {
    inquirer.prompt([
      {
          type: 'input',
          name: 'exportPath',
          message: "What's the export path (USOSWEB e.g. ../usosweb)?",
          validate: function(value) {
            return validateExportDir(paths, value);
          }
      },
      {
        type: 'confirm',
        name: 'saveExportPath',
        message: 'Save the export path in local .export.json?',
        default: true
      }
    ]).then(answers => {
      if(answers.saveExportPath) {
        const conf = {
          exportPath: answers.exportPath
        };
        fs.writeFile(exportConfigPath, JSON.stringify(conf), (err) => {
          if (err) throw err;
          console.log(('[+] The file .export.json has been created.').info);
          proceed(conf);
        });
      }
    });
  } else {
    console.log(('[+] Loaded config from .export.json file').info);
    inquirer.prompt([
      {
        type: 'confirm',
        name: 'continueWithCurrentConfig',
        message: 'Continue with loaded config?',
        default: true
      }
    ]).then(answers => {
      if(!answers.continueWithCurrentConfig) {
        loadConfig(paths, false, null, proceed);
      } else {
         const conf = JSON.parse(data);
         inquirer.prompt([
           {
             type: 'confirm',
             name: 'proceedPath',
             message: 'Export will be performed into '+conf.exportPath+', shall I proceed?',
             default: true
          }
        ]).then(answers => {
          if(answers.proceedPath) {
            proceed(conf);
          } else {
            return;
          }
        });
      }
    });
  }
};

/*
 * Cleans current eported files
 */
const cleanExportPath = (paths, outPath, conf) => {
  console.log(('[-] Removing previous build from '+outPath).info);

  if(paths.in.vendor) {
    const tgtPath = path.resolve(outPath, paths.out.vendor);
    console.log((`    del ${tgtPath}`).debug);
    del.sync([ path.resolve(tgtPath, '**', '*.*') ], {force: true});
  }

  if(paths.in.devel) {
    const tgtPath = path.resolve(outPath, paths.out.devel);
    console.log((`    del ${tgtPath}`).debug);
    del.sync([ path.resolve(tgtPath, '**', '*.*') ], {force: true});
  }

  if(paths.in.fonts) {
    const tgtPath = path.resolve(outPath, paths.out.fonts);
    console.log((`    del ${tgtPath}`).debug);
    del.sync([ path.resolve(tgtPath, '**', '*.*') ], {force: true});
  }

  if(paths.in.images) {
    const tgtPath = path.resolve(outPath, paths.out.images);
    console.log((`    del ${tgtPath}`).debug);
    del.sync([ path.resolve(tgtPath, '**', '*.*') ], {force: true});
  }
};

/*
 * Performs export operation for given usosweb path and configuration object.
 */
const doExport = (paths, outPath, conf, onExportExit) => {

  cleanExportPath(paths, outPath, conf);

  let completedTasksCount = 0;
  let allTasksCount = 0;

  const onStartTask = () => {
    ++allTasksCount;
  };

  const onEndTask = () => {
    ++completedTasksCount;
    if(allTasksCount <= completedTasksCount) {
      console.log(('[^] Export done into "'+outPath+'" directory.').info);
      onExportExit();
    }
  };

  console.log(('[+] Export will be placed into "'+outPath+'" directory.').info);
  onStartTask();

  if(paths.in.dist) {
    console.log('[+] Copy bundle...'.info);
    const srcPath = path.resolve(__dirname, paths.in.dist);
    const tgtPath = path.resolve(outPath, paths.out.dist);
    console.log((`    from ${srcPath} to ${tgtPath}`).debug);
    onStartTask();
    fs.createReadStream(srcPath).pipe(fs.createWriteStream(tgtPath)).on('finish', () => {
      onEndTask();
    });
  }

  if(paths.in.vendor) {
    console.log('[+] Copy vendor files...'.info);
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

  if(paths.in.devel) {
    console.log('[+] Copy devel files...'.info);
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

  if(paths.in.css) {
    console.log('[+] Copy css bundle...'.info);
    const srcPath = path.resolve(__dirname, paths.in.css);
    const tgtPath = path.resolve(outPath, paths.out.css);
    console.log((`    from ${srcPath} to ${tgtPath}`).debug);

    onStartTask();
    fs.createReadStream(srcPath).pipe(fs.createWriteStream(tgtPath)).on('finish', () => {
      onEndTask();
    });
  }

  if(paths.in.fonts) {
    console.log('[+] Copy fonts...'.info);
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

  if(paths.in.images) {
    console.log('[+] Copy images...'.info);
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
  fs.readFile(exportConfigPath, (err, data) => {
    const configLoadedCallback = (conf) => {
      const exportPath = conf.exportPath;
      const validationResult = validateExportDir(paths, exportPath);

      if(validationResult !== true) {
        console.log(('[-] '+validationResult).error);
        loadConfig(paths, true, null, configLoadedCallback);
      } else {
        doExport(paths, exportPath, conf, onExportExit);
      }

    };
    loadConfig(paths, !err, data, configLoadedCallback);
  });
}
