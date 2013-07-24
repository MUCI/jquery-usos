Extending and backward compatibility
====================================

Some notes jQuery-USOS backward compatibility "policy".

Backward compatibility
----------------------

  * **Versions 0.x.y** (alpha versions) are **NOT** backward compatible.
  * Starting from **version 1.0**, all stuff which is **documented on GitHub** is
    *planned* to be backward compatible. However:
    * This does **NOT** mean, that future versions of *jQuery-USOS* will
      **look** the same.
    * We'll try to avoid it, but there still can be some backward-incompatible 
      changes. This means, that you may be required to change your code once
      you upgrade your jQuery-USOS library. Especially if you customized things.
    * We will describe backward-incompatible changes in our
      [changelog](changelog.md).
  * **Undocumented stuff** - usually (but not necessarily) prefixed with an 
    underscore (_) - is **private** and it is **NOT**  backward compatible.

Extending jQuery-USOS
---------------------

If you want to extend jQuery-USOS with some new plugins, please keep in mind,
that all new widgets and plugins should pass a
[proof of concept](https://en.wikipedia.org/wiki/Proof_of_concept#In_Software_Development)
test before being officially added to *jQuery-USOS*. E.g. they should be
previously tested and published as separate widgets in a
[pilot](https://en.wikipedia.org/wiki/Software_prototyping) project
(i.e. an *USOSweb* module).
