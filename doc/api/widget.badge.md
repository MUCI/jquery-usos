usosBadge widget
================

Displays entity information on hover (users, faculties, etc.)

Screenshot
----------

![Example usosBadge widget](http://i.imgur.com/htjpXDE.png)

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
    * `entity/users/user` - for user badges.
    * `entity/fac/faculty` - for faculty badges.
    * `entity/geo/building` - for building badges.
  * ID of the entity. Parameter name varies on entity type:
    * **user_id** - for user badges,
    * **fac_id** - for faculty badges.
    * **building_id** - for building badges.
  * **position** - *Optional.* Preferred position of the tooltip. Allowed
    values include: `left`, `right`, `top` and `bottom`.
    Default is undefined and it can be different
    for each entity type. Please note, that some badges may not support all
    possible position values (for example, they must be "top" and ignore any
    other values).

Methods
-------

  * None

Events
------

  * None
