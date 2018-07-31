Installation instructions
=========================

Pretty standard. You just have to include all JS and CSS files in your page.

Requirements
------------

  * USOS API (which version? see in
    [the changelog](https://github.com/MUCI/jquery-usos/blob/master/doc/changelog.md)),
  * Your own USOS API Proxy (see below),
  * jQuery 1.9.1+,
  * jQuery Migrate 1.1.0+,
  * jQuery-UI 1.10.1+ (we advise to use the theme included in jQuery-USOS
    project),
  * **jQuery-USOS Bundle package** - the `js/jquery-usos-x.y.z-bundle.min.js`
    contains both jQuery-USOS and all its dependencies (except the ones listed
    above).

### Debug version

If you intend to develop (or debug) jQuery-USOS, then probably you'll need to
include all the files separately (instead of the bundled and minified package).
Please note, that **some of the third-party plugins were modified** to work
properly with jQuery-USOS! You should use the versions included in this
repository.


Setup your own USOS API Proxy
-----------------------------

You will probably also need to set up your own USOS API proxy (and point to it
when calling [$.usosCore.init](https://github.com/MUCI/jquery-usos/blob/master/doc/api/core.init.md#usosapis)).

### Why?

USOS API is using OAuth 1.0, which does not provide a JavaScript flow.
That means that jQuery-USOS cannot handle OAuth on itself. You will
need to set up USOS API proxy if you need to access **non-anonymous** methods
(and you most probably **will** need to).

### Some guidelines

  * The proxy should sign all incoming USOS API requests with your USOS API
    Consumer Key and your user's Access Token.
  * If you have an Administrative Consumer Key, then you **should** pass the
    requests via USOS API's
    [services/oauth/proxy method](https://usosapps.uw.edu.pl/developers/api/services/oauth/#proxy).
  * Your proxy should be guarded against CSRF attacks.
