$.usosEntity.label(entityCode, entityObject)
============================================

Creates a label for given `entityObject`. It also creates the
[usosBadge widget](widget.badge.md) on that label, if available.


Demos
-----

  * [$.usosEntity.label Demo](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/entity.label)

Example
-------

```javascript
/* user - the user object fetched from USOS API */
$('#result').append($.usosEntity.label('entity/users/user', user));
```

Parameters
----------

  * `entityCode` - one of the entity codes described below,
  * `entityObject` - an object with entity description. For the list of required
    fields, see below.

Entity codes and entity objects
-------------------------------

Each `entityCode` requires and object with a set of fields, in the format
returned by USOS API.

  * `entity/users/user` requires: `id|first_name|last_name`.
  * `entity/fac/faculty` requires: `id|name`.
  * `entity/slips/template` requires: `id|name`.
  * `entity/progs/programme` requires: `id|description`.
  * `entity/courses/course` requires: `id|name`.
  * `entity/geo/building` requires: `id|name`.

If the object is not provided (either `null` or `undefined` is found), a simple
"no data" placeholder will be displayed.
