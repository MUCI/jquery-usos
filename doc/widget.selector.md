UsosSelector Widget
===================

This widget lets the users search and select one or more USOS entities. You
will get a set of unique entity IDs.

![Example selector widget](http://i.imgur.com/k3wlwEA.png)

Demos
-----

  * [UsosSelector Widget Demo](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/widget.selector)

Example
-------

```javascript
$.usosCore.init({
	usosAPIs: {
		'default': {
			'methodUrl': "http://apps.usos.edu.pl/%s"
		}
	}
});

$('#course').usosSelector({
	entity: "entity/courses/course",
	multi: true,
	change: function () {
		console.log($(this).usosSelector('value').length + " item(s) selected");
	}
});
```
  
Options
-------

  * **entity** - **Required.** Which entity you want to search for? Currently
    supported values are:
    * `entity/users/user`
    * `entity/courses/course`
    * `entity/fac/faculty`
    * `entity/slips/template`
  * **multi** - *Optional.* Default is `false`. Set to `true` if you want the
    user to select multiple elements (instead of just one).
  * **value** - *Optional.* Initial value. The default is `null` (for non-multi
    widgets) or an empty list (for multi widgets).
  * **width** - *Optional.* Default is `300px`.
  * **change** - *Optional.* A function to be called upon `usosselector:change`
    event.
  * **sourceId** - *Optional.* Use it if you want to use non-default USOS API
    installation (see [$.usosCore.init](core.init.md)).

Methods
-------

  * `option()`, `option(optionName)`, `option(optionName, value)`, `option(options)` -
    see [here](http://api.jqueryui.com/jQuery.widget/#method-option).
  * `destroy()` - see [here](http://api.jqueryui.com/jQuery.widget/#method-destroy)
  * `value()` - get the current value of the selector:
    * For non-multi widgets this will be either *null* or *a string*.
	* For multi widgets this will be *a list*.
  * `value(newValue)` - set the current value of the selector. This will often
    start an AJAX request in the background, to determine display name(s) from
	the given ID(s).

Events
------

  * `usosselector:change` - fired whenever the value of the selector is changed.
