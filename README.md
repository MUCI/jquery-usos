jQuery-USOS plugin
==================

This is a set of [jQuery](http://jquery.com/) utilities and simple widgets, 
intended to help web developers with their work with
[USOS](http://usos.edu.pl/about-usos)-related projects (primarily, the *USOSweb*
project).

Official project homepage:
[https://github.com/MUCI/jquery-usos](https://github.com/MUCI/jquery-usos).


About
-----

  * Quick demos
    * Try 
      [this](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/widget.selector),
      [this](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/widget.notice),
      [this](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/widget.tip),
      [this](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/widget.progressOverlay), or
      [this](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/core.usosapiFetch).
    * Doesn't work? Click the "Run" button one more time ([why?](https://github.com/MUCI/jquery-usos/issues/1))
  * [Requirements and installation instructions](https://github.com/MUCI/jquery-usos/blob/master/doc/installation.md)
  * [Change Log](https://github.com/MUCI/jquery-usos/blob/master/doc/changelog.md)
  * [Backward compatibility policy](https://github.com/MUCI/jquery-usos/blob/master/doc/backward-compatibility.md)
    * [Beta branch](https://github.com/MUCI/jquery-usos/blob/master/doc/backward-compatibility.md)

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

### jQuery-UI widgets ([see here](http://api.jqueryui.com/jQuery.widget/))

  * [usosBadge widget](https://github.com/MUCI/jquery-usos/blob/master/doc/api/widget.badge.md) - display a badge when user hovers over USOS entities.
  * [usosValue widget](https://github.com/MUCI/jquery-usos/blob/master/doc/api/widget.value.md) - a base class for all widgets which hold a **value**.
    * [usosSelector widget](https://github.com/MUCI/jquery-usos/blob/master/doc/api/widget.selector.md) - allow the user to search for an entity and get its ID.
    * [usosCheckbox widget](https://github.com/MUCI/jquery-usos/blob/master/doc/api/widget.checkbox.md) - *usosValue* equivalent of `<input type='checkbox'>` with a label.
    * [usosRadioboxes widget](https://github.com/MUCI/jquery-usos/blob/master/doc/api/widget.radioboxes.md) - *usosValue* equivalent of a set of `<input type='radio'>` with labels.
    * [usosSelectbox widget](https://github.com/MUCI/jquery-usos/blob/master/doc/api/widget.selectbox.md) - *usosValue* equivalent of `<select>` input.
    * [usosTextbox widget](https://github.com/MUCI/jquery-usos/blob/master/doc/api/widget.textbox.md) - *usosValue* equivalent of `<input type='text'>` and `<textarea>` inputs.
  * [usosNotice widget](https://github.com/MUCI/jquery-usos/blob/master/doc/api/widget.notice.md) - display notices or errors on form elements.
  * [usosTip widget](https://github.com/MUCI/jquery-usos/blob/master/doc/api/widget.tip.md) - display "info" icon with a message on hover.
  * [usosProgressOverlay widget](https://github.com/MUCI/jquery-usos/blob/master/doc/api/widget.progressOverlay.md) - display a progress indicator over an element.

### Other

  * [.usosForms(...)](https://github.com/MUCI/jquery-usos/blob/master/doc/api/forms.md) - utility functions for working with **usosValue forms** (i.e. server-side validation).
