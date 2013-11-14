(function($) {
	
	"use strict";

	var _entities = null;
	var _getEntitySetup = function(entity) {
		if (_entities === null) {
			_entities = {
				'entity/users/user': {
					prompt: $.usosCore.lang("Wpisz imię i nazwisko", "Enter the user's name"),
					search: {
						method: 'services/users/search',
						paramsProvider: function(query) {
							return {
								'name': query,
								'num': 4
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
									$.usosCore._console.warn("User " + user_id + " not found! Will be skipped!");
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
						var $div = $(
							"<div class='ua-usersuggestion'><table><tr>" +
							"<td class='ua-td1'><img/></td>" +
							"<td class='ua-td2'><div class='ua-match'></div><div class='ua-tagline'></div></td>" +
							"</tr></table></div>"
						);
						$div.find(".ua-match").html(item.match);
						$div.find("img").attr("src", $.usosCore._userPhotoUrl(item.user_id || item.id));
						$.each(item.active_employment_functions, function(_, f) {
							$div.find(".ua-tagline")
								.append($("<span class='ua-note'>")
									.text(
										$.usosCore.lang(f['function']) +
										" (" + $.usosCore.lang(f.faculty.name) + ")"
									)
								)
								.append(" ");
						});
						$.each(item.active_student_programmes, function(_, f) {
							$div.find(".ua-tagline")
								.append($("<span class='ua-note'>")
									.text($.usosCore.lang(f.programme.description))
								)
								.append(" ");
						});
						$div.usosBadge({
							entity: 'entity/users/user',
							user_id: item.user_id || item.id
						});
						return $div;
					},
					tagRenderer: function(item) {
						/* 'search' method returns 'match', 'users' method returns first_name and last_name. */
						var label;
						if (item.match) {
							label = $("<span>").html(item.match).text();
						} else {
							label = item.first_name + " " + item.last_name;
						}
						return $("<span>")
							.text(label)
							.usosBadge({
								entity: 'entity/users/user',
								user_id: item.user_id || item.id,
								position: "top"
							});
					}
				},
				
				'entity/courses/course': {
					prompt: $.usosCore.lang("Wpisz nazwę przedmiotu", "Enter a course name"),
					search: {
						method: 'services/courses/search',
						paramsProvider: function(query) {
							return {
								'lang': $.usosCore.lang(),
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
									$.usosCore._console.warn("Course " + course_id + " not found! Will be skipped!");
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
							name = $.usosCore.lang(item.name);
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
				},
				
				'entity/fac/faculty': {
					prompt: $.usosCore.lang("Wpisz nazwę jednostki", "Enter a faculty name"),
					search: {
						method: 'services/fac/search',
						paramsProvider: function(query) {
							return {
								'lang': $.usosCore.lang(),
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
									$.usosCore._console.warn("Faculty " + fac_id + " not found! Will be skipped!");
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
						var div = $("<div>");
						div.html(item.match);
						div.usosBadge({
							entity: 'entity/fac/faculty',
							fac_id: item.fac_id || item.id
						});
						return div;
					},
					tagRenderer: function(item) {
						
						/* Both methods have the "name" field. */
						
						var name = $.usosCore.lang(item.name);
						
						/* Return in a block with decent max-width applied. */
						
						return $('<span>')
							.text(name)
							.css({
								'white-space': 'nowrap',
								'display': 'inline-block',
								'overflow': 'hidden',
								'max-width': '250px',
								'text-overflow': 'ellipsis'
							})
							.usosBadge({
								entity: 'entity/fac/faculty',
								fac_id: item.fac_id || item.id,
								position: "top"
							});
					}
				},
				
				'entity/slips/template': {
					prompt: $.usosCore.lang("Wpisz nazwę szablonu obiegówki", "Enter a slip template name"),
					search: {
						method: 'services/slips/search_templates',
						paramsProvider: function(query) {
							return {
								'langpref': $.usosCore.lang(),
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
									$.usosCore._console.warn("Template " + tpl_id + " not found! Will be skipped!");
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
								$.usosCore.lang("(kopia robocza)", "(draft)") :
								$.usosCore.lang("(przestarzały)", "(obsolete)")
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
								var msg = $.usosCore.lang(
									"Przejść do strony szablonu \"" + item.name + "\"?",
									"Go to the \"" + item.name + "\" template page?"
								);
								if (confirm(msg)) {
									document.location = url;
								}
							});
					}
				}
			};
		}
		
		if (!(entity in _entities)) {
			throw "Unknown entity: " + entity;
		}
		return _entities[entity];
	}
	
	/** Return true if two values are equal. */
	var _isEqual = function(va, vb) {
		return JSON.stringify(va) == JSON.stringify(vb);
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
	
	$.widget('usosWidgets.usosSelector', $.usosWidgets._usosValue, {
		options: {
			entity: null,
			source_id: "default",
			width: "300px",
			multi: false,
			value: null,
			searchParams: {}
		},
		widgetEventPrefix: "usosselector:",
		
		/**
		 * @memberOf $.usosWidgets.usosSelector
		 */
		_init: function() {
			this._super("_init");
			this._recreate();
		},
		
		_setOption: function(key, value) {
			this._super(key, value);
			if ($.inArray(key, ['entity', 'width', 'multi']) !== -1) {
				this._recreate();
			} else if (key == 'value') {
				this.value(key, value);
			}
			return this;
		},
		
		_recreate: function() {
			
			this._entitySetup = _getEntitySetup(this.options.entity);
			this._knownItems = {};
			
			/* Create UI elements. */
			
			this.element
				.empty()
				.addClass("ua-container ua-selector")
				.css("width", this.options.width)
				.append($("<textarea>")
					.attr("rows", "1")
					.css("width", this.options.width)
				);
			
			/* This is used by usosapiFetch for synchronizing suggestion requests. */
			
			this._suggestionsSyncObject = {};
			
			/* This is used for publishing the 'change' event. */
			
			this._previousValue = this.options.multi ? [] : null;
			
			/* Discover, bind and extend key UI elements. */
			
			this._textarea = this.element.find("textarea");
			var distanceToTop = this.element.offset().top;
			var distanceToBottom = $(document).height() - (
				this.element.offset().top + this.element.height()
			);
			var widget = this;
			
			widget._textarea
				.textext({
					plugins: 'autocomplete tags focus prompt',
					prompt: widget._entitySetup.prompt,
					autocomplete: {
						dropdown: {
							maxHeight: "250px",
							position:
								(distanceToBottom > 200) ? "below" :
								((distanceToTop > distanceToBottom) ? "above" : "below")
						},
						render: function(suggestion) {
							var $span = $('<span>')
								.html(widget._entitySetup.suggestionRenderer(
									widget._knownItems[suggestion]
								));
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
									.html(widget._entitySetup.tagRenderer(
										widget._knownItems[tag]
									));
								node.data(widget.widgetFullName, widget._knownItems[tag]);
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
								source_id: widget.options.source_id,
								method: widget._entitySetup.search.method,
								params: $.extend(
									{},
									widget.options.searchParams,
									widget._entitySetup.search.paramsProvider(query)
								),
								syncMode: 'receiveIncrementalFast',
								syncObject: widget._suggestionsSyncObject,
								success: function(data) {
									var keys = [];
									$.each(widget._entitySetup.search.itemsExtractor(data), function(_, item) {
										var id = widget._entitySetup.idExtractor(item);
										widget._knownItems[id] = item;
										keys.push(id);
									});
									$self.trigger('setSuggestions', { result: keys });
								},
								error: function(xhr, errorCode, errorMessage) {
									widget._textarea.usosNotice({
										content: $.usosCore.lang(
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
					if (!widget._knownItems[data.tag]) {
						widget._textarea.usosNotice({
							content: $.usosCore.lang(
								"Przed wciśnięciem Enter należy poczekać na załadowanie listy sugestii.",
								"Before pressing Enter, you should wait until the suggestions show up."
							)
						});
						data.result = false;
						return;
					}
					var values = widget._getIds();
					if ((!widget.options.multi) && (values.length > 0)) {
						widget._setIds([]);
						return;
					}
					if (widget.options.multi && $.inArray(data.tag, values) !== -1) {
						widget._textarea.usosNotice({
							content: $.usosCore.lang(
								"Ta pozycja już znajduje się na liście.",
								"This item is already on the list."
							)
						});
						data.result = false;
						return;
					}
				})
				.bind('setFormData', function() {
					var currentValue = widget.element.usosSelector('value');
					widget.options.value = currentValue;
					if (!widget.options.multi) {
						if (currentValue === null) {
							widget._markUnfilled();
						} else {
							widget._markFilled();
						}
					}
					if (!_isEqual(currentValue, widget._previousValue)) {
						widget._previousValue = currentValue;
						widget._trigger('change');
					}
				});
			
			if (widget.options.value) {
				widget.element.usosSelector('value', widget.options.value);
			}
		},
		
		/**
		 * Give our component a "filled" look. This is used, when 'multi' is false,
		 * and there is one selected ID present.
		 */
		_markFilled: function() {
			this.element.addClass("ua-filled");
		},
		
		/**
		 * Remove the "filled" look and feel (previously applied with _markFilled).
		 */
		_markUnfilled: function() {
			this.element.removeClass("ua-filled");
		},
		
		/**
		 * Get the list of IDs of currently selected items.
		 */
		_getIds: function() {
			var keys = [];
			var widget = this;
			$.each(widget._textarea.textext()[0].tags().tagElements(), function(_, element) {
				keys.push(widget._entitySetup.idExtractor($(element).data(widget.widgetFullName)));
			});
			return keys;
		},
		

		/**
		 * Set the list of currently selected IDs. This will usually trigger an AJAX call
		 * to retrieve the items for the given IDs.
		 */
		_setIds: function(ids) {
			
			var widget = this;
			
			/* Temporarily disable all the input (until we finish loading). */
			
			var previousDisabledState = widget._textarea.prop("disabled");
			widget._textarea.prop("disabled", true);
			
			/* This is the function we're going to call after we have all the ids loaded
			 * (into the knownItems dictionary). */
			
			var continuation = function() {
				$.each(widget._getIds(), function(_, id) {
					widget._textarea.textext()[0].tags().removeTag(id);
				});
				var validIds = ids.filter(function(id) {
					return typeof widget._knownItems[id] !== 'undefined';
				});
				widget._textarea.textext()[0].tags().addTags(validIds);
				widget._textarea.prop("disabled", previousDisabledState);
				if (validIds.length < ids.length) {
					widget._textarea.usosNotice({
						content: $.usosCore.lang(
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
				return typeof widget._knownItems[id] === 'undefined';
			});
			
			/* If not empty, make an AJAX call to retrieve the missing items. */
			
			if (unknownIds.length > 0) {
				widget.element.usosProgressOverlay();
				$.usosCore.usosapiFetch({
					source_id: widget.options.source_id,
					method: widget._entitySetup.get.method,
					params: widget._entitySetup.get.paramsProvider(unknownIds),
					success: function(data) {
						widget.element.usosProgressOverlay('destroy');
						$.each(widget._entitySetup.get.itemsExtractor(data), function(_, item) {
							var id = widget._entitySetup.idExtractor(item);
							widget._knownItems[id] = item;
						});
						continuation();
					},
					error: function(xhr, errorCode, errorMessage) {
						widget._textarea.usosNotice({
							content: $.usosCore.lang(
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
		},
		
		value: function(val) {
			
			/* getter */
			if (typeof val === 'undefined') {
				var values = this._getIds();
				if (this.options.multi) {
					return values;
				} else if (values.length === 0) {
					return null;
				} else {
					return values[0];
				}
			}
			
			/* setter */
			if (this.options.multi) {
				this._setIds(val);
			} else if (val === null) {
				this._setIds([]);
			} else {
				this._setIds([val]);
			}
			
			return this;
		},
		
		_destroy: function() {
			this.element.empty();
			this._super("_destroy");
		}
	});
	
})(jQuery);
