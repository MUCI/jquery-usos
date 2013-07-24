$.usosEntity.url(entityCode, ...)
=========================================

Returns an URL pointing to a "home page" for the given entity. The URL is
generated based on the **entityURLs** set during the
[$.usosCore.init](core.init.md) call.

Demos
-----

  * [$.usosEntity.url Demo](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/entity.url)

How to call it
--------------

  * `$.usosEntity.url('entity/users/user', user_id)`
  * `$.usosEntity.url('entity/fac/faculty', fac_id)`
  * `$.usosEntity.url('entity/slips/template', slip_id)`
  * etc.

It should work with all entities described in the
[$.usosEntity.label](entity.label.md) function.
