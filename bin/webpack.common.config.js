/*
 * This file provides a function generating webpack config for various environments.
 */

/* Capture build hash to enable better caching
 * To take advantage of that you must call gulp watch.
 * The hash is generated for each call of gulp watch and each time it changes, a new cache is created.
 */
const webpackWatchProcessHash = 'webpack-'+Date.now();


const path      = require('path');
const webpack   = require('webpack');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

const configCache = {};

module.exports = function(PATHS, currentEnv) {

  console.log("[WebpackCommonConfig] Using config for "+currentEnv);

  // Load cached config
  if(configCache[currentEnv] !== undefined) {
    return configCache[currentEnv];
  }

  // Load build config file
  const buildConfig = require('../buildConfig.js')[currentEnv];
  
  // Load package.json
  const packageJson = require('../package.json');
  
  /*
   * Merge package.json attributes into final config object.
   * All properties are mapped to their upper case variants prefixed with $.
   * Example:
   * 
   *   In package.json we have:
   *     version: "1.2.0"
   *
   *   In config there is:
   *     "$VERSION": "1.2.0"
   */
  Object.keys(packageJson).forEach((key) => {
    buildConfig['$' + key.toString().toUpperCase()] = packageJson[key];
  });
  
  /*
   * Replace all variable references in all strings from buildConfig.
   *
   * For example rewrites:
   *   "$A": "$B",
   *   "$B": "hello"
   *
   * To be:
   *   "$A": "hello",
   *   "$B": "hello"
   */
  Object.keys(buildConfig).forEach((keyTarget) => {
    Object.keys(buildConfig).forEach((keySource) => {
      const valueTarget = buildConfig[keyTarget];
      // Replace occurences of keySource in keyTarget
      if(typeof valueTarget === 'string') {
        buildConfig[keyTarget] = valueTarget.replace(keySource.toString(), buildConfig[keySource]);
      }
    });
  });
  
  if(currentEnv === 'prod') {
    buildConfig['process.env'] = {
      NODE_ENV: JSON.stringify('production')
    };
  }
  
  let webpackDevtool = false;
  
  // Wrap all strings in commas to prevent webpack define plugin issue.
  const buildConfigForDefinitions = buildConfig;
  Object.keys(buildConfigForDefinitions).forEach((keyTarget) => {
    const valueTarget = buildConfigForDefinitions[keyTarget];
    if(typeof valueTarget === 'string') {
      buildConfigForDefinitions[keyTarget] = '"' + valueTarget + '"';
    }
  });
  
  let webpackPlugins = [
    new ProgressBarPlugin(),
    new webpack.DefinePlugin(buildConfigForDefinitions)
  ];
  
  let webpackLoaders = [
    {
      test: /\.css$/,
      loader: "style-loader!css-loader"
    }
  ];
  
  let webpackEntry = [
    PATHS.srcJS
  ];
  
  let webpackOutput = {};
  
  if(currentEnv === 'prod') {
    webpackOutput = {
      filename: PATHS.outJS,
      path: PATHS.outJSPath
    };
  } else if(currentEnv === 'dev') {
    webpackOutput = {
      filename: PATHS.outJS,
      path: PATHS.outJSPath
    };
  } else {
    webpackOutput = {
      filename: PATHS.outJS,
      path: PATHS.outJSPath
    };
  }
  
  if(currentEnv === 'prod') {
    
    webpackDevtool = 'source-map';
    webpackLoaders = webpackLoaders.concat([
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: [
                "env"
              ],
              /*
               * This plugin is used because not all modules are strict-mode compatible
               * That's why we disable default strict mode.
               */
              plugins: ["transform-remove-strict-mode"]
            }
          }
        ]
      }
    ]);
    
    webpackPlugins = webpackPlugins.concat([
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.optimize.UglifyJsPlugin({
        mangle: {
          eval: true,
          keep_classnames: false,
          keep_fnames: false,
          toplevel: true
        },
        comments: false,
        compress: {
          unsafe_math: true,
          unsafe_comps: true,
          unsafe: true,
          drop_console: true,
          passes: 3,
          warnings: false,
          screw_ie8: true,
          global_defs: buildConfig
        },
        output: {
          comments: false
        }
      }),
      new webpack.optimize.AggressiveMergingPlugin()
    ]);
  } else if(currentEnv === 'dev') {
    
    webpackDevtool = 'eval';
    
    webpackLoaders = webpackLoaders.concat([
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: [
                "env"
              ],
              /*
               * This plugin is used because not all modules are strict-mode compatible
               * That's why we disable default strict mode.
               */
              plugins: ["transform-remove-strict-mode"]
            }
          }
        ]
      }
    ]);
    
  }
  
  if(buildConfig['$CONFIG_BUILD_CACHE'] === true) {
    webpackPlugins = webpackPlugins.concat([
      // 70%-speedup caching
      new HardSourceWebpackPlugin({
        // Directory to store cache
        cacheDirectory: path.join(PATHS.buildCache, currentEnv, '[confighash]'),
        recordsPath: path.join(PATHS.buildCache, currentEnv, '[confighash]', 'records.json'),
        
        // Generate hash for current cache
        configHash: function(webpackConfig) {
          return `webpack-${currentEnv}`;
        },
        
        // Used to generate has for current env
        environmentHash: {
          root: '..',
          directories: ['node_modules'],
          files: [
            'package.json'
          ],
        },
      })
    ]);
  }
  
  webpackPlugins.push(new webpack.BannerPlugin(buildConfig['$BANNER']));

  // Final webpack config
  const finalConfig = {
    entry : webpackEntry,
    stats: {
      colors: true,
      reasons: true
    },
    output: webpackOutput,
    module: {
      loaders: webpackLoaders
    },
    plugins: webpackPlugins,
    node: {
      console: true,
      fs: 'empty',
      net: 'empty',
      tls: 'empty'
    },
    externals: {
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery"
    },
    resolve: {
      alias: {
        /* 
         * Aliases for modules.
         * If you would ever want to update any of these please remove/change the alias.
         */
        'css': PATHS.srcCSS,
        'js': PATHS.requireJS,
        'entities': PATHS.requireEntities,
        'autogrowtextarea': path.resolve(PATHS.vendor, 'jquery.autogrowtextarea.js'),
        'ba-bbq': path.resolve(PATHS.vendor, 'jquery.ba-bbq-1.2.1.js'),
        'colResizable': path.resolve(PATHS.vendor, 'jquery.colResizable-1.3.min.js'),
        'texttext': path.resolve(PATHS.vendor, 'jquery.textext.1.3.1.js'),
        'tooltipster': path.resolve(PATHS.vendor, 'tooltipster.js'),
        'jquery-migrate': path.resolve(PATHS.vendor, 'jquery-migrate-1.1.0.js'),
        'jquery-ui': path.resolve(PATHS.vendor, 'jquery-ui-1.10.1.custom.js'),
        'jquery-1.9.1': path.resolve(PATHS.vendor, 'jquery-1.9.1.js'),
        'jquery': path.resolve(PATHS.vendor, 'jquery-1.9.1.js')
      }
    }
  };
  
  // Store config in cache
  configCache[currentEnv] = finalConfig;
  
  // Return generated config object
  return finalConfig;
};