$.usosCore.init(options)
========================

Before you start working with jQuery-USOS, you must initialize it by
calling this method. Possible parameters are:

Options
-------

### langpref

Optional. Language of the interface - "pl" or "en" (default: "en").

### usosAPIs

Optional. Object (*handle => description*) describing USOS API servers which
you'll use within your app. Usually you will need to define only the "default"
handle. Each "description" is an object of the following structure:

    * **methodUrl** - Required. Where to send the USOS API request? "%s" will be
      replaced with the method name.

    * **extraParams** - Optional. Extra parameters to be appended to all issued
      requests. This is useful for passing CSRF tokens when you're using a proxy.
    
Currently, all requests are sent using POST and without OAuth. You will
probably need to set up your own USOS API proxy. The proxy should sign all the
incoming USOS API requests with your USOS API Consumer Key and (optionally)
your user's Access Token. Make sure your proxy is guarded against CSRF attacks.

### entityURLs

Optional. Object (*entity code => string*) used for overriding entity URLs
produced by jQuery-USOS.

By default, jQuery-USOS will fetch default entity profile URLs from USOS API.
These URLs are sometimes not what you want, because the user will leave your
site upon clicking them. You can override these URLs with the ones of used
within your application.

Currently recognised entity codes:

    * **entity/users/user**(user_id)
    * **entity/fac/faculty**(fac_id)
    * **entity/slips/template**(tpl_id)

Possible values:

    * An URL with placeholders. Entity IDs will be inserted in place of the
      matching placeholders. E.g. "http://example.com/user.php?user_id=${user_id}"
    * A function which takes the IDs and returns the URL to be used.
    * null - indicates that entity links should not be shown at all.

Examples
--------

Simple connection to a public USOS API server (with no OAuth, you will be
allowed to call anonymous methods only):

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

Connection via a custom proxy:

```javascript
$.usosCore.init({
    langpref: 'pl',
    usosAPIs: {
        'default': {
            methodUrl: "http://example.com/usosapiProxy.php?method=%s"
            extraParams: {
                csrftoken: "some token"
            }
        }
    },
    entityURLs: {
        'entity/users/user': "http://example.com/user.php?user_id=${user_id}",
        'entity/fac/faculty': function(fac_id) {
            return "http://example.com/faculty.php?fac_id=" + fac_id;
        },
        'entity/slips/template': function(tpl_id) {
            return function() { alert("Custom click action"); };
        }
    }
});
```
