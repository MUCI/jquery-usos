jQuery-USOS Change Log
======================

  * **Version 1.4.3** - *2019-07-03*

    * Darker text in disabled fields for better visibility.
    * Removed references to public demo proxy in documentation.

  * **Version 1.4.2** - *2018-07-19*

    * Updated version of jQuery-BBQ library.
    * Fixed UglifyJS error on USOSweb export task.
    * Fixed overwriting of existing onclick property in tooltip widget.

  * **Version 1.4.1** - *2018-06-29*

    * New scripts for building the package, examples and export to USOSweb (using Grunt).
    * USOS ID of the user was removed from user badges (for GDPR compliance).
    * Tooltipster update to version 4.0. 
    * Fix for erroneous tooltip persistence.
    * Better touchscreen support for tooltips.

  * **Version 1.4.0** - *2016-10-05*

    * **Requires USOS API 6.2.0.0-8** (or any later version).
    * [User badges](api/widget.badge.md) will now display previous names of the
      user (in the "ID" section).

  * **Version 1.3.12** - *2016-10-05*

    * Accessibility improvements introduced in 1.3.11 have broken the apiTable
      plugin. Fixed now.

  * **Version 1.3.11** - *2016-09-29*

    * Accessibility improvements in [usosTip](api/widget.usosTip.md) and
      [usosSelector](api/widget.usosSelector.md) widgets.

  * **Version 1.3.10** - *2016-07-29*

    * Small bugfix in faculty badge (improper faculty URL in logo image).
    * Minor fixes in apitable plugin (alpha, undocumented).

  * **Version 1.3.9** - *2016-07-19*

    * Minor fixes in apitable plugin (alpha, undocumented).

  * **Version 1.3.8** - *2016-04-11*

    * Minor fixes in apitable plugin (alpha, undocumented).

  * **Version 1.3.7** - *2016-03-08*

    * `usosSelector` widget sometimes improperly called `search_history_affect`
      method with `null` parameter.

  * **Version 1.3.6** - *2015-05-21*

    * Fixes in CSS and images. Faculty badges should look better.

  * **Version 1.3.5** - *2015-04-23*

    * **Requires USOS API 6.0.1.0-13** (or any later version).
    * Enhancements and fixes in faculty [badges](api/widget.badge.md):
      * Badges will include faculty cover images instead of static maps (if
        cover images are available).
      * Fixed a bug with "nulls" sometimes displayed in the statistics shown
        in the upper part of the badge.
      * Fixed other bug with wrong number of subfaculties displayed in the
        statistics (`subfaculty_count` field was used instead of
        `public_subfaculty_count`).
      * Fixed display issues in Firefox.
    * New font icons added. Changed fonts and line-heights in default widget
      CSS.
    * Programme [selectors](api/widget.selector.md) will not always contain
      programme ID.
    * Repeated study programmes will no longer be displayed in user badges.
    * Changes in [usosTip widget](api/widget.usosTip.md). Initialization is
      more lazy, and width is calculated with different heuristics. Also
      fixed some issues regarding handling the widgets with keyboard.
    * [usosTextbox widget](api/widget.textbox.md) will now autogrow upon focus.
    * `panicCallback` option added in [$.usosCore.init](api/core.init.md).
    * `response.xhr.usosapiFetchOptions` added in
      [usosXHR](api/core.usosapiFetch.md)'s `fail(response)`.

  * **Version 1.3.4** - *2014-10-31*

    * Fixed [$.usosCore.panic](api/core.panic.md) - starting from 1.3 it didn't
      work properly when no arguments were passed.

  * **Version 1.3.3** - *2014-10-28*

    * New [usosSelector](api/widget.selector.md) parameter: `placeholder`.

  * **Version 1.3.2** - *2014-10-28*

    * Fixes minor display issues in
      [usosSelector widget](api/widget.selector.md).

  * **Version 1.3.1** - *2014-10-27*

    * **Requires USOS API 6.0.0.0-4** (or any later version).
    * New features and improvements to
      [usosSelector widget](api/widget.selector.md):
      * New entity supported: `entity/progs/programme`.
      * Fixed "show more" screen (no action was triggered on click).
      * `search_history_affect` method is now called properly when keyboard
        is used. It is also NOT called when the user is not logged in (which
        resulted in an error).
      * Improved display on small width fields (selector popup now has a
        certain min-width).
      * Improved CSS encapculation when used inside certain USOSweb forms.
      * Improved responsivity (progress indicator will show faster on slow
        USOS API connections).
    * New features and improvements to
      [usosBadge widgets](api/widget.badge.md):
      * Fixed an issue with badges dissapearing too quickly after mouseleave.
      * User badges include the "ID" section which may help to find and
        identify the user in other external systems.
      * Campus names are now included in building badges.
    * Fix overflow issue in tips and badges (`overflow-x: hidden` was applied
      to `body` and never removed).
    * Fix dynamic option-changes in usosBadges.
    * `_usosFeedback` widget (still undocumented beta) incorrectly cached the
      state of USOS API's feedback module.
    * Minor enhancements to `$.usosCore.panic`.

  * **Version 1.3** - *2014-07-12*

    * **Requires USOS API 6.0.0.**
    * New [badge widget](api/widget.badge.md): `entity/geo/building`.
    * Redesigned badge UI for `entity/fac/faculty`.
    * Improved [usosTip widget](api/widget.tip.md): Better design, better
      support for long content. New option: `showAs`.
    * Improved [$.usosCore.panic](api/core.panic.md) function: It now
      understands the newer version of API's user_messages response, it also
      returns a `$.Deferred` object.
    * New `_usosFeedback` widget (undocumented beta).
    * Enhancements and fixes in multiple widgets.

  * **Version 1.2.5** - *2014-04-24*

    * **Requires USOS API 5.4.6.1-1.**
    * Unofficial employment functions are now hidden from user badges.

  * **Version 1.2.4** - *2014-04-11*

    * **Requires USOS API 5.4.6.**
    * New widget: [usosRadioboxes](api/widget.radioboxes.md).
    * Added support for the `disabled` option for all `usosValue` widgets.
    * Display student numbers in user badges.
    * `usosOverlay` widget now shows up immediatelly (but it is still
      initially transparent) - this is done in order to additionally
      prevent user interaction with the overlayed content.

  * **Version 1.2.3** - *2014-03-17*

    * **Requires USOS API 5.4.5.**
    * Enhancements in the [usosSelector widget](api/widget.selector.md):
      * It includes user photos and employment positions is the suggestions.
      * It attempts to "remember" previous choices for some entities
        (see USOS API's `services/users/search_history_affect` method for more
        information).
      * The "See more results" entry is displayed on the bottom of the
        suggestions list. Currently, it allows the users to see up to 20
        results for their search queries.
    * Users' [usosBadges](api/widget.badge.md) are now more compact - i.e. when
      the user has many student programmes, they won't be displayed right away
      (the user will need to focus on them).
    * [$.usosEntity.label](api/entity.label.md) and other functions of the
      `usosEntity` family now support `entity/courses/course` entity type.
    * Minor bugfixes.

  * **Version 1.2.2** - *2014-02-09*

    * If connected to USOS API 5.4.5, [usosBadge widget](api/widget.badge.md) for
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
      * **Requires USOS API 5.4.4**.
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

