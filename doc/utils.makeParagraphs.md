$.usosUtils.makeParagraphs
==========================

Take user-supplied *plaintext* input and return a collection of `<p>` elements
with formatted and sanitized paragraphs.

For best results, try wrapping the result in `<div class='ua-paragraphs'>`.

Demos
-----

  * [$.usosUtils.makeParagraphs Demo](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/utils.makeParagraphs)

Examples
--------

```javascript
$('div')
    .addClass('ua-paragraphs')
    .html($.usosUtils.makeParagraphs("Paragraph1\n\nParagraph2"));
```
