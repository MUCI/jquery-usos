jQuery-USOS Change Log
======================

  * **Beta branch** - *(unreleased - things may change here!)*

    * **1.1.1.7**
      * abstracted most of the badge logic to a separate base.
      * fixed some issues with tooltipster showing "[object]" title after
        destroyed.
      * CSS fixes.
    * **1.1.1.6**
      * usosUserBadge renamed to usosBadge (with entity parameter).
    * **1.1.1.5**
      * usosTip widget gets new "type" parameter.
      * usosUserBadge displays privacy note (when viewing ones own badge).
      * user selector displays photos in suggestions.
      * $.usosCore.init takes user_id parameter.
      * $.usosCore.usosapiFetch takes errorOnUnload parameter.
      * usosTip widget doesn't create an icon when initialized directly on
        other element (possibly backward incompatible!).
      * textext and tooltipster libraries were tweaked. Rename them?
    * **1.1.1.4**
      * Renamed usosUserTip widget to usosUserBadge.
    * **1.1.1.3**
      * usosUserTip widget added.
      * $.usosEntity.link and $.usosEntity.label now make use of the usosUserTip
        widget (when used with `entity/users/user`). 
    * **1.1.1.2**
      * $.usosCore.usosapiUrl method added.
      * $.usosCore.init's `extraParams` deprecated. `extraParamsForPOST` and
        `extraParamsForGET` added instead. 
    * **1.1.1.1**
      * [$.usosCore.usosapiFetch](api/core.usosapiFetch.md) now supports
        `File`-type parameters.

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

