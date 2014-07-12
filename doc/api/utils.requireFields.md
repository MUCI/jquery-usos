$.usosUtils.requireFields(object, requirements)
===============================================

Given *an object* and a *field selector*, do the following:

  * If run in debug mode:
    * Verify whether all wanted fields exist within the object.
    * Return a filtered objects - only the wanted fields will be included.
  * If run in non-debug mode:
    * Simply return the given object.

This might be useful for **documenting and testing** interface requirements
(see use case below).

Demos
-----

  * [$.usosUtils.requireFields Demo](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/utils.requireFields)

Example
-------

```javascript
var x = $.usosUtils.requireFields({a: {b: 3, c: 2}, b: 1, c: 1}, "a[c]|c");
/* Now x equals {a: {c: 2}, c: 1}. */
```

Use case
--------

If your function takes a complex object as a parameter, it might be useful to
make it a habit of calling `requireFields` in the beginning of such complex
functions:

```javascript
function foo(user) {
    user = $.usosUtils.requireFields(obj, "first_name|last_name|student_number");
    /* ... */
};
```

  * **Useful for documenting:** If you use `user.pesel` in `foo`, it will be
    `undefined`, until you add `pesel` to your `requirements`. Hence, it forces
    you to update your `requirements` properly.

  * **Useful for testing:** If you forget to fetch `student_number` into your
    `user`, and then you call `foo(user)`, an error will be logged into the
    developer console (in debug mode). Hence, you should notice that your object
    does not meet your function's requirements.

Parameters
----------

  * `object` - any object (usually fetched from USOS API).
  * `requirements` - a string in the same format as USOS API's `fields`
    parameter. You may require nested fields using brackets.
