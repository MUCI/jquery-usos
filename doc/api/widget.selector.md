usosSelector widget
===================

This widget lets the users search and select one or more USOS entities. You
will get a set of unique entity IDs.

Screenshot
----------

![Example usosSelector widget](http://i.imgur.com/k3wlwEA.png)

Demos
-----

  * [usosSelector widget Demo](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/widget.selector)

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
    * Users - `entity/users/user`
    * Courses - `entity/courses/course`
    * Faculties - `entity/fac/faculty`
    * Slip templates - `entity/slips/template`
  * **multi** *(default: `false`)* - Set to `true` if you want the user to
    select multiple elements (instead of just one).
  * **searchParams** *(default: `{}`)* - Extra parameters to be passed to the
    USOS API method while searching. Consult proper USOS API method documentation
    for the list of allowed parameters:
    * Users - `services/users/search`
    * Courses - `services/courses/search`
    * Faculties - `services/fac/search`
    * Slip templates - `services/slips/search_templates`
  * **value** - Initial value for the selector. The default is `null` (for non-multi
    widgets) or an empty list (for multi widgets).
  * **width** *(default: `300px`)* - The width of the widget.
  * **change** - A function to be called upon `usosselector:change` event.
  * **source_id** - If you want to use non-default USOS API installation
  (see [$.usosCore.init](core.init.md)).

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
