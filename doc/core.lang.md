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

### format

*Optional.* The format of the returned value. One of the following:

  * `plaintext` *(default)* - return a plaintext string. If the current
    language could not be found in the given `langdict`, the string will contain
    a prefix (e.g. "(in Polish)").
  * `jQuery` - return a jQuery object with a `<span />` element. The content
    will be treated as plaintext.
  * `jQuery-HTML` - return a jQuery object with a `<div />` element. The content
    will be treated as HTML.

### langpref

*Optional.* You can use it to override the language set during
[$.usosCore.init](core.init.md). Default value is `inherit`.
