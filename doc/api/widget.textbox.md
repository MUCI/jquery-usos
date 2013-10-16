usosTextbox widget
==================

This widget simply displays a textbox - `<input type='text'>` or `<textarea>`
(depending on the **multiline** option).

Example
-------


```javascript
$("#container").append($("<div>").usosTextbox({
    value: '',
    placeholder: {pl: "Dodatkowy opis", en: "Additional description"},
    multiline: true
}));
```

Options
-------

  * All inherited options of the [usosValue widget](widget.value.md), in particular:
    * **value** *(default: null)* - The initial value to be selected. Should
      match one of the values passed in the **options** option.
  * **placeholder** *(default: null)* - a placeholder text to be displayed when
    the content is empty.
  * **multiline** *(default: false)* - Boolean. If **true** then `<textarea>`
    will be used instead of `<input type='text'>`.
  * **change** - function, a callback to be executed when the value is changed.

Methods
-------

  * All inherited options of the [usosValue widget](widget.value.md), in particular:
    * `value()` - Return the value of the currently selected item (one of the
      values supplied in the **options** option).
    * `value(newValue)` - Set the new value.

Events
------

  * `usosselectbox:change` - triggered when the value is changed.
