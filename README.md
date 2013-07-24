jQuery-USOS plugin
==================

This is a set of [jQuery](http://jquery.com/) utilities and simple widgets, 
intended to help web developers with their work with
[USOS](http://usos.edu.pl/about-usos)-related projects (primarily, the *USOSweb*
project). If you don't know what *jQuery* and *USOS* are, then you're in a wrong
place!

*jQuery-USOS* has strong connections to
[USOS API](http://apps.usos.edu.pl/developers/api/). Most of the methods and
widgets require you to use one of the existing USOS API
[installations](http://apps.usos.edu.pl/developers/api/definitions/installations/)
(via [proxy](https://github.com/MUCI/jquery-usos/blob/master/doc/installation.md)).

Contents
--------

  * Quick demo? Try 
    [this](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/widget.selector),
    [this](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/widget.notice),
    [this](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/widget.tip),
    [this](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/widget.progressOverlay), or
    [this](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/core.usosapiFetch).
    * Doesn't work? Try refreshing! ([why?](https://github.com/MUCI/jquery-usos/issues/1))
  * [Installation instructions](https://github.com/MUCI/jquery-usos/blob/master/doc/installation.md)
  * [Extending and backward compatibility](https://github.com/MUCI/jquery-usos/blob/master/doc/backward-compatibility.md)
  * [Change Log](https://github.com/MUCI/jquery-usos/blob/master/doc/changelog.md)

API
---
  
### $.usosCore

  * [$.usosCore.init](https://github.com/MUCI/jquery-usos/blob/master/doc/api/core.init.md) -
    you need to call this before using any other functions.
  * [$.usosCore.usosapiFetch](https://github.com/MUCI/jquery-usos/blob/master/doc/api/core.usosapiFetch.md) -
    fetch/post data from/to USOS API.
  * [$.usosCore.lang](https://github.com/MUCI/jquery-usos/blob/master/doc/api/core.lang.md) -
    primary language-helper.
  * [$.usosCore.panic](https://github.com/MUCI/jquery-usos/blob/master/doc/api/core.panic.md) -
    display a "panic" screen.

### $.usosEntity

  * [$.usosEntity.label](https://github.com/MUCI/jquery-usos/blob/master/doc/api/entity.label.md) - display a label with the name of an entity.
  * [$.usosEntity.link](https://github.com/MUCI/jquery-usos/blob/master/doc/api/entity.link.md) - display a link pointing to an entity.
  * [$.usosEntity.url](https://github.com/MUCI/jquery-usos/blob/master/doc/api/entity.url.md) - get an URL of entity's home page.

### $.usosUtils

  * [$.usosUtils.makeParagraphs](https://github.com/MUCI/jquery-usos/blob/master/doc/api/utils.makeParagraphs.md) - sanitize multi-line user-supplied input.
  * [$.usosUtils.requireFields](https://github.com/MUCI/jquery-usos/blob/master/doc/api/utils.requireFields.md) - verify signatures of complex input objects.

### $.usosWidgets

  * [usosSelector widget](https://github.com/MUCI/jquery-usos/blob/master/doc/api/widget.selector.md) - search for an entity and get its ID.
  * [usosNotice widget](https://github.com/MUCI/jquery-usos/blob/master/doc/api/widget.notice.md) - display notices or errors on form elements.
  * [usosTip widget](https://github.com/MUCI/jquery-usos/blob/master/doc/api/widget.tip.md) - display "info" icon with a message on hover.
  * [usosProgressOverlay widget](https://github.com/MUCI/jquery-usos/blob/master/doc/api/widget.progressOverlay.md) - display a progress indicator over an element.

*Note:* All widgets are [jQuery-UI widgets](http://api.jqueryui.com/jQuery.widget/).
