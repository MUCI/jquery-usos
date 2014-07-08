$.usosCore.panic([response])
============================

Display a "panic screen". This should be called when unexpected errors
are encountered, especially after you receive an unexpected HTTP 400 error
from USOS API.

Some basic automatic heuristics will be used to analyze the content of the
HTTP response and jQuery-USOS will decide what message to display to the user.
The user may be advised to refresh the page, etc.

The **response** parameter should be one of the following:

  * **undefined** - if the error was not caused by any AJAX response.
  * **USOS API response object** - the one returned by the 
    [$.usosCore.usosapiFetch](core.usosapiFetch.md) method.
  * **xhr** - in case you use `$.ajax` instead of *usosapiFetch*.

Starting with version 1.3 it returns a `$.Deferred` object which is resolved
once the panic screen is closed (the user ignored the error).
  
Demos
-----

[$.usosCore.panic Demo](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/core.panic)

Examples
--------

### Simple

```javascript
$.usosCore.usosapiFetch(
    /* ... */
).done(function() {
    /* ... */
}).fail($.usosCore.panic);
```

### With some custom handling

```javascript
$.usosCore.usosapiFetch(
    /* ... */
).done(function() {
    /* ... */
}).fail(function(response) {
    if (response.someKey == "someValue") {
        doSomethingDifferent();
    } else {
        $.usosCore.panic(response).done(function() {
            reloadSomeWidgets();
        });
    }
});
```
