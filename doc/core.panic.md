$.usosCore.panic()
=====================

Display a "panic screen". This should be called when unrecoverable errors
are encountered. The user is advised to refresh the screen, contact the
administrators etc.

  * Currently, this function does not take any parameters. **But:**
  * If you use it with AJAX calls, **it is advised to call it directly in the
    `.fail` callback**, so that the panic function gets the HTTP response
    In the future, the content of the panic screen may be affected by this
    response.

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
        $.usosCore.panic.apply(null, arguments);
    }
});
```
