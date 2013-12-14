Backward compatibility
====================================

Some notes jQuery-USOS backward compatibility "policy".

  * **Versions 0.x.y** (alpha versions) are **NOT** backward compatible.
  * Starting from **version 1.0**, all stuff which is **documented on GitHub** is
    *planned* to be backward compatible. However:
    * This does **NOT** mean, that future versions of *jQuery-USOS* will
      **look** the same. In particular, you should **not** assume that the
      undocumented parts of the widgets' DOM will have the same structure.
      If you use custom CSS, then you might need to modify it while upgrading.
    * We'll try to avoid it, but there still can be some backward-incompatible 
      changes. This means, that you may be required to change your code once
      you upgrade your jQuery-USOS library. Even if you acted only on the
      documented parts of the API.
    * We will describe backward-incompatible changes in our
      [changelog](changelog.md).
  * **All undocumented stuff** - usually (but *not* necessarily) prefixed with an 
    underscore (_) - is **private** and is **NOT** planned to stay backward
    compatible.

Beta branch
-----------

All new widgets and plugins should pass a
[proof of concept](https://en.wikipedia.org/wiki/Proof_of_concept#In_Software_Development)
test before being officially added to *jQuery-USOS*. E.g. they should be
previously tested and published as separate widgets in a
[pilot](https://en.wikipedia.org/wiki/Software_prototyping) project
(i.e. an *USOSweb* module).

Such untested features are put "on hold" into the beta branch. Only after they
are properly tested, they will be included in the official release (master
branch).
