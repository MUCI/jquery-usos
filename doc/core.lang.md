$.usosCore.lang(...)
====================

Helps with common translation-related operations. Returns plaintext string *or*
jQuery object (depending on the `format` parameter).

Demos
-----

  * [$.usosCore.lang Demo](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/core.lang)

How to call it
--------------
  
  * `$.usosCore.lang()` - Return the currently used language code (the one
    set during [$.usosCore.init](core.init.md)).
  * `$.usosCore.lang(langdict)` - Extract the proper translation from the given
  LangDict object.
  * `$.usosCore.lang("Po polsku", "In English")` - Shorthand version of the
    form above.
  * `$.usosCore.lang(string)` - Will simply return the given string (in the
    wanted format).
  * `$.usosCore.lang(options)` - See the options below.

Options
-------

### langdict

**Required.** The LangDict object with translated strings. Or, a string in
a single language.

### wrapper

*Optional.* One of the following:

  * `none` - return an item from the given *langdict*, exactly as it was defined
    (i.e. no prefix will be added, nor any formatting applied).
  * `simple` *(default)* - return a string, as it was defined in given *langdict*,
    possibly with a simple plaintext prefix (if the current language could not be found in the given `langdict`).
  * `jQuery.text` - wrap the result in a jQuery `<span />` object.
    * If the prefix will be needed, it will be formatted (with the `ua-note` class).
    * The content will be treated as plaintext (safe for user input).
  * `jQuery.html` - wrap the result in a jQuery `<div />` object.
    * If the prefix will be needed, it will be formatted (with the `ua-note` class)
      and possibly placed in a separate paragraph.
    * The content will be treated as HTML.

### langpref

*Optional.* You can use it to override the language set during
[$.usosCore.init](core.init.md).
