jQuery-USOS plugin
==================

This is a set of [jQuery](http://jquery.com/) plugins intended to help developers
with their work with [USOS API](http://apps.usos.edu.pl/developers/api/). If you
don't know what USOS is, then you are probably in a wrong place!

**ALPHA VERSION: the API will change in a backward-incompatible way!**

Demos
-----

  * [usosSelector Widget Demo](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/selector)
  * [$.usosCore.usosapiFetch Demo](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/core.usosapiFetch)
  * You will find *much* more demos in the API section.

Installation
------------

  * [Installation instructions](https://github.com/MUCI/jquery-usos/blob/master/doc/installation.md)

	
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
  * [usosNotice Widget](https://github.com/MUCI/jquery-usos/blob/master/doc/widget.notice.md)

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