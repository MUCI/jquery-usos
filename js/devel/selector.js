(function($) {
	
	"use strict";
	
	var NS = "usosSelector";
	
	/** We're using a single timer for all the selectors. */
	var _timer = null;
	
	/**
	 * Delay running callback for 'delay' seconds. If _startTimer is called again
	 * before delay is passed, the timer resets.
	 */
	var _startTimer = function(delay, callback) {
		_stopTimer();
		_timer = setTimeout(
			function() {
				_timer = null;
				callback();
			},
			delay * 1000
		);
	};
	
	/**
	 * Cancel the timer (previously started with _startTimer).
	 */
	var _stopTimer = function() {
		if (_timer) {
			clearTimeout(_timer);
			_timer = null;
		}
	};
	
	/**
	 * Returns the number of seconds to wait after the user finished typing.
	 * After such delay, AJAX request is issued.
	 */
	var _getAjaxDelay = function() {
		
		/* In the future, we may decide that it should vary on such things
		 * as browser version, resolution, internet speed etc. Currently, we
		 * assume that all clients are fast enough. */
		
		return 0.25;
	};
	
	/**
	 * Give our component a "filled" look and feel. This is used, when 'multi' is false,
	 * and there is one selected ID present.
	 */
	var _markFilled = function(mydata) {
		mydata.$root.addClass("ua-filled");
	};
	
	/**
	 * Remove the "filled" look and feel (previously applied with _markFilled).
	 */
	var _markUnfilled = function(mydata) {
		mydata.$root.removeClass("ua-filled");
	};
	
	/** Return true if two values are equal. */
	var _isEqual = function(va, vb) {
		return JSON.stringify(va) == JSON.stringify(vb);
	};
	
	/**
	 * A common part of all inits. Note, that internalOptions are unaccessible to the
	 * user (they come from our internal constructors).
	 */
	var _internalInit = function() {
		
		var $this = $(this);
		var mydata = $this.data(NS);
		
		/* This is a dictionary of all key=>item pairs loaded so far. */
		
		mydata.knownItems = {};
		
		/* Create UI elements. */
		
		$this
			.empty()
			.addClass("ua-container ua-selector")
			.css("width", mydata.settings.width)
			.append($("<textarea>")
				.attr("rows", "1")
				.css("width", mydata.settings.width)
			);
		
		/* This is used for syncing suggestion requests. */
		
		mydata.suggestionsSyncObject = {};
		
		/* This is used for publishing the 'change' event. */
		
		mydata.previousValue = mydata.settings.multi ? [] : null;
		
		/* Discover, bind and extend key UI elements. */
		
		mydata.$root = $this;
		mydata.$textarea = $this.find("textarea");
		var distanceToTop = mydata.$root.offset().top;
		var distanceToBottom = $(document).height() - mydata.$root.offset().top - mydata.$root.height();
		mydata.$textarea
			.textext({
				plugins: 'autocomplete tags focus prompt',
				prompt: mydata.settings.prompt,
				autocomplete: {
					dropdown: {
						maxHeight: "200px",
						position: (distanceToBottom > 200) ? "below" : ((distanceToTop > distanceToBottom) ? "above" : "below")
					},
					render: function(suggestion) {
						var $span = $('<span>')
							.html(mydata.settings.suggestionRenderer(mydata.knownItems[suggestion]));
						$span.find("*").addBack().addClass("text-label");
						return $span;
					}
				},
				ext: {
					tags: {
						renderTag: function(tag)
						{
							var node = $(this.opts('html.tag'));
							node.find('.text-label')
								.html(mydata.settings.tagRenderer(mydata.knownItems[tag]));
							node.data(NS, mydata.knownItems[tag]);
							node.data('text-tag', tag);
							return node;
						}
					}
				}
			})
			.bind('getSuggestions', function(e, data)
			{
				var $self = $(this);
				var textext = $(e.target).textext()[0];
				var query = (data ? data.query : '') || '';
				
				_startTimer(
					_getAjaxDelay(),
					function()
					{
						$.usosCore.usosapiFetch({
							sourceId: mydata.settings.sourceId,
							method: mydata.settings.search.method,
							params: mydata.settings.search.paramsProvider(query),
							syncMode: 'receiveIncrementalFast',
							syncObject: mydata.suggestionsSyncObject,
							success: function(data) {
								var keys = [];
								$.each(mydata.settings.search.itemsExtractor(data), function(_, item) {
									var id = mydata.settings.idExtractor(item);
									mydata.knownItems[id] = item;
									keys.push(id);
								});
								$self.trigger('setSuggestions', { result: keys });
							},
							error: function(xhr, errorCode, errorMessage) {
								mydata.$textarea.usosOverlays("showContextMessage", {
									type: "error",
									message: $.usosCore.langSelect(
										"Nie udało się wczytać listy sugestii. Spróbuj odświeżyć stronę (F5).",
										"Could not load the list of suggestions. Try to refresh tha page (F5)."
									)
								});
							}
						});
					}
				);
			})
			.bind('isTagAllowed', function(e, data) {
				if (!mydata.knownItems[data.tag]) {
					mydata.$textarea.usosOverlays("showContextMessage", {
						type: "error",
						message: $.usosCore.langSelect(
							"Przed wciśnięciem Enter należy poczekać na załadowanie listy sugestii.",
							"Before pressing Enter, you should wait until the suggestions show up."
						)
					});
					data.result = false;
					return;
				}
				var values = _getIds(mydata);
				if ((!mydata.settings.multi) && (values.length > 0)) {
					_setIds(mydata, []);
					return;
				}
				if (mydata.settings.multi && $.inArray(data.tag, values) >= 0) {
					mydata.$textarea.usosOverlays("showContextMessage", {
						type: "error",
						message: $.usosCore.langSelect(
							"Ta pozycja już znajduje się na liście.",
							"This item is already on the list."
						)
					});
					data.result = false;
					return;
				}
			})
			.bind('setFormData', function() {
				var currentValue = mydata.$root.usosSelector('value');
				if (!mydata.settings.multi) {
					if (currentValue === null) {
						_markUnfilled(mydata);
					} else {
						_markFilled(mydata);
					}
				}
				if (!_isEqual(currentValue, mydata.previousValue)) {
					mydata.previousValue = currentValue;
					mydata.$root.trigger('change');
				}
			});
		
		if (mydata.settings.value) {
			mydata.$root.usosSelector('value', mydata.settings.value);
		}
	};
	
	/**
	 * Build and return internal config for searching users.
	 */
	var _entitySetup_user = function(settings) {
		return {
			prompt: $.usosCore.langSelect("Wpisz imię i nazwisko", "Enter the user's name"),
			search: {
				method: 'services/users/search',
				paramsProvider: function(query) {
					return {
						'name': query
					};
				},
				itemsExtractor: function(data) {
					return data.items;
				}
			},
			get: {
				method: 'services/users/users',
				paramsProvider: function(ids) {
					return {
						'user_ids': ids.join("|"),
						'fields': 'id|first_name|last_name'
					};
				},
				itemsExtractor: function(data) {
					
					/* The users/users method returns results in an unordered {user_id: user}
					 * format. */
					
					var items = [];
					$.each(data, function(user_id, user) {
						if (user === null) {
							$.usosCore.console.warn("User " + user_id + " not found! Will be skipped!");
							return true; // continue
						}
						items.push(user);
					});
					return items;
				}
			},
			idExtractor: function(item) {
				/* 'search' method returns user_ids, 'users' method returns ids. */
				return item.user_id || item.id;
			},
			suggestionRenderer: function(item) {
				/* Suggestions are feeded from the "search" method which includes
				 * some additional info. */
				var $div = $("<div>");
				$div.append($("<span>").html(item.match));
				$.each(item.active_employment_functions, function(_, f) {
					$div.append(" ").append($("<span class='ua-note'>")
						.text(
							"- " + $.usosCore.langSelect(f['function']) +
							" (" + $.usosCore.langSelect(f.faculty.name) + ")"
						)
					);
				});
				$.each(item.active_student_programmes, function(_, f) {
					$div.append(" ").append($("<span class='ua-note'>")
						.text("- " + $.usosCore.langSelect(f.programme.description))
					);
				});
				return $div;
			},
			tagRenderer: function(item) {
				/* 'search' method returns 'match', 'users' method returns first_name and last_name. */
				if (item.match) {
					return $("<span>").html(item.match).text();
				} else {
					return item.first_name + " " + item.last_name;
				}
			}
		};
	};
	
	/**
	 * Build and return internal config for searching courses.
	 */
	var _entitySetup_course = function(settings) {
		return {
			prompt: $.usosCore.langSelect("Wpisz nazwę przedmiotu", "Enter a course name"),
			search: {
				method: 'services/courses/search',
				paramsProvider: function(query) {
					return {
						'lang': $.usosCore.getLangPref(),
						'name': query
					};
				},
				itemsExtractor: function(data) {
					return data.items;
				}
			},
			get: {
				method: 'services/courses/courses',
				paramsProvider: function(ids) {
					return {
						'course_ids': ids.join("|"),
						'fields': 'id|name'
					};
				},
				itemsExtractor: function(data) {
					
					/* The 'courses' method returns an unordered dictionary of the {course_id: course} form. */
					
					var items = [];
					$.each(data, function(course_id, course) {
						if (course === null) {
							$.usosCore.console.warn("Course " + course_id + " not found! Will be skipped!");
							return true; // continue
						}
						items.push(course);
					});
					return items;
				}
			},
			idExtractor: function(item) {
				/* 'search' method returns course_ids, 'courses' method returns ids. */
				return item.course_id || item.id;
			},
			suggestionRenderer: function(item) {
				return item.match;
			},
			tagRenderer: function(item) {
				
				/* 'search' method returns 'match', 'users' method returns 'name'. Exact
				 * value of 'match' is undocumented, so we use some heuristics here... */
				
				var name;
				if (item.match) {
					name = $("<span>").html(item.match).text();
					// Remove the " (course code)" part, if present.
					var i = name.indexOf(" (" + item.course_id + ")");
					if (i > 0) {
						name = name.substring(0, i);
					}
				} else {
					name = $.usosCore.langSelect(item.name);
				}
				
				/* Return in a block with decent max-width applied. */
				
				return $('<span>').text(name).css({
					'white-space': 'nowrap',
					'display': 'inline-block',
					'overflow': 'hidden',
					'max-width': '180px',
					'text-overflow': 'ellipsis'
				});
			}
		};
	};
	
	/**
	 * Build and return internal config for searching faculties.
	 */
	var _entitySetup_faculty = function(settings) {
		return {
			prompt: $.usosCore.langSelect("Wpisz nazwę jednostki", "Enter a faculty name"),
			search: {
				method: 'services/fac/search',
				paramsProvider: function(query) {
					return {
						'lang': $.usosCore.getLangPref(),
						'fields': 'id|match|name',
						'query': query
					};
				},
				itemsExtractor: function(data) {
					return data.items;
				}
			},
			get: {
				method: 'services/fac/faculties',
				paramsProvider: function(ids) {
					return {
						'fac_ids': ids.join("|"),
						'fields': 'id|name'
					};
				},
				itemsExtractor: function(data) {
					
					/* The 'faculties' method returns an unordered dictionary of the {fac_id: faculty} form. */
					
					var items = [];
					$.each(data, function(fac_id, faculty) {
						if (faculty === null) {
							$.usosCore.console.warn("Faculty " + fac_id + " not found! Will be skipped!");
							return true; // continue
						}
						items.push(faculty);
					});
					return items;
				}
			},
			idExtractor: function(item) {
				/* Both methods have the "id" field. */
				return item.fac_id || item.id;
			},
			suggestionRenderer: function(item) {
				return item.match;
			},
			tagRenderer: function(item) {
				
				/* Both methods have the "name" field. */
				
				var name = $.usosCore.langSelect(item.name);
				
				/* Return in a block with decent max-width applied. */
				
				return $('<span>').text(name).css({
					'white-space': 'nowrap',
					'display': 'inline-block',
					'overflow': 'hidden',
					'max-width': '250px',
					'text-overflow': 'ellipsis'
				});
			}
		};
	};

	/**
	 * Build and return internal config for searching slip templates.
	 */
	var _entitySetup_slip_template = function(settings) {
		return {
			prompt: $.usosCore.langSelect("Wpisz nazwę szablonu obiegówki", "Enter a slip template name"),
			search: {
				method: 'services/slips/search_templates',
				paramsProvider: function(query) {
					return {
						'langpref': $.usosCore.getLangPref(),
						'fields': 'id|match|name|state',
						'query': query
					};
				},
				itemsExtractor: function(data) {
					return data.items;
				}
			},
			get: {
				method: 'services/slips/templates',
				paramsProvider: function(ids) {
					return {
						'tpl_ids': ids.join("|"),
						'fields': 'id|name'
					};
				},
				itemsExtractor: function(data) {
					var items = [];
					$.each(data, function(tpl_id, template) {
						if (template === null) {
							$.usosCore.console.warn("Template " + tpl_id + " not found! Will be skipped!");
							return true; // continue
						}
						items.push(template);
					});
					return items;
				}
			},
			idExtractor: function(item) {
				return item.id;
			},
			suggestionRenderer: function(item) {
				var $div = $("<div>");
				$div.append($("<span>").html(item.match));
				if (item.state != 'active') {
					$div.append(" ").append($("<span class='ua-note'>").text(
						item.state == 'draft' ?
						$.usosCore.langSelect("(kopia robocza)", "(draft)") :
						$.usosCore.langSelect("(przestarzały)", "(obsolete)")
					));
				}
				return $div;
			},
			tagRenderer: function(item) {
				return $('<span>')
					.text(item.name)
					.css({
						'white-space': 'nowrap',
						'display': 'inline-block',
						'overflow': 'hidden',
						'max-width': '250px',
						'text-overflow': 'ellipsis'
					})
					.click(function() {
						var url = $.usosEntity.url('entity/slips/template', item.id);
						if (!url) {
							return;
						}
						var msg = $.usosCore.langSelect(
							"Przejść do strony szablonu \"" + item.name + "\"?",
							"Go to the \"" + item.name + "\" template page?"
						);
						if (confirm(msg)) {
							document.location = url;
						}
					});
			}
		};
	};

	var init = function(options) {
		return this.each(function() {
			var $this = $(this);
			
			/* Check if previously initialized. */
			
			if ($this.data(NS)) {
				$this.usosSelector('destroy');
			}
			
			/* Load settings, override with options. */
			
			var mydata = {};
			$this.data(NS, mydata);
			mydata.settings = $.extend({}, {
				entity: null,
				sourceId: "default",
				width: "300px",
				multi: false,
				value: null
			}, options);
			
			/* Load entity-specific setup options. */
			
			if (mydata.settings.entity == 'user') {
				$.extend(mydata.settings, _entitySetup_user(mydata.settings));
			} else if (mydata.settings.entity == 'course') {
				$.extend(mydata.settings, _entitySetup_course(mydata.settings));
			} else if (mydata.settings.entity == 'faculty') {
				$.extend(mydata.settings, _entitySetup_faculty(mydata.settings));
			} else if (mydata.settings.entity == 'slip_template') {
				$.extend(mydata.settings, _entitySetup_slip_template(mydata.settings));
			} else {
				throw("Unknown entity: " + mydata.settings.entity);
			}
			
			_internalInit.apply(this);
		});
	};
	
	/**
	 * Get the list of IDs of currently selected items.
	 */
	var _getIds = function(mydata) {
		var keys = [];
		$.each(mydata.$textarea.textext()[0].tags().tagElements(), function(_, element) {
			keys.push(mydata.settings.idExtractor($(element).data(NS)));
		});
		return keys;
	};
	
	/**
	 * Set the list of currently selected IDs. This will usually trigger an AJAX call
	 * to retrieve the items for the given IDs.
	 */
	var _setIds = function(mydata, ids) {
			
		/* Temporarily disable all the input (until we finish loading). */
		
		var previousDisabledState = mydata.$textarea.prop("disabled");
		mydata.$textarea.prop("disabled", true);
		
		/* This is the function we're going to call after we have all the ids loaded
		 * (into the knownItems dictionary). */
		
		var continuation = function() {
			$.each(_getIds(mydata), function(_, id) {
				mydata.$textarea.textext()[0].tags().removeTag(id);
			});
			var validIds = ids.filter(function(id) {
				return typeof mydata.knownItems[id] !== 'undefined';
			});
			mydata.$textarea.textext()[0].tags().addTags(validIds);
			mydata.$textarea.prop("disabled", previousDisabledState);
			if (validIds.length < ids.length) {
				mydata.$textarea.usosOverlays("showContextMessage", {
					type: "error",
					message: $.usosCore.langSelect(
						"Wystąpił błąd podczas wczytywania wartości tego pola. Sprawdź, czy pole " +
						"zawiera pożądaną wartość. Jeśli problem będzie się powtarzał, proszę " +
						"skontaktować się z administratorem.",
						
						"Error occured while loading values for this form field. Check if the field " +
						"has the proper value. If this problem persists, please contact the administrator."
					)
				});
			}
		};
		
		/* Compute the set of unknown IDs. */
		
		var unknownIds = ids.filter(function(id) {
			return typeof mydata.knownItems[id] === 'undefined';
		});
		
		/* If not empty, make an AJAX call to retrieve the missing items. */
		
		if (unknownIds.length > 0) {
			mydata.$root.usosOverlays('progressIndicator', {
				state: 'loading'
			});
			$.usosCore.usosapiFetch({
				sourceId: mydata.settings.sourceId,
				method: mydata.settings.get.method,
				params: mydata.settings.get.paramsProvider(unknownIds),
				success: function(data) {
					mydata.$root.usosOverlays('progressIndicator', 'hide');
					$.each(mydata.settings.get.itemsExtractor(data), function(_, item) {
						var id = mydata.settings.idExtractor(item);
						mydata.knownItems[id] = item;
					});
					continuation();
				},
				error: function(xhr, errorCode, errorMessage) {
					mydata.$textarea.usosOverlays("showContextMessage", {
						type: "error",
						message: $.usosCore.langSelect(
							"Wystąpił błąd podczas wczytywania wartości tego pola. Spróbuj " +
							"odświeżyć stronę (F5).",
							"Error occured while loading values for this form field. Try to " +
							"refresh the page (F5)."
						)
					});
				}
			});
		} else {
			continuation();
		}
	};
	
	/**
	 * Multipurpose function. When called with no arguments, it returns the ID
	 * of currently selected item (or IDs, when initialized with 'multi' set to true).
	 * When called with an argument, it sets the given ID (or IDs) to the matched
	 * elements.
	 */
	var valueFunc = function(val) {
		
		var retval = (typeof val === 'undefined') ? null : this;
		
		this.each(function() {
			
			var $this = $(this);
			var mydata = $this.data(NS);
			
			/* getter */
			if (typeof val === 'undefined') {
				var values = _getIds(mydata);
				if (mydata.settings.multi) {
					retval = values;
				} else if (values.length === 0) {
					retval = null;
				} else {
					retval = values[0];
				}
				return false;  /* breaks the each loop */
			}
			
			/* setter */
			if (mydata.settings.multi) {
				_setIds(mydata, val);
			} else if (val === null) {
				_setIds(mydata, []);
			} else {
				_setIds(mydata, [val]);
			}
		});
		
		return retval;
	};
	
	/**
	 * Release all handles and unbind all events.
	 */
	var destroy = function() {
		return this.each(function() {
			var $this = $(this);
			var mydata = $this.data(NS);
			mydata.$root.find("*").addBack().unbind();
			mydata.$root.remove();
			$this.removeData(NS);
		});
	};
	
	var PUBLIC = {
		'init': init,
		'value': valueFunc,
		'destroy': destroy
	};

	$.fn.usosSelector = function(method) {
		if (PUBLIC[method]) {
			return PUBLIC[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if ((typeof method === 'object') || (!method)) {
			return init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.' + NS);
		}
	};
	
})(jQuery);
