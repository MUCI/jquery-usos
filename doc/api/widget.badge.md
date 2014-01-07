usosBadge widget
================

Displays entity information on hover (users, faculties, etc.)

Screenshot
----------

![Example usosBadge widget](http://i.imgur.com/6NYuKkR.png)

Demos
-----

  * [usosBadge widget Demo](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/widget.badge)

Example
-------

```javascript
$.usosCore.init({
	usosAPIs: {
		'default': {
			'methodUrl': "http://example.com/yourProxy.php?_method_=%s"
		}
	}
});

$('#someItem').usosBadge({
	entity: "entity/fac/faculty",
    fac_id: "10000000"
});
```
  
Options
-------

  * **entity** - **Required.** Entity type. Currently supported values are:
    * User - `entity/users/user`.
    * Faculty - `entity/fac/faculty`.
  * ID of the entity. Parameter name varies on entity type:
    **`user_id`** for user badges, and **`fac_id`** for faculty badges.
  * **position** - *Optional.* Preferred position of the tooltip: `left`,
    `right`, `top` or `bottom`. Default is undefined and it can be different
    for each entity type. Please note, that some badges do not support all 
    possible position values (for example, they must be "top" and ignore any
    other values).

Methods
-------

  * None

Events
------

  * None
