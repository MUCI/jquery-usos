Installation instructions
=========================

Pretty standard. You just have to include all JS and CSS files in your page.

Requirements
------------

  * USOS API 5.4.4+,
  * Your own USOS API Proxy (see below),
  * jQuery 1.9.1+,
  * jQuery Migrate 1.1.0+,
  * jQuery-UI 1.10.1+ (we advise to use the theme included in jQuery-USOS
    project),
  * **jQuery-USOS Bundle package** - the `js/jquery-usos-x.y.z-bundle.min.js`
    contains both jQuery-USOS and all its dependencies (except the ones listed
    above).

### Debug version

If you intend to debug jQuery-USOS, then probably you'll need to include all the
fields separately (instead of the bundled and minified package). Please note,
that **some of the third-party plugins were modified** to work properly with
jQuery-USOS! You should use the versions included in this repository.


Setup your own USOS API Proxy
-----------------------------

You will probably also need to set up your own USOS API proxy (and point to it
when calling [$.usosCore.init](https://github.com/MUCI/jquery-usos/blob/master/doc/core.init.md#usosapis)).

### Why?

USOS API is using OAuth 1.0, which does not provide a JavaScript flow.
That means that jQuery-USOS cannot handle OAuth on itself. You will
need to set up USOS API proxy if you need to access **non-anonymous** methods.

### Some guidelines

  * The proxy should sign all incoming USOS API requests with your USOS API
    Consumer Key and your user's Access Token.
  * If you have an Administrative Consumer Key, then you **should** pass the
    requests via USOS API's
    [services/oauth/proxy method](https://usosapps.uw.edu.pl/developers/api/services/oauth/#proxy).
  * Your proxy should be guarded against CSRF attacks.

### Demo proxy

All of our "live demos" use a simple, anonymous proxy connected to one of the
USOS API installations.

  * **The source code is included in our repository.**
    * It can be used as a quick-starter.
    * It's just a simple anonymous proxy implementation. There are many
      advantages of writing your own proxy which signs the requests with
      users' Access Tokens.
  * **Live demo** of this proxy is set up
    [here](https://public.usos.edu.pl/jquery-usos/proxy/usosapiProxy.php).
    * Sample request: [method_index](https://public.usos.edu.pl/jquery-usos/proxy/usosapiProxy.php?_method_=services/apiref/method_index).
    * Currently, it is connected to the official USOS API server of the
      University of Warsaw. This may change in the future.
    * *This URL is intended to be used only with our demo pages*, please set up
      your own proxy for your project. All responses include the
      `Access-Control-Allow-Origin` header which will restrict access from
      other domains.
