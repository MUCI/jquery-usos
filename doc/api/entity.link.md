$.usosEntity.link(entityCode, entityObject)
===========================================

Creates an `<a href='...'>` link with the name of the given entity. This is
very similar to [$.usosEntity.label](entity.label.md), but it returns a
proper `<a>` element instead of a simple `<span>`.

The URL is generated based on the **entityURLs** set during the
[$.usosCore.init](core.init.md) call.

Demos
-----

  * [$.usosEntity.link Demo](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/entity.link)

Example
-------

```javascript
/* user - the user object fetched from USOS API */
$('#result').append($.usosEntity.link('entity/users/user', user));
```

Parameters & entity codes
-------------------------

Please see the [$.usosEntity.label](entity.label.md) function.
