$.usosCore.init(options)
========================

Before you start working with jQuery-USOS, you must initialize it by
calling this method.

Demos
-----

Since `$.usosCore.init` has to be called every time, it is used in every Demo
page in the docs. You can see it for example here:

  * [$.usosCore.usosapiFetch Demo](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/core.usosapiFetch)
  * [$.usosSelector Demo](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/selector)

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

#### A note on USOS API proxy setup

Currently, jQuery-USOS sends all requests using POST and without OAuth. You will
need to set up your own USOS API proxy if you need to access non-anonymous methods.

  * The proxy should sign all the incoming USOS API requests with your USOS API
    Consumer Key and (optionally) your user's Access Token.
  * If you have an Administrative Consumer Key, then you can usually use
    `as_user_id` parameter with ID extracted from your `$_SESSION`.
  * Your proxy should be guarded against CSRF attacks (especially if you're an
    administrative consumer!).
  * If needed, we may provide a code sample.

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

  
