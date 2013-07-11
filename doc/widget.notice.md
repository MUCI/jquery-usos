UsosNotice Widget
===================

This widget lets you display an error message regarding a selected element
(usually a form input). The message disappears when the input if focused or
changed.

![Example notice widget](http://i.imgur.com/s0qLWiA.png)

Demos
-----

  * [UsosNotice Widget Demo](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/widget.notice)

Example
-------

```javascript
$('#some_input').usosNotice({
	content: {
		pl: "To pole jest wymagane!",
		en: "This field is required!"
	}
});
```
  
Options
-------

  * **content** - The content to be displayed. Allowed formats:
    * `string` (HTML!),
	* `LangDict` (HTML!),
	* jQuery object.
  * **scroll** *(default: `true`)* - If set to `true`, and the notice is outside
    of the user's view, then the page will scroll to show the content of the
	notice.

Methods
-------

  * `option()`, `option(optionName)`, `option(optionName, value)`, `option(options)` -
    see [here](http://api.jqueryui.com/jQuery.widget/#method-option).
  * `destroy()` - see [here](http://api.jqueryui.com/jQuery.widget/#method-destroy)
  * `hide()` - hide the notice. Once the notice is fully hidden, it is
    automatically destroyed.
