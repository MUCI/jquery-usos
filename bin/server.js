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

app.use('/example/lib', express.static('../lib'));

app.use('/example/js', express.static('../src/vendor'));

app.use('/example/css', express.static('../externals'));


app.get('/', function(req, res) {
  fiddleMount('', examplesPath, (result) => {
    res.send(result);
  });
});

app.get('/example/:exampleName', function (req, res) {
  const exampleName = req.params.exampleName;
  
  console.log(`[SERVER] Load example ${exampleName}`);
  fiddleMount(exampleName, examplesPath, (result) => {
    res.send(result);
  });
  
});

app.listen(3000, () => {
  console.log("[SERVER] Running on port 3000");
});

