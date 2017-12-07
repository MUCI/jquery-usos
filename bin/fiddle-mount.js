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
 *
 * If exampleName is null then the index file with links is generated.
 * If exampleName is '*' then one big file with all examples is generated.
 *
 * If onlyBody is true then the contents of <body></body> is returned.
 */
const parse = (exampleName, examplesPath, callback, onlyBody=false, conf=null) => {
  const exampleDir = path.resolve(__dirname, examplesPath, exampleName);
  
  // Make one big html out of all examples
  if(exampleName == '*') {
    
    const examples = fs.readdirSync(path.resolve(__dirname, examplesPath));
    
    const examplesJoined = (acc) => {
              const result = `
<!doctype html>

<html lang="en">
<head>
  <meta charset="utf-8">

  <title>Example ${exampleName}</title>
  <meta name="description" content="${exampleName} jquery-usos example">
  <meta name="author" content="Piotr Styczyński">
  
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css" integrity="sha384-PsH8R72JQ3SOdhVi3uxftmaW6Vc51MKb0q5P2rRUpPvrszuE4W1povHYgTpBfshb" crossorigin="anonymous">
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/js/bootstrap.min.js" integrity="sha384-alpBpkh1PFOepccYVYDB4do5UnbKysX5WZXm3XxPqe5iKTfUKjNkCk9SaVuEZflJ" crossorigin="anonymous"></script>
  
  
  <script src="../src/vendor/jquery-1.9.1.js"></script>
  <script src="../src/vendor/jquery-migrate-1.1.0.js"></script>
  <script src="../src/vendor/jquery-ui-1.10.1.custom.js"></script>
  <script src="../lib/jquery-usos.min.js"></script>
  
  <link rel="stylesheet" href="./jquery-ui-1.10.1.custom.css">
  <link rel="stylesheet" href="./tooltipster.css">
  <link rel="stylesheet" href="../lib/jquery-usos.css">

</head>

<body>

<style>
h1 {
    font-size: 200%;
    width: 100%;
    background-color: #416067;
    height: 43px;
    color: white;
    padding-top: 2px;
    margin-left: -40px;
    margin-bottom: 20px;
    padding-left: 30px;
}
.exampleContent {
  margin-top: 66px;
  margin-bottom: -38px;
}
.htmlExampleContents {
  margin-left: 90px;
  display: block;
}
p {
  margin-top: 5px;
  margin-bottom: 5px;
}
.header {
  width: 100%;
  background-color: black;
  position: fixed;
  top: 0px;
}
.header > img {
  box-shadow: 0px 0px 141px #161616;
  color: black;
  border-radius: 184px;
  height: 50px;
}
.header > span {
  color: white;
  margin-left: 15px;
  font-weight: 600;
  z-index: 9999999 !important;
}
</style>

<div class="header">
<img src="https://avatars1.githubusercontent.com/u/2855566?s=200&v=4" />
<span>
  JQuery-USOS version ${conf.version}
</span>
</div>


${acc}

</body>

</html>
`;
       callback(result);
    };
    
    const exampleJoinCallback = (acc, i) => {
      if(i >= examples.length) {
        examplesJoined(acc);
        return;
      }
      parse(examples[i], examplesPath, (result) => {
      exampleJoinCallback(acc + '\n' + `<div class="exampleContent">${result}</div>`, i+1);
      }, true, conf);
    };
    
    exampleJoinCallback('', 0);
    
    return;
  }
  
  
  if(!exampleName) {
    const examplesList = fs.readdirSync(examplesPath).map(function(name){
      return `
<li>
  <a href="./example/${name}">${name}</a>
</li>
`;
    }).join('');
    
    const body = `
  <b>All available jquery-usos examples:</b>
  <ul>
    ${examplesList}
  </ul>
`;
    
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
  ${body}
</body>
</html>
`;
  
    if(onlyBody) {
      callback(body);
    } else {
      callback(result);
    }
        
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
        
            const body = `
<span class="htmlExampleContents">
  ${htmlContents.replace(/Demo/ig, '')}

  <!-- <pre><code>${jsContents}</code></pre> -->
  
</span>
<style>
  ${cssContents}
</style>

<script>
  ${jsContents}
</script>
`;
        
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
  <link rel="stylesheet" href="./css/tooltipster.css">
  <link rel="stylesheet" href="./lib/jquery-usos.css">

  
</head>

<body>

${body}

</body>

</html>
`;

        if(onlyBody) {
          callback(body);
        } else {
          callback(result);
        }
      });
    });
  });
};

module.exports = parse;