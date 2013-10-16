usosValue widget
===================

This is an **abstract widget**. Many other widgets inherit from this one. If is
a base class of all widgets which **hold a value** and an **optional name**.

Options
-------

  * **value** *(default: `null`)* - The initial value varies depending on the
    widget subclass.
  * **name** *(default: `null`)* - Unique name of the widget. See
    [.usosForms](forms.md) for more information.

Methods
-------

  * All methods inherited from the [jQuery-UI widget](http://api.jqueryui.com/jQuery.widget/), in particular:
    * `option(optionName, [value])` -
    see [here](http://api.jqueryui.com/jQuery.widget/#method-option).
    * `destroy()` - see [here](http://api.jqueryui.com/jQuery.widget/#method-destroy).
  * `focus()` - force the widget to take focus.
  * `disable()` - disable the widget.
  * `enable()` - enabled the widget.
  * `value()` - get the current widget value - shorthand for `option('value')`.
  * `value(newValue)` - set the new widget value - shorthand for `option('value', newValue)`.


Finding usosValue widgets
-------------------------

You may find usosValue widgets with jQuery selector. All usosValue widgets have
the **ua-usosvalue** class. If the widget has a **name** then the element will
have the **data-name** attribute matching this name.

E.g. `$(".ua-usosvalue[data-name=fac_id]").usosValue('value', '10000000')`

The [.usosForms plugin](forms.md) provides some useful functions for searching
and modifying multiple usosValue widgets at the same time.

Caveats
-------

Currently, jQuery-UI Widget inheritance model does not allow you to call methods
of a base widget if you **don't know the exact class of the widget**. This is
due to the fact that multiple widgets can be instantiated on one element.
E.g. usually you wouldn't be able to call
`$('#widget').usosValue('focus')`,
you would have to call
`$('#widget').usosTextbox('focus')`
directly.

However, usosValue methods **can** be called this way. This was achieved with
a trick: usosValue is **not really** a jQuery-UI widget.
The "real" usosValue widget (the one that other widgets inherit from) is called
`_usosValue`. Remember this if you want to create your own custom subclass!
