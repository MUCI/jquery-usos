jQuery-USOS Change Log
======================

  * **Version 1.1-rc1** - *2013-10-09*
  
    * Added the BETA version of the usosForms framework. This includes some
      new widgets (usosValue, usosSelectbox, usosCheckbox, usosTextbox) and
      utility functions (in the usosForms plugin). All these new features are
      yet undocumented. Avoid using them if it's important for you code to
      be compatible with future jQuery-USOS versions.
    * [$.usosCore.usosapiFetch](api/core.usosapiFetch.md) - both success/error
      handlers now take the USOS API response parameter. The same applies to
      the done/fail callbacks assigned to the *Promise object* returned by
      *usosapiFetch*.
    * [$.usosCore.panic](api/core.panic.md) now can display `user_messages`
      (if they are included in the USOS API error response).
    * Add the new `entity/progs/programme` entity to the family of
      [$.entity.*](api/entity.label.md) functions.

  * **Version 1.0.2** - *2013-09-24*
  
    * Added `searchParams` parameter to the
      [usosSelector widget](api/widget.selector.md).

  * **Version 1.0.1** - *2013-07-24*

    * Removed some undocumented features.
    * Changed parameter name: `sourceId` to `source_id`.

  * **Version 1.0** - *2013-07-24*

    The first official version. Some of the plugins used in the *0.x.y*
    versions (i.e. the [apitable](http://i.imgur.com/hngxh9J.png) plugin) were
    removed or marked as *ALPHA* (non-backward-compatible). These plugins may
    return in the future versions.

