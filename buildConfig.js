/*
 * This file is used to define global variables.
 * i.e. debug switches etc.
 *
 * All variables are available in webpack.common.config.js via buildConfig object.
 * Or in any source (you just reference for example $DEBUG variable and it's replaced during compilation).
 *
 * You can also reference package.json variables (you don't have to copy here any thing from package.json).
 * All attributes from package.json are mapped to their upper case variants prefixed with $.
 * This attributes are available in all places as values defined below.
 *
 * Example:
 *
 *   If you define:
 *     
 *     'dev': {
 *       '$HELLO': 42
 *     },
 *     'prod': {
 *       '$HELLO': false
 *     }
 *
 *   And then in code we do:
 *      if($HELLO == 42) console.log("Hello world! 42");
 *
 *   For all bundles generated with `npm run build` (dev mode) there will be displayed a message.
 *   For all bundles generated with `npm run release` (prod mode) there will be no output.
 *   Furthermore uglify will remove unreachable if branch.
 *
 * Another example:
 *
 *   If in package.json you have:
 *     "name": "something"
 * 
 *   Then you can normally use $NAME in code:
 * 
 *     console.log($NAME);
 */
module.exports = {
  // Example configuration
  'example': {
    "$BANNER": "",   // Banner to be added at the begining of bundle
    "$DEBUG":  true  // Enable/disable debug mode. Used to indicate if we are in dev or prod mode
  },
  'dev': {
    "$BANNER": " jQuery-USOS $VERSION -- https://github.com/MUCI/jquery-usos ",
    "$DEBUG": true
  },
  'prod': {
    "$BANNER": " jQuery-USOS $VERSION -- https://github.com/MUCI/jquery-usos ",
    "$DEBUG": false
  }
};