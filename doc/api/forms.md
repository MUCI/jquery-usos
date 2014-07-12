.usosForms("functionName", [...])
=================================

Utility functions for working with [usosValue](widget.value.md) AJAX forms.

  * [showErrors(response)](#showerrorsresponse) - display USOS API form errors.
  * [hideErrors()](#hideerrors) - hide previously shown errors.
  * [findValueWidgets()](#findvaluewidgets) - find topmost *usosValue* widgets.
  * [values(...)](#values) - cumulative get/set many *usosValues*.
  * [flatValues()](#flatValues) - get flat values (for USOS API input).


Demos
-----

  * [usosForms Demo](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/forms)

Use case example
----------------

```javascript

/* Find the set of all user inputs in our form. */

var myWidgets = $("#myForm").usosForms("findValueWidgets");

/* Define progress helpers. */

function showProgress() {
    /* Disable all the inputs and buttons so that they won't
     * get changed or clicked while loading or saving. */
    $("#save").button("disable");
    myWidgets.usosValue("disable");
    $("#myForm").usosProgressOverlay();
}

function hideProgress() {
    $("#myForm").usosProgressOverlay('destroy');
    myWidgets.usosValue("enable");
    $("#save").button("enable");
}

/* Load the current values and display them in the form. */

showProgress();
$.usosCore.usosapiFetch({
    method: "services/load_object",
    params: {id: "some_id"}
})
.always(hideProgress)
.done(function(data) {
    myWidgets.usosForms("values", data);
})
.fail($.usosCore.panic);

/* Handle the save button. */

$("#save").click(function() {
    showProgress();
    $.usosCore.usosapiFetch({
        method: "services/save_form",
        params: $.expand({
            id: "some_id"
            /* Expand with form values. */
        }, myWidgets.usosForms("flatValues"))
    })
    .always(hideProgress)
    .done(function() { alert("Saved!"); })
    .fail(function(response) {
        myWidgets.usosForms('showErrors', response);
    });
});
```


showErrors(response)
----------------------------------------------------------------------------

### Parameters

  * Context: jQuery set of [usosValue widgets](widget.value.md).
  * **response** - USOS API
    [error response](https://usosapps.uw.edu.pl/developers/api/definitions/errors/).
    It works best if it contains `user_messages` field, but it doesn't have to.

### Result

  * Attempt to extract `user_messages` from the given USOS API error response.
    If failed, call `$.usosCore.panic(response)`.
  * Show the extracted error messages on the given form. The names of the
    *usosValue* widgets should match the keys in the `response.user_messages.fields` dictionary.
  * If some of the erroneous fields could not be found, call
    `$.usosCore.panic(response)`.

**Important:** The [panic](core.panic.md) method will **also** display the
`user_errors`, but in a less intuitive way.

### Example 1

For this USOS API response:

<pre>{
    "param_name": "fac_id",
    "message": "Required parameter fac_id is missing.",
    "user_messages": {
        "fields": {
            "fac_id": {
                "en": "This field is required.",
                "pl": "To pole jest wymagane."
            }
        }
    },
    "error": "param_missing"
}</pre>

If *usosValue* named `fac_id` is found in the given form, then this is displayed:

![showErrors screenshot](http://i.imgur.com/2cgrT41.png)

### Example 2

For this USOS API response:

<pre>{
    "param_name": "slip_id",
    "message": "Parameter slip_id has invalid value. This user is not allowed to delete this slip.",
    "user_messages": {
        "fields": {
            "slip_id": {
                "en": "Currently only slip issuers are allowed to delete existing slips.",
                "pl": "Aktualnie, tylko wydający są upoważnieni do usuwania obiegówek."
            }
        }
    },
    "error": "param_invalid"
}</pre>

If *usosValue* named `slip_id` if **not** found in the given form, then this is
displayed:

![showErrors screenshot](http://i.imgur.com/u9FyM5Z.png)


hideErrors()
-----------------------------------------------------------------------------

### Parameters

  * Context: jQuery set of [usosValue widgets](widget.value.md).

### Result

Hide the errors previously shown with `showErrors`. Usually you won't need to
call it manually.


findValueWidgets()
------------------------------------------------------------------------------

### Parameters

  * Context: Any jQuery set. Usually a **root of a form**.

### Result

jQuery set of [usosValue widgets](widget.value.md).

This method will search the given jQuery set and find **topmost**
[usosValue widgets](widget.value.md) contained within.

A **topmost widget** is a widget that is **not contained** within any other
*usosValue* widget *in the returned set*. This distinction might be important as
some *usosValue* widgets may contain other *usosValue* widgets within themselves.


values(...)
-----------------------------------------------------------------------------

### Parameters

  * Context: jQuery set of [usosValue widgets](widget.value.md).
  * Optional dictionary of values to set.

### Result

  * If called **without arguments**, then return a dictionary of all name-value
    pair found in the given *usosValue* widgets.
  * If called **with an object argument**, then change the value of all
    *usosValue* widgets which names match the keys in the given object.

### Example

```javascript
var myWidgets = $("#myForm").usosForms("findValueWidgets");
// getter
console.log(myWidgets.usosForms("values"));
// setter
var valuesToChange = {
    'myTextbox': 'New value.',
    'myCheckbox': true
};
myWidgets.usosForms("values", valuesToChange);
```


flatValues()
-----------------------------------------------------------------------------

### Parameters

  * Context: jQuery set of [usosValue widgets](widget.value.md).

### Result

This is similar to `values`, but:

  * It works only as a getter.
  * All values are mapped to *flat representations*, acceptable as USOS API
    input arguments. For example, this will return `"a|b|c"` rather than
    `["a", "b", "c"]`.
