/*
 * JQuery-USOS entrypoint
 */

import './deps.js';

import 'js/0-core.js';
import 'js/badge.js';
import 'js/entity.js'
import 'js/forms.js';
import 'js/utils.js';
import 'js/value.js';
import 'js/widget._apitable.js';
import 'js/widget._feedback.js';
import 'js/widget.0-_badge.js';
import 'js/widget.0-_value.js';
import 'js/widget.checkbox.js';
import 'js/widget.notice.js';
import 'js/widget.progressOverlay.js';
import 'js/widget.radioboxes.js';
import 'js/widget.selectbox.js';
import 'js/widget.selector.js';
import 'js/widget.textbox.js';
import 'js/widget.tip.js';

import "entities/_example.js";
import "entities/courses.course.js";
import "entities/example.js";
import "entities/fac.faculty.js";
import "entities/geo.building.js";
import "entities/progs.programme.js";
import "entities/slips.template.js";
import "entities/users.user.js";

// Display warnning if we are in dev mode
if($DEBUG) {
  console.warn(`Warning! Using development version of ${$NAME} ${$VERSION}.\nIf you see this error in production there's probably some issue with your imports.\nPlease check that out!`);
}