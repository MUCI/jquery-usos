/*
 * This module provides a function to join examples into single fancy html output.
 * The examples must have the following structure:
 *   example_name
 *    |- demo.html
 *    |- demo.js
 *    \- demo.css
 */
'use strict';

const path = require('path');
const fs =   require('fs');
const dot =  require('dot');

const processSingleExample = function(exampleName, examplesPath, examplesOut, conf) {
    const exampleDir = path.resolve(__dirname, examplesPath, exampleName);
    const singleExampleTemplateFile = fs.readFileSync(path.resolve(__dirname, examplesPath, 'example.html'));
    const singleExampleTemplate = dot.template(singleExampleTemplateFile);

    const getContents = function (filename) {
        return fs.readFileSync(path.resolve(exampleDir, filename)).toString();
    };

    const generatedContents = singleExampleTemplate({
        cssContents: getContents('demo.css'),
        jsContents: getContents('demo.js'),
        title: getContents('demo.html').replace(/Demo/ig, ''),
        config: conf
    });

    fs.writeFileSync(path.resolve(__dirname, examplesOut, exampleName+'.html'), generatedContents);

    return exampleName;
};

const processAllExamples = function (examplesPath, examplesOut, conf) {
    const globalExampleTemplateFile = fs.readFileSync(path.resolve(__dirname, examplesPath, 'index.html'));
    const globalExampleTemplate = dot.template(globalExampleTemplateFile);
    const exampleNames = [];

    const examples = fs.readdirSync(path.resolve(__dirname, examplesPath)).filter(function (folder) {
        return fs.lstatSync(path.resolve(__dirname, examplesPath, folder)).isDirectory();
    });

    for (let i = 0; i < examples.length; i++) {
        exampleNames.push(processSingleExample(examples[i], examplesPath, examplesOut, conf));
    }

    const generatedContents = globalExampleTemplate({
        examples: exampleNames,
        config: conf
    });

    fs.writeFileSync(path.resolve(__dirname, examplesOut, 'index.html'), generatedContents);
};

module.exports = function (exampleName, examplesPath, examplesOut, conf) {
    if (exampleName === 'index.html') {
        processAllExamples(examplesPath, examplesOut, conf);
    } else {
        processSingleExample(exampleName, examplesPath, examplesOut, conf)
    }
};
