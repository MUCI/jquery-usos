(function($) {
	
	"use strict";
	
	var badges = {};
	
	$.widget('usosWidgets.usosUserBadge', {
		options: {
			user_id: null,
			position: "right"
		},
		widgetEventPrefix: "usosUserBadge:",
		
		_create: function() {
			
			/* Postpone actual initialization until the user hovers over
			 * the item for some time. This saves a lot of resources. */
			
			var widget = this;
			widget._on(widget.element, {
				mouseenter: function() {
					widget.timeoutId = setTimeout(function() {
						widget._create2();
					}, 200);
				},
				mouseleave: function() {
					clearTimeout(widget.timeoutId);
				}
			});
		},
		
		/**
		 * Continue initialization.
		 */
		_create2: function() {
			
			var widget = this;
			
			/* Prevent re-initialization (via another mouseover). */
			
			if (widget.timeoutId) {
				
				/* If timeoutId is still set, then it means that the mouse is
				 * still over the element. If it stays there, then we should
				 * autoopen the tooltip. */
				
				widget._off(widget.element, "mouseenter mouseleave");
				clearTimeout(widget.timeoutId);
				widget.timeoutId = null;
				
				var autoopenTimeoutId = setTimeout(function() {
					widget.element.tooltipster("show");
					widget._off(widget.element, "mouseout");
				}, 200);
				widget._on(widget.element, {
					mouseleave: function() {
						clearTimeout(autoopenTimeoutId);
					}
				});
			}
			
			/* Initialize tooltipster. */

			widget.element.tooltipster({
				content: $.usosUtils._tooltipster_html(
					"<div class='ua-loading'>" + $.usosCore.lang("Wczytywanie...", "Loading...") + "</div>"
				),
				onlyOne: false,
				delay: 400,
				interactive: true,
				speed: 0,
				position: widget.options.position,
				theme: "ua-tooltip ua-tooltip-userbadge"
			});

			/* 2. Begin loading user data. */
			
			widget._updateTipContent();
		},
		
		/**
		 * Update the tip content. This is usually called BEFORE the
		 * tip is shown since it requires AJAX data loading.
		 */
		_updateTipContent: function() {
			
			/* Check if we already have the data in our cache. This may
			 * happen is there are N usertips for 1 user. */
			
			var widget = this;
			if (badges[widget.options.user_id]) {
				widget._updateTipContent2();
			} else {
				widget._createBadgeAsync().done(function(badge) {
					badges[widget.options.user_id] = badge;
				}).fail(function() {
					badges[widget.options.user_id] = $("<div>").append($("<div class='ua-loading'>")
						.text($.usosCore.lang(
							"Wystąpił błąd. Prosimy odświeżyć stronę.",
							"Error occured. Please refresh the page."
						))
					);
				}).always(function() {
					widget._updateTipContent2();
				});
			}
		},
		
		/**
		 * Fetch user data, construct the new badge element. Return
		 * a Promise object which resolves into a jQuery element.
		 */
		_createBadgeAsync: function() {
			
			var widget = this;
			var deferred = $.Deferred();
			
			/* Create the basic structure for the badge and start fetching the photo. */
			
			var badge = $(
				"<div><table class='ua-container'><tr><td class='ua-td1'>" +
				"<a class='ua-photo-link'><img class='ua-photo'/></a>" +
				"</td><td class='ua-td2'>" +
				"<div class='ua-name'></div><ul class='ua-functions'></ul>" +
				"</td></tr></table></div>"
			);
			var photoUrl = $.usosCore.usosapiUrl({
				method: "services/photos/photo",
				params: {
					user_id: widget.options.user_id,
					blank_photo: true,
					transform: true,
					max_width: 100,
					max_height: 100,
					enlarge: true,
					cover: true
				}
			});
			badge.find('.ua-photo').attr("src", photoUrl);
			$.usosCore._preload(badge);
			
			/* Does the current installation provide its own user profile URLs? */
			
			var profile_url = $.usosEntity.url("entity/users/user", widget.options.user_id);
			var fields = "id|first_name|last_name|sex|student_programmes|employment_functions|employment_positions";
			if (!profile_url) {
				fields += "|profile_url";
			}
			
			/* Start loading user data. */
			
			$.usosCore.usosapiFetch({
				method: "services/users/user",
				params: {
					user_id: widget.options.user_id,
					fields: fields
				}
			}).done(function(user) {
				
				/* Name and profile link. */
				
				if (!profile_url) {
					profile_url = user.profile_url;
				}
				badge.find('.ua-name').html($("<a>")
					.attr("href", profile_url)
					.text(user.first_name + " " + user.last_name)
				);
				badge.find('.ua-photo-link').attr('href', profile_url);
				
				/* Employment functions and positions (grouped by faculty). */
				
				var groups = {};
				$.each(user.employment_functions, function(_, emp) {
					if (!groups.hasOwnProperty(emp.faculty.id)) {
						groups[emp.faculty.id] = {
							faculty: emp.faculty,
							names: []
						};
					}
					groups[emp.faculty.id].names.push(emp['function']);
				});
				$.each(user.employment_positions, function(_, emp) {
					if (!groups.hasOwnProperty(emp.faculty.id)) {
						groups[emp.faculty.id] = {
							faculty: emp.faculty,
							names: []
						};
					}
					groups[emp.faculty.id].names.push(emp['position'].name);
				});
				$.each(groups, function(_, group) {
					var li = $("<li>")
						.append($.usosEntity.link("entity/fac/faculty", group.faculty))
						.append($("<br>"));
					group.names.sort(function(a, b) { return a.length > b.length ? -1 : 1; });
					$.each(group.names, function(i, name) {
						if (i > 0) {
							li.append($("<br>"));
						}
						li.append($("<span class='ua-func'>").text($.usosCore.lang(name)));
					});
					badge.find(".ua-functions").append(li);
				});
				
				/* Study programmes. */
				
				if (user.student_programmes.length > 0) {
					var li = $("<li>").append($.usosCore.lang(
						user.sex == 'M' ? "Student" : "Studentka",
						"Student"
					));
					$.each(user.student_programmes, function(_, sp) {
						li.append($("<br>"));
						li.append($.usosEntity.link("entity/progs/programme", sp.programme));
					});
					badge.find(".ua-functions").append(li);
				}
				
				/* Resolve the deffered. */
				
				deferred.resolve(badge);
			}).fail(function() {
				/* Something went wrong. */
				deferred.reject();
			});
			
			/* Return the promise. */
			
			return deferred.promise();
		},
		
		/**
		 * Update the tip content from badges cache.
		 */
		_updateTipContent2: function() {
			var widget = this;
			widget.element.tooltipster("update",
				badges[widget.options.user_id].html()
			);
		},
		
		_setOption: function(key, value) {
			/* Recreate. */
			this._create2();
			return this;
		},
		
		_destroy: function() {
			this.element.tooltipster('destroy');
		}
	});
	
})(jQuery);
