$.usosCore.init(options)
========================

Before you start working with jQuery-USOS, you must initialize it by
calling this method.

Demos
-----

The `$.usosCore.init` is called in **all** (!) demo pages in the docs. It affects
all other functions and widgets. You can try it, for example
[here](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/core.usosapiFetch)
or [here](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/selector)...

Examples
--------

### Example 1

Simple connection (no OAuth, anonymous methods only):

```javascript
$.usosCore.init({
    langpref: 'pl',
    usosAPIs: {
        'default': {
            methodUrl: "http://apps.usos.edu.pl/%s"
        }
    }
});
```

### Example 2

Connection via a custom proxy:

```javascript
$.usosCore.init({
    langpref: 'pl',
    usosAPIs: {
        'default': {
            methodUrl: "http://example.com/usosapiProxy.php?method=%s"
            extraParams: {
                csrftoken: "someToken"
            }
        }
    },
    entityURLs: {
        'entity/users/user': "http://example.com/user.php?user_id=${user_id}",
        'entity/fac/faculty': function(fac_id) {
            return "http://example.com/faculty.php?fac_id=" + fac_id;
        },
        'entity/slips/template': null
    }
});
```
  
Options
-------

### langpref

*Optional.* Language of the interface - `pl` or `en` (default: `en`).

### usosAPIs

*Optional.* Object *(handle => description)* describing USOS API servers which
you'll use within your app. Usually you will need to define only the `default`
handle. Each *description* is an object of the following structure:

  * **methodUrl** - Required. Where to send the USOS API request? `%s` will be
    replaced with the method name.

  * **extraParams** - Optional. Extra parameters to be appended to all issued
    requests. This is useful for passing CSRF tokens when you're using a proxy.

### entityURLs

*Optional.* Object *(entity code => string)* used for overriding entity URLs
produced by jQuery-USOS. Here you should define the URLs which describe the
given entities inside your application.

Currently recognised entity codes:

  * `entity/users/user`(user_id)
  * `entity/fac/faculty`(fac_id)
  * `entity/slips/template`(tpl_id)

Possible values:

  * An URL with placeholders. Entity IDs will be inserted in place of the
    matching placeholders. E.g. `http://example.com/user.php?user_id=${user_id}`
  * A function which takes the IDs and returns the URL to be used.
  * **null** - indicates that entity links should not be shown at all.

Note: Currently *null* is the default, but it will not stay this way. In the
future, jQuery-USOS will retrieve default profile URLs from USOS API
dynamically.

  
