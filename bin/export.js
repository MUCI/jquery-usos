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

// jquery-usos input paths
const IN_PATHS = {
  dist:   '../lib/jquery-usos.min.js',
  vendor: '../src/vendor',
  devel:  '../src/js',
  css:    '../lib/jquery-usos.css',
  fonts:  '../lib/fonts',
  images: '../lib/images'
};

// usosweb output paths
const OUT_PATHS = {
  dist:   'www/js/jquery-usos/latest-bundle.min.js',
  vendor: 'www/js/jquery-usos',
  devel:  'www/js/jquery-usos/devel',
  css:    'www/css/jquery-usos/jquery-usos.css',
  fonts:  'www/css/jquery-usos/fonts',
  images: 'www/css/jquery-usos/images'
};


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
const validateExportDirStructure = (dir) => {
  let result = true;
  ([OUT_PATHS.dist]).map((requiredPath) => {
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
const validateExportDir = (value) => {
  value = path.resolve(__dirname, '..', value);
  let isDir = false;
  try {
    if(fs.lstatSync(value).isDirectory()) {
      return validateExportDirStructure(value);
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
const loadConfig = (loadConfigFile, data, proceed) => {
  if(!loadConfigFile) {
    inquirer.prompt([
      {
          type: 'input',
          name: 'exportPath',
          message: "What's the export path (USOSWEB e.g. ../usosweb)?",
          validate: function(value) {
            return validateExportDir(value);
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
        loadConfig(false, null, proceed);
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
const cleanExportPath = (outPath, conf) => {
  console.log(('[-] Removing previous build from '+outPath).info);
  
  if(IN_PATHS.vendor) {
    const tgtPath = path.resolve(outPath, OUT_PATHS.vendor);
    console.log((`    del ${tgtPath}`).debug);
    del.sync([ path.resolve(tgtPath, '**', '*.*') ], {force: true});
  }
  
  if(IN_PATHS.devel) {
    const tgtPath = path.resolve(outPath, OUT_PATHS.devel);
    console.log((`    del ${tgtPath}`).debug);
    del.sync([ path.resolve(tgtPath, '**', '*.*') ], {force: true});
  }
  
  if(IN_PATHS.fonts) {
    const tgtPath = path.resolve(outPath, OUT_PATHS.fonts);
    console.log((`    del ${tgtPath}`).debug);
    del.sync([ path.resolve(tgtPath, '**', '*.*') ], {force: true});
  }
  
  if(IN_PATHS.images) {
    const tgtPath = path.resolve(outPath, OUT_PATHS.images);
    console.log((`    del ${tgtPath}`).debug);
    del.sync([ path.resolve(tgtPath, '**', '*.*') ], {force: true});
  }
};

/*
 * Performs export operation for given usosweb path and configuration object.
 */
const doExport = (outPath, conf) => {
    
  cleanExportPath(outPath, conf);
  
  console.log(('[+] Export will be placed into "'+outPath+'" directory.').info);
  
  if(IN_PATHS.dist) {
    console.log('[+] Copy bundle...'.info);
    const srcPath = path.resolve(__dirname, IN_PATHS.dist);
    const tgtPath = path.resolve(outPath, OUT_PATHS.dist);
    console.log((`    from ${srcPath} to ${tgtPath}`).debug);
    fs.createReadStream(srcPath).pipe(fs.createWriteStream(tgtPath));
  }
  
  if(IN_PATHS.vendor) {
    console.log('[+] Copy vendor files...'.info);
    const srcPath = path.resolve(__dirname, IN_PATHS.vendor);
    const tgtPath = path.resolve(outPath, OUT_PATHS.vendor);
    console.log((`    from ${srcPath} to ${tgtPath}`).debug);
    
    //del.sync([ path.resolve(tgtPath, '**', '*.*') ], {force: true});
    ncp(srcPath, tgtPath, function (err) {
      if (err) {
        return console.error(err);
      }
    });
  }
  
  if(IN_PATHS.devel) {
    console.log('[+] Copy devel files...'.info);
    const srcPath = path.resolve(__dirname, IN_PATHS.devel);
    const tgtPath = path.resolve(outPath, OUT_PATHS.devel);
    console.log((`    from ${srcPath} to ${tgtPath}`).debug);
    
    //del.sync([ path.resolve(tgtPath, '**', '*.*') ], {force: true});
    ncp(srcPath, tgtPath, function (err) {
      if (err) {
        return console.error(err);
      }
    });
  }
  
  if(IN_PATHS.css) {
    console.log('[+] Copy css bundle...'.info);
    const srcPath = path.resolve(__dirname, IN_PATHS.css);
    const tgtPath = path.resolve(outPath, OUT_PATHS.css);
    console.log((`    from ${srcPath} to ${tgtPath}`).debug);
    fs.createReadStream(srcPath).pipe(fs.createWriteStream(tgtPath));
  }
  
  if(IN_PATHS.fonts) {
    console.log('[+] Copy fonts...'.info);
    const srcPath = path.resolve(__dirname, IN_PATHS.fonts);
    const tgtPath = path.resolve(outPath, OUT_PATHS.fonts);
    console.log((`    from ${srcPath} to ${tgtPath}`).debug);
    
    //del.sync([ path.resolve(tgtPath, '**', '*.*') ], {force: true});
    ncp(srcPath, tgtPath, function (err) {
      if (err) {
        return console.error(err);
      }
    });
  }
  
  if(IN_PATHS.images) {
    console.log('[+] Copy images...'.info);
    const srcPath = path.resolve(__dirname, IN_PATHS.images);
    const tgtPath = path.resolve(outPath, OUT_PATHS.images);
    console.log((`    from ${srcPath} to ${tgtPath}`).debug);
    
    //del.sync([ path.resolve(tgtPath, '**', '*.*') ], {force: true});
    ncp(srcPath, tgtPath, function (err) {
      if (err) {
        return console.error(err);
      }
    });
  }
};

fs.readFile(exportConfigPath, (err, data) => {
  const configLoadedCallback = (conf) => {
    const exportPath = conf.exportPath;
    const validationResult = validateExportDir(exportPath);
    
    if(validationResult !== true) {
      console.log(('[-] '+validationResult).error);
      loadConfig(true, null, configLoadedCallback);
    } else {
      doExport(exportPath, conf);
    }
    
  };
  loadConfig(!err, data, configLoadedCallback);
});