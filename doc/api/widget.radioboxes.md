usosRadioboxes widget
====================

This widget simply displays a set od radio-type inputs.


Demos
-----

  * WRTODO

Example
-------

```javascript
$("#container").append($("<div>").usosRadioboxes({
    value: "en",
    options: [
        {value: "pl", caption: {pl: "polski", en: "Polish"}},
        {value: "en", caption: {pl: "angielski", en: "English"}} 
    ]
}));
```

Options
-------

  * All inherited options of the [usosValue widget](widget.value.md), in particular:
    * **value** *(default: '')* - The initial value to be selected. Should
      match one of the values passed in the **options** option.
  * **options** - a list of objects. Each object represents one item to be
    displayed in the selectbox. Each object should contain these two fields:
    * **value** - any kind of value (this doesn't have to be a string!).
    * **caption** - either string or a LangDict object.
  * **width** - the width for the widget.
  * **change** - function, a callback to be executed when the value is changed.

Methods
-------

  * All inherited options of the [usosValue widget](widget.value.md), in particular:
    * `value()` - Return the value of the currently selected item (one of the
      values supplied in the **options** option).
    * `value(newValue)` - Set the new value.

Events
------

  * `usosradioboxes:change` - triggered when the value is changed.
