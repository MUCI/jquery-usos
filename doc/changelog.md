jQuery-USOS Change Log
======================

  * **Version 1.2.2** - *2014-02-09*

    * If connected to USOS API 5.4.5, [usosBadge widget](widget.badge.md) for
      the `entity/users/user` displays active and inactive student programmes
      separately.
 
  * **Version 1.2.1** - *2014-01-30*

    * [$.usosCore.usosapiFetch](api/core.usosapiFetch.md): The `xhr` field was
      added to the `response` objects sent to the error callbacks
      (`usosXHR.fail(function(response) {...})` method).
    * [usosSelector widget](api/widget.selector.md) now shows suggestions on
      focus.
    * Fixed some minor display errors in tooltips, notices and badges.

  * **Version 1.2** - *2014-01-07*

    * New requirements:
      * jQuery-USOS 1.2 requires USOS API 5.4.4.
      * TextExt and Tooltipster libraries were tweaked. Make sure you use the
        ones provided in our repository.
    * Backward-incompatible changes:
      * [usosTip widget](api/widget.tip.md) won't create an icon anymore, if
        it was initialized directly on other (existing) element.
      * [$.usosCore.usosapiFetch](api/core.usosapiFetch.md) will no longer call
        `fail` if the user is navigating away from page. You may bring back this
        behavior with `errorOnUnload` parameter.
    * New features and backward-compatible changes:
      * **New widget:** [usosBadge](api/widget.badge.md). Many widgets and 
        methods make use of the usosBadge widget automatically.
      * [$.usosCore.usosapiFetch](api/core.usosapiFetch.md)
         * Now supports `File`-type parameters.
         * New parameter: `errorOnUnload`.
         * Returned Promise object now includes XHR's `abort()` method.
      * [$.usosCore.init](api/core.init.md)
         * New `USOSapis` parameter: `user_id`
      * [usosTip widget](api/widget.tip.md)
         * New parameters: `type` and `delayed`

  * **Version 1.1.1** - *2013-10-16*

    * Minor bug fixed in the `.usosForms('showErrors', response)` function.

  * **Version 1.1** - *2013-10-16*
  
    * Added support for forms and server-side validation.
      This includes some new widgets
      ([usosValue](api/widget.value.md),
      [usosSelectbox](api/widget.selectbox.md),
      [usosCheckbox](api/widget.checkbox.md),
      [usosTextbox](api/widget.textbox.md))
      and utility functions (in the [usosForms plugin](api/forms.md)).
    * [$.usosCore.usosapiFetch](api/core.usosapiFetch.md) - both success/error
      handlers now take the USOS API response parameter. The same applies to
      the done/fail callbacks assigned to the *Promise object* returned by
      *usosapiFetch*.
    * [$.usosCore.panic](api/core.panic.md) now can display `user_messages`
      (if they are included in the USOS API error response).
    * Added the new `entity/progs/programme` entity to the family of
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

