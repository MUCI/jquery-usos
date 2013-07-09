$.usosTip.create(options)
=========================

Creates a jQuery object with "info" icon. When hovered or focused, it will
display a tooltip with the given content.

Currently, there is no way to customize the icon image.

Demos
-----

  * [$.usosTip.create Demo](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/tip.create)

How to call it
--------------
  
  * `$.usosTip.create(langdict)` (HTML!)
  * `$.usosTip.create("Po polsku", "In English")` (HTML!)
  * `$.usosTip.create(jQuery_object)`
  * `$.usosTip.create(string)` (HTML!)
  * `$.usosTip.create(options)` - See the options below.
  
Examples
--------

=== Simple (static content)

```javascript
$('body').append($.usosTip.create("Przyk³adowa treœæ", "Example content"));
```

=== Content loaded on hover

```javascript
$('body').append($.usosTip.create({
	content: function() {
		return $.usosCore.usosapiFetch({
			method: 'services/some_service',
			params: {
				// Find closest <tr> within which the tip was placed
				some_id: $(this).closest('tr').data('row_id')
			}
		}).then(function(response) {
			return $("<p>")
				.css('text-color', 'red')
				.text(response.some_field);
		});
	},
	position: 'left'
}));
```
 
Options
-------

### content

**Required.** This can be one of:

  * *LangDict object*,
  * *jQuery object*,
  * a string,
  * *a function* - if you want to create/load the content dynamically. The
    function must return a jQuery Promise object which must resolve into
    *LangDict object*, *jQuery object* or *a string*. The function will be
    called once, just before the tooltip is first displayed, in the context
    (`this`) of the jQuery-wrapped tooltip root element.

**Important:** All content must be provided in **HTML format** (not plaintext).
Majority of tips are written by developers, but if you intend to display
user-supplied content you must sanitize it (e.g. with
[$.usosUtils.makeParagraphs](WRTODO) or with jQuery's
[.text](http://api.jquery.com/text/#text-textString))
	
### position

*Optional.* Either `left`, `right`, `top` or `bottom`. Default: `top`.
