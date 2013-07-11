jQuery-USOS plugin
==================

This is a set of jQuery plugins intended to help developers with their work
with USOS API. Most of it is designed specificly to work with USOS-related
projects. It you don't know what USOS is, you are probably in a wrong place!

**This is an unreleased Alpha version!** It is used inside USOSweb, but is
still in active pre-release development phase. API **will** change in
a backward-incompatible way.


Demos
-----

  * Widgets:
    * [Selector](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/selector)
    * [Multiselector](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/selector.multi)
    * [Context message](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/contextMessage)
  * Core:
    * [USOS API Fetch](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/core.usosapiFetch)


Installation
------------

  * Dependencies:
    * jQuery 1.9.1,
    * jQuery-UI 1.10.1 (theme included),
    * Plugins (included in the `jquery-usos-x.y.z-bundle.min.js`):
      * [BBQ](http://benalman.com/code/projects/jquery-bbq/docs/files/jquery-ba-bbq-js.html) 1.2.1,
      * [TextExt](http://textextjs.com/) - *modified* 1.3.1 version (our version differs from the official one!),
      * [colResizable](http://quocity.com/colresizable/) 1.3.
  * Include all CSS and JS files in your HTML.
    * You may use `js/jquery-usos-x.y.z-bundle.min.js` if you want to
      fetch jQuery-USOS *and* all the required plugins in one file (this does *not*
      include jQuery nor jQuery-UI).
    * For development, you can use `js/devel/*.js` files (and unminified plugin
      versions).

Later, you will probably also need to [set up your own USOS API proxy](https://github.com/MUCI/jquery-usos/blob/master/doc/core.init.md#usosapis).

API
---
  
### $.usosCore

  * [$.usosCore.init](https://github.com/MUCI/jquery-usos/blob/master/doc/core.init.md) -
    you need to call this before using any other functions.
  * [$.usosCore.usosapiFetch](https://github.com/MUCI/jquery-usos/blob/master/doc/core.usosapiFetch.md) -
    fetch/post data from/to USOS API.
  * [$.usosCore.lang](https://github.com/MUCI/jquery-usos/blob/master/doc/core.lang.md) -
    primary language-helper.
  * [$.usosCore.panic](https://github.com/MUCI/jquery-usos/blob/master/doc/core.panic.md) -
    display a "panic" screen.

### $.usosTip

  * [$.usosTip.create](https://github.com/MUCI/jquery-usos/blob/master/doc/tip.create.md) -
    display an "info" icon with a given tooltip on hover.

### Widgets

  * [usosSelector Widget](https://github.com/MUCI/jquery-usos/blob/master/doc/widget.selector.md)

<!--

ApiTable
--------

This widget can display dynamic, sortable, paginated tables based on USOS API
data. In order for all of its functionality to work properly, the underlaying
USOS API method must implement a specific set of parameters (not yet
documented).

**This module is currently undocumented. You should not use it.**

![Example apitable screenshot](http://i.imgur.com/hngxh9J.png)
-->