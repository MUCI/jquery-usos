$.usosCore.lang(...)
====================

This is used internally, but you can use it in your code too. Helps with
common translation-related operations. Can be called in numerous ways.

Demos
-----

  * [$.usosCore.lang Demo](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/core.lang)

`$.usosCore.lang()`
-------------------

This will return the currently used language code (the one which was set during
[$.usosCore.init](core.init.md)).

`$.usosCore.lang(langdict)`
---------------------------

Extract the proper translation from the given LangDict object (format commonly
used in USOS API). Works the same as if you called
`$.usosCore.lang({langdict: {pl: "Po polsku", en: "In English"}})`

`$.usosCore.lang("Po polsku", "In English")`
--------------------------------------------

Another shorthand for `$.usosCore.lang({langdict: {pl: "Po polsku", en: "In English"}})`.

`$.usosCore.lang(string)`
-------------------------

Safety measure. It will simply return the given string.

`$.usosCore.lang(options)`
--------------------------

The valid options are:

### langdict

**Required.** The LangDict object with translated strings.

### format

*Optional.* The format of the returned value. One of the following:

  * `plaintext` (default) - return a plaintext string. If the current
    language could not be found in the given `langdict`, the string will contain
    a prefix (e.g. "(in Polish)").
  * `jQuery` - return a jQuery object. In this case, the prefix will be wrapped
    in `<span class='ua-note' />`. The content itself will still be treated as
    plaintext.

### langpref

*Optional.* You can use it to override the language set during
[$.usosCore.init](core.init.md). Default value is `inherit`.
