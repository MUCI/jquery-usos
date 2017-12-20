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
const fs =   require('fs');
const dot =  require('dot');

/*
 * Generate html output for given example.
 * Calls callback(contents) when the contents of the output html file is generated.
 *
 * If exampleName is '*' then one big file with all examples is generated.
 *
 */
const parse = (exampleName, examplesPath, callback, onlyBody=false, conf=null) => {
    const exampleDir = path.resolve(__dirname, examplesPath, exampleName);
  
    const globalExampleTemplateFile = fs.readFileSync(path.resolve(__dirname, examplesPath, 'index.html'));
    const singleExampleTemplateFile = fs.readFileSync(path.resolve(__dirname, examplesPath, 'example.html'));

    const globalExampleTemplate = dot.template(globalExampleTemplateFile);
    const singleExampleTemplate = dot.template(singleExampleTemplateFile);

  
    // Make one big html out of all examples
    if(exampleName == '*') {
    
        const examples = fs.readdirSync(path.resolve(__dirname, examplesPath)).filter((folder) => {
            return fs.lstatSync(path.resolve(__dirname, examplesPath, folder)).isDirectory();
        });
    
        let joinArray = [];
    
        const examplesJoined = () => {
            callback(globalExampleTemplate({
                examples: joinArray,
                config: conf
            }));
        };

        const exampleJoinCallback = (i) => {
          if(i >= examples.length) {
              examplesJoined();
              return;
          }
          parse(examples[i], examplesPath, (result) => {
              joinArray.push(result);
              exampleJoinCallback(i+1);
          }, true, conf);
        };
    
        exampleJoinCallback(0);
    
    } else {
 
        fs.readFile(path.resolve(exampleDir, 'demo.css'), (err, data) => {
          if (err) throw err;
          const cssContents = data.toString();
          
          fs.readFile(path.resolve(exampleDir, 'demo.js'), (err, data) => {
              if (err) throw err;
              const jsContents = data.toString();
            
              fs.readFile(path.resolve(exampleDir, 'demo.html'), (err, data) => {
                  if (err) throw err;
                  const htmlContents = data.toString();
                  callback(singleExampleTemplate({
                      cssContents,
                      jsContents,
                      title: htmlContents.replace(/Demo/ig, ''),
                      config: conf
                  }));
              });
          });
      });
    }
};

module.exports = parse;