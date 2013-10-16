usosTip widget
==============

Display an "info" icon. When hovered or focused, a tooltip will be displayed. (Currently, there is no way to customize the icon image.)

Screenshot
----------

![Screenshot](http://i.imgur.com/g68wXm2.png)

Demos
-----

  * [usosTip widget Demo](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/widget.tip)

How to call it
--------------

It can be called as a regular widget:

  * `$("#element").usosTip(options)` - *see the options below!*

Or, using one of the forms of the **static constructor**:

  * `$.usosWidgets.usosTip.create(options)` - *see the options below!*
  * `$.usosWidgets.usosTip.create(string)` - *HTML!*
  * `$.usosWidgets.usosTip.create(langdict)` - *HTML!*
  * `$.usosWidgets.usosTip.create("Po polsku", "In English")` - *HTML!*
  * `$.usosWidgets.usosTip.create(jQuery_object)`
  * `$.usosWidgets.usosTip.create(function)` - *see the options below!*
  
Examples
--------

### Simple (static content)

```javascript
$('body').append($.usosWidgets.usosTip.create(
    "Przykładowa treść", "Example content"
));
```

### Content loaded on hover

```javascript
$('body').append($.usosWidgets.usosTip.create({
	content: function() {
		return $.usosCore.usosapiFetch({
			method: 'services/some_service',
			params: {
				item_id: $(this).closest('tr').attr('item_id')
			}
		}).then(function(response) {
			return $("<p>")
				.css('text-color', 'red')
				.text(response.description);
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
