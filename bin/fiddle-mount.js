/*
 * This module provides a function to join jsfiddle examples into single fancy html output.
 * The examples must have the following layout:
 *   example_name
 *    |- demo.html
 *    |- demo.js
 *    \- demo.css
 *
 */
const path = require('path');
const fs = require('fs');

/*
 * Generate html output for given example.
 * Calls callback(contents) when the contents of the output html file is generated.
 */
module.exports = (exampleName, examplesPath, callback) => {
  const exampleDir = path.resolve(__dirname, examplesPath, exampleName);
  
  if(!exampleName) {
    const examplesList = fs.readdirSync(examplesPath).map(function(name){
      return `
<li>
  <a href="./example/${name}">${name}</a>
</li>
`;
    }).join('');
    
    
    const result = `
<!doctype html>

<html lang="en">
<head>
  <meta charset="utf-8">

  <title>Examples</title>
  <meta name="description" content="jquery-usos examples">
  <meta name="author" content="Piotr Styczyński">
  
</head>
<body style="color: black;">
  <b>All available jquery-usos examples:</b>
  <ul>
    ${examplesList}
  </ul>
</body>
</html>
`;
  
    callback(result);
    return;
  }
  
  
  fs.readFile(path.resolve(exampleDir, 'demo.css'), (err, data) => {
    if (err) throw err;
    const cssContents = data.toString();
    
    fs.readFile(path.resolve(exampleDir, 'demo.js'), (err, data) => {
      if (err) throw err;
      const jsContents = data.toString();
      
      fs.readFile(path.resolve(exampleDir, 'demo.html'), (err, data) => {
        if (err) throw err;
        const htmlContents = data.toString();
        
        const result = `
<!doctype html>

<html lang="en">
<head>
  <meta charset="utf-8">

  <title>Example ${exampleName}</title>
  <meta name="description" content="${exampleName} jquery-usos example">
  <meta name="author" content="Piotr Styczyński">
  
  <script src="./js/jquery-1.9.1.js"></script>
  <script src="./js/jquery-migrate-1.1.0.js"></script>
  <script src="./js/jquery-ui-1.10.1.custom.js"></script>
  <script src="./lib/jquery-usos.min.js"></script>
  
  <link rel="stylesheet" href="./css/jquery-ui-1.10.1.custom.css">
  <link rel="stylesheet" href="./lib/jquery-usos.css">

  
</head>

<style>
${cssContents}
</style>

<script>
${jsContents}
</script>

<body>
${htmlContents}
</body>

</html>
`;

        callback(result);
      });
    });
  });
};