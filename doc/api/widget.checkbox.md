usosCheckbox widget
===================

This widget simply displays a checkbox with a label.

Screenshot
----------

![Example usosCheckbox widget](http://i.imgur.com/BRETgVT.png)


Demos
-----

  * [usosForms Demo](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/forms)


Example
-------

```javascript
$("#container").append($("<div>").usosCheckbox());
```

Options
-------

  * All inherited options of the [usosValue widget](widget.value.md), in particular:
    * **value** *(default: false)* - Boolean. Set to `true` if the checkbox
      should be initially checked. 
  * **change** - function, a callback to be executed if the value is changed.

Methods
-------

  * All inherited options of the [usosValue widget](widget.value.md), in particular:
    * `value()` - Return a boolean. Is the checkbox checked?
    * `value(newValue)` - Call with `true` or `false` to check/uncheck the
      checkbox.

Events
------

  * `usoscheckbox:change` - if the checkbox value is changed.
