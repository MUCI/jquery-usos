/*
 * This is express server that serves examples.
 * Great for demonstrations of jquery-usos functionality!
 */
const express = require('express');
const app = express();
const fiddleMount = require('./fiddle-mount.js');
const fs = require('fs');

/*
 * Path to access the examples
 */
const examplesPath = '../examples';

app.use('/src', express.static('./src'));

app.use('/lib', express.static('./lib'));

app.use('/jquery-ui-theme', express.static('./jquery-ui-theme'));

app.use('/', express.static('./htdocs'));

app.listen(3000, () => {
  console.log("[SERVER] Running on port 3000");
});
