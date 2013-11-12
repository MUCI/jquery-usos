(function($) {
	
	"use strict";
	
	var mycache = {};
	
	$.widget('usosWidgets.usosUserBadge', {
		options: {
			user_id: null,
			position: "right"
		},
		widgetEventPrefix: "usosUserBadge:",
		
		_create: function() {
			
			/* Postpone actual initialization until the user hovers over
			 * the item for some time. */
			
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
					
					/* This is the default tooltip content. It can get updated either before or
					 * after it is shown. */
					
					"<div class='ua-loading'>" + $.usosCore.lang("Wczytywanie...", "Loading...") + "</div>"
				),
				onlyOne: false,
				delay: 400,
				updateAnimation: false,
				interactive: true,
				speed: 0,
				position: widget.options.position,
				theme: "ua-tooltip ua-tooltip-userbadge",
				functionAfter: function() {
					
					/* When tooltip is closed, tooltipster removes it from the DOM. This in turn,
					 * destroys all widgets contained within. If we want the widgets to work properly
					 * when the tooltip is opened next time, then we need to recreate the widgets
					 * again. */ 
					
					widget._updateBadgeContent();
				}
			});

			/* 2. Begin loading user data. */
			
			widget._updateBadgeContent();
		},
		
		/**
		 * Begin fetching and creating the badge.
		 */
		_updateBadgeContent: function() {
			var widget = this;
			widget._fetchUserData().done(function(data) {
				widget.element.tooltipster("update", widget._createBadge(data));
			}).fail(function() {
				widget.element.tooltipster("update", $("<div class='ua-loading'>")
					.text($.usosCore.lang(
						"Wystąpił błąd. Prosimy odświeżyć stronę.",
						"Error occured. Please refresh the page."
					))
				);
			});
		},
		
		/**
		 * Return a Promise object which resolves into a user object. This promise
		 * can be resolved immediatelly, if the user data is already present in the
		 * cache!
		 */
		_fetchUserData: function() {
			
			var widget = this;
			var deferred = $.Deferred();
			
			if (mycache[widget.options.user_id]) {
				
				/* Return the cached user object. */
				deferred.resolve(mycache[widget.options.user_id]);
				
			} else {
				
				/* Determine which fields need to be fetched. Was jQuery-USOS initialized with
				 * custom user profile URLs? If not, we need to fetch USOS API's profile URLs
				 * instead. */
				
				var local_profile_url = $.usosEntity.url("entity/users/user", widget.options.user_id);
				var fields = "id|first_name|last_name|sex|student_programmes|employment_functions|employment_positions";
				if (!local_profile_url) {
					fields += "|profile_url";
				}
				
				/* Preload user's photo - the result is discarded, but the browser should
				 * cache it (provided that our proxy issues proper caching headers!). */
				
				var photoUrl = $.usosCore._userPhotoUrl(widget.options.user_id);
				$.usosCore._preload($("<img>").attr("src", photoUrl));
				
				/* Fetch the data. */
				
				$.usosCore.usosapiFetch({
					method: "services/users/user",
					params: {
						user_id: widget.options.user_id,
						fields: fields
					}
				}).done(function(user) {
					
					/* If needed, replace the profile URL with local version. */
					
					if (local_profile_url) {
						user.profile_url = local_profile_url;
					}
					
					/* Cache the result and resolve. */
					
					mycache[widget.options.user_id] = user;
					deferred.resolve(user);
					
				}).fail(function() {
					deferred.reject();
				});
			}
			
			return deferred.promise();
		},
		
		_createBadge: function(user) {
			
			var widget = this;
			
			/* Structure */
			
			var badge = $(
				"<div><table class='ua-container'><tr><td class='ua-td1'>" +
				"<a class='ua-photo-link'><img class='ua-photo'/></a>" +
				"</td><td class='ua-td2'>" +
				"<div class='ua-td2top'><div class='ua-name'></div><ul class='ua-functions'></ul></div>" +
				"</td></tr></table></div>"
			);
			
			/* Photo */
			
			var photoUrl = $.usosCore._userPhotoUrl(widget.options.user_id);
			badge.find('.ua-photo').attr("src", photoUrl);
			
			/* Name and profile link */

			badge.find('.ua-name').html($("<a>")
				.attr("href", user.profile_url)
				.text(user.first_name + " " + user.last_name)
			);
			badge.find('.ua-photo-link').attr('href', user.profile_url);
				
			/* Employment functions and positions (grouped by faculty) */
				
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
				
			/* Study programmes */
				
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
				
			/* Photo privacy reminder */
				
			if (user.id == $.usosCore._getSettings().user_id) {
				badge.find(".ua-td2").append($("<div class='ua-privacy-note'>")
					.append($("<span>")
						.text($.usosCore.lang(
							"Kto może oglądać moje zdjęcie?",
							"Who can see my photo?"
						))
						.usosTip({
							content: ($("<div>")
								.html($.usosCore.lang(
									"Widoczność Twojego zdjęcia możesz zmienić<br>na stronach preferencji w USOSweb (zakładka<br>Mój USOSweb -> Preferencje).",
									"You can change the visibility of your photo<br>on your USOSweb preferences page (My<br>USOSweb -> Preferences tab)."
								))
							),
							/* WRCLEANIT
							function() {
								var deferred = $.Deferred();
								
								var request1 = $.usosCore.usosapiFetch({
									method: "services/photos/settings"
								});
								var request2 = $.usosCore.usosapiFetch({
									method: "services/photos/user_preferences"
								});
								$.when(request1, request2).done(function(defaults, prefs) {
									if (prefs.student_photo_visibility == "default") {
										prefs.student_photo_visibility = defaults.default_student_photo_visibility;
									}
									if (prefs.staff_photo_visibility == "default") {
										prefs.staff_photo_visibility = defaults.default_staff_photo_visibility;
									}
									if (prefs.others_photo_visibility == "default") {
										prefs.others_photo_visibility = defaults.default_others_photo_visibility;
									}
									return prefs;
								}).done(function(prefs) {
									console.log(prefs);
									deferred.resolve("...");
								}).fail(function() {
									deferred.resolve("...");
								});
								return deferred.promise();
							},
							*/
							position: "bottom",
							type: "tool",
							_autoWidth: false
						})
					)
				);
			}
			
			return badge;
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
