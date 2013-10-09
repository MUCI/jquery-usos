$.usosCore.panic([response])
============================

Display a "panic screen". This should be called when unrecoverable errors
are encountered. **Depending on the content of the response**, the user
will be advised to do different things (e.g. to refresh the page, contact
the administrators etc.).

The **response** parameter should be one of the following:

  * **undefined** - if the error was not caused by any AJAX response.
  * **USOS API response object** - the one returned by the 
    [$.usosCore.usosapiFetch](core.usosapiFetch.md) method.
  * **xhr** - in case you use `$.ajax` instead of *usosapiFetch*.

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
        $.usosCore.panic(response);
    }
});
```
