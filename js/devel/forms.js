(function($) {
	
	"use strict";
	
	var NS = "usosForms";
	
	var _emptyWidget = function(element, name) {
		var $e = $("<" + element + " class='ua-widget'>");
		if (name) {
			$e.attr('data-fname', name);
		}
		return $e;
	};
	
	/**
	 * If 'response' contains an error for the 'key' field, then the error above
	 * the $target and return [key] (an array with a single element). If it does
	 * not, return an empty array.
	 */
	var _showErr = function(response, key, $target) {
		var errors = response.field_errors;
		var error = errors[key];
		if (error) {
			$target
				.addClass(NS + "-showErr")
				.usosNotice({
					content: $.usosCore.lang(error)
				});
			return [key];
		} else {
			return [];
		}
	};
	
	/**
	 * Each widget exposes some internal methods via its data saved in NS
	 * namespace. These are the default implementations of these methods.
	 */
	var widgetDefaultData = {
		getValue: function() {
			if ($(this).attr('data-fname')) {
				throw "Named widgets MUST implement getValue!"; 
			} else {
				throw "Calling getValue on an unnamed widget!";
			}
		},
		setValue: function() {
			if ($(this).attr('data-fname')) {
				throw "Named widgets MUST implement setValue!"; 
			} else {
				throw "Calling setValue on an unnamed widget!";
			}
		},
		getFlatValues: function() {
			var val = $(this).usosForms('value');
			if ($.isArray(val)) {
				val = val.join("|");
			} else if (val === null) {
				val = "";
			} else if (typeof val === 'boolean') {
				val = val ? "true" : "false";
			} else if (typeof val !== 'string') {
				throw "Internal error. Invalid flatValue.";
			}
			var values = {};
			values[$(this).attr('data-fname')] = val;
			return values;
		},
		showErrors: function(resp) {
			if ($(this).attr('data-fname')) {
				// $.usosCore._console.warn("Named widgets SHOULD implement showErrors!");
				return _showErr(resp, $(this).attr('data-fname'), $(this));
			} else {
				throw "Calling showErrors on an unnamed widget!";
			}
		}
	};
	
	var widgets = {
		
		/** Temporary. Undocumented. Should not be used. */
		_customWidget: function(name, data) {
			return _emptyWidget("div", name).data(NS, $.extend({}, widgetDefaultData, data));
		},
		
		label: function() {
			var getValue = function() {
				return $(this).find('div').text();
			};
			var setValue = function(value) {
				$(this).find('div').text(value);
			};
			var showErrors = function(resp) {
				return _showErr(resp, $(this).attr('data-fname'), $(this).find('span'));
			};
			return function(name) {
				
				var $div = $("<div>")
					.css("width", "auto")
					.css("max-width", "300px");
				return _emptyWidget("div", name)
					.append($div)
					.data(NS, $.extend({}, widgetDefaultData, {
						getValue: getValue,
						setValue: setValue,
						showErrors: showErrors
					}));
			};
		}(),
		
		textbox: function() {
			var getValue = function() {
				var $input = $(this).find('input, textarea');
				// $.usosCore._console.assert($input.length == 1);
				return $input.val();
			};
			var setValue = function(value) {
				$(this).find('input, textarea').val(value);
			};
			var showErrors = function(resp) {
				return _showErr(resp, $(this).attr('data-fname'), $(this).find('input, textarea'));
			};
			return function(options) {
				if (typeof options === "string") {
					/* ALIAS: textbox(name) */
					options = {name: options};
				}
				var settings = $.extend({}, {
					name: null,
					placeholder: null,
					multiline: false
				}, options);
				
				var $input;
				var outerWidth;
				if (!settings.multiline) {
					$input = $("<input type='text' class='ua-form'>");
					outerWidth = 300;
				} else {
					$input = $("<textarea class='ua-form'>");
					outerWidth = 450;
				}
				$input.css("width", (outerWidth - 9) + "px"); // f93ko: 9 = padding+border
				if (settings.placeholder) {
					$input.attr('placeholder', $.usosCore.lang(settings.placeholder));
				}
				return _emptyWidget("div", settings.name)
					.append($input)
					.data(NS, $.extend({}, widgetDefaultData, {
						getValue: getValue,
						setValue: setValue,
						showErrors: showErrors
					}));
			};
		}(),
		
		checkbox: function() {
			var getValue = function() {
				return $(this).find('input').prop('checked');
			};
			var setValue = function(value) {
				$(this).find('input').prop('checked', value);
			};
			var showErrors = function(resp) {
				return _showErr(resp, $(this).attr('data-fname'), $(this).find('label'));
			};
			return function(name, label) {
				var $content;
				if (label instanceof $) {
					$content = label;
				} else {
					$content = $("<span>").html(" " + $.usosCore.lang(label));
				}
				return _emptyWidget("div", name)
					.append($("<label>")
						.append($("<table class='ua-checkbox'>")
							.append($("<tr>")
								.append($("<td>")
									.append($("<input type='checkbox'>"))
								)
								.append($("<td>")
									.append($content)
								)
							)
						)
					)
					.data(NS, $.extend({}, widgetDefaultData, {
						getValue: getValue,
						setValue: setValue,
						showErrors: showErrors
					}));
			};
		}(),
		
		langdictbox: function() {
			var getValue = function() {
				var $textboxPL = $(this).find('.ua-lang-PL').closest(".ua-widget");
				var $textboxEN = $(this).find('.ua-lang-EN').closest(".ua-widget");
				// $.usosCore._console.assert($textboxPL.length == 1);
				// $.usosCore._console.assert($textboxEN.length == 1);
				return {
					pl: $textboxPL.usosForms('value'),
					en: $textboxEN.usosForms('value')
				};
			};
			var setValue = function(value) {
				// $.usosCore._console.assert(value && typeof value.pl !== 'undefined', "langdictbox.setValue called with non-langdict");
				// $.usosCore._console.assert($(this).find('.ua-lang-PL').closest(".ua-widget").attr('data-fname') === undefined);
				$(this).find('.ua-lang-PL').closest(".ua-widget").usosForms('value', value.pl);
				$(this).find('.ua-lang-EN').closest(".ua-widget").usosForms('value', value.en);
			};
			var getFlatValues = function() {
				var value = $(this).usosForms('value');
				// $.usosCore._console.assert(value.pl !== undefined);
				var values = {};
				var name = $(this).attr('data-fname');
				values[name + "_pl"] = value.pl;
				values[name + "_en"] = value.en;
				return values;
			};
			var showErrors = function(resp) {
				var $textboxPL = $(this).find('.ua-lang-PL').closest(".ua-widget");
				var $textboxEN = $(this).find('.ua-lang-EN').closest(".ua-widget");
				// $.usosCore._console.assert($textboxPL.length == 1);
				// $.usosCore._console.assert($textboxEN.length == 1);
				var name = $(this).attr('data-fname');
				var a = _showErr(resp, name + "_pl", $textboxPL.find('input, textarea'));
				var b = _showErr(resp, name + "_en", $textboxEN.find('input, textarea'));
				$.merge(a, b);
				return a;
			};
			var helper = function(lang, multiline) {
				var placeholder;
				if (lang == 'PL') {
					placeholder = {pl: "Po polsku", en: "In Polish"};
				} else {
					placeholder = {pl: "Po angielsku", en: "In English"};
				}
				var $div = $.usosForms.textbox({name: null, placeholder: placeholder, multiline: multiline});
				$div.find('input, textarea')
					.css("position", "relative")
					.css("z-index", "1");
				$div
					.css("position", "relative")
					.prepend($("<div class='ua-form-textbox-icon'>")
						.addClass("ua-lang-" + lang)
					);
				return $div;
			};
			return function(options) {
				if (typeof options === "string") {
					/* ALIAS: langdictbox(name) */
					options = {name: options};
				}
				var settings = $.extend({}, {
					name: null,
					multiline: false
				}, options);
				
				var $pl = helper("PL", settings.multiline);
				var $en = helper("EN", settings.multiline);
				var $div = _emptyWidget("div", settings.name)
					.append($pl)
					.append($en.css("margin-top", "5px"))
					.data(NS, $.extend({}, widgetDefaultData, {
						getValue: getValue,
						setValue: setValue,
						getFlatValues: getFlatValues,
						showErrors: showErrors
					}));
				$pl.add($en).find('input, textarea')
					.focus(function() {
						/* If either textbox is focused, unfold both language tags. */
						$pl.find('.ua-form-textbox-icon').stop(true).delay(100).animate({left: -13}, 150, 'easeOutCubic');
						$en.find('.ua-form-textbox-icon').stop(true).delay(180).animate({left: -13}, 150, 'easeOutCubic');
					})
					.blur(function() {
						$pl.find('.ua-form-textbox-icon').stop(true).delay(100).animate({left: -2}, 150, 'easeOutCubic');
						$en.find('.ua-form-textbox-icon').stop(true).delay(180).animate({left: -2}, 150, 'easeOutCubic');
					});
				return $div;
			};
		}(),
		
		tr: function() {
			var _createTipTd = function(tip) {
				var $td = $("<td>");
				if (tip) {
					$td.append($.usosWidgets.usosTip.create(tip));
				}
				return $td;
			};
			return function(options) {
				
				var settings = $.extend({}, {
					tip: null, // langdict
					title: null, // langdict
					content: null // jQuery
				}, options);
				
				return _emptyWidget("tr")
					.append(_createTipTd(settings.tip))
					.append($("<td class='ua-strong'>")
						.css("text-align", "right")
						.html(settings.title !== null ? $.usosCore.lang(settings.title) + ":" : "")
					).append($("<td>")
						.html(settings.content)
					);
			};
		}(),
		
		hr: function() {
			return _emptyWidget("hr").addClass('ua-hr');
		},
		
		selectbox: function() {
			var getValue = function() {
				return $(this).find('select').val();
			};
			var setValue = function(value) {
				$(this).find('select').val(value);
			};
			var addOptions = function(options) {
				var $select = $(this).find('select');
				$.each(options, function(value, caption) {
					$select.append($("<option>")
						.attr('value', value)
						.text($.usosCore.lang(caption))
					);
				});
			};
			var replaceOptions = function(options) {
				$(this).find('select').empty();
				$(this).usosForms('widgetCall', 'addOptions', options);
			};
			var showErrors = function(resp) {
				return _showErr(resp, $(this).attr('data-fname'), $(this).find('select'));
			};
			return function(name, options) {
				var $widget = _emptyWidget("div", name)
					.append($("<select class='ua-form'>").css('width', '300px'))
					.data(NS, $.extend({}, widgetDefaultData, {
						getValue: getValue,
						setValue: setValue,
						replaceOptions: replaceOptions,
						addOptions: addOptions,
						showErrors: showErrors
					}));
				$widget.usosForms('widgetCall', 'replaceOptions', options);
				return $widget;
			};
		}()
	};
	
	/** 
	 * Return a jQuery list of all *named* widgets in the $form. If $form is
	 * a named widget, the list will also contain the $form.
	 */
	var _findNamedWidgets = function($form) {
		return $form
			.find('.ua-widget[data-fname]')
			.addBack()
			.filter('.ua-widget[data-fname]');
	};
	
	/**
	 * Hide all errors previously displayed by showErrors.
	 */
	var hideErrors = function() {
		$(this).find('.' + NS + "-showErr")
			.removeClass(NS + "-showErr")
			.usosNotice("hide");
	};
	
		
	
	/**
	 * Add HRs between elements. Example: http://i.imgur.com/ex6BNNo.png
	 * -> http://i.imgur.com/GAf7uRQ.png
	 */
	var hrs = function() {
		return this.each(function(index) {
			if (index !== 0) {
				$(this).prepend($.usosForms.hr());
			}
		});
	};
	
	/**
	 * Get or set a value of a *single* form widget. Will work only on widget
	 * which DO have a value.
	 */
	var value = function() {
		var arg = (arguments.length > 0) ? arguments[0] : undefined;
		var value = null;
		var $this = this.each(function() {
			if (arg === undefined) {
				/* A getter. Every widget defines its own getValue func, we just
				 * need to call it. */
				value = $(this).data(NS).getValue.apply(this);
				// $.usosCore._console.assert(!(value instanceof $));
				// $.usosCore._console.assert(value !== undefined);
				return false; // break the .each loop
			} else {
				/* A setter. As above - we have the setValue function. */
				$(this).data(NS).setValue.apply(this, [arg]);
			}
		});
		if (arg === undefined) {
			return value;
		} else {
			return $this;
		}
	};
	
	/**
	 * Search for all widgets which do have a value. Return a dictionary of these
	 * values, or set values properly based on the dictionary which was passed
	 * as an argument.
	 */
	var values = function() {
		// this = a jQuery set of elements to search amongst.
		var $form = this;
		var arg = arguments.length > 0 ? arguments[0] : undefined;
		
		if (arg === undefined) {
			
			/* A getter. */
			
			var results = {};
			_findNamedWidgets($form).each(function() {
				results[$(this).attr('data-fname')] = $(this).usosForms('value');
			});
			return results;
			
		} else {
			
			/* A setter. */
			
			$.each(arg, function(key, value) {
				var $input = _findNamedWidgets($form).filter('[data-fname=' + key + ']');
				if ($input.length === 0) {
					$.usosCore._console.log("Could not find a widget named '" + key + "'");
				}
				$input.each(function() {
					$(this).usosForms('value', value);
				});
			});
		}
	};

	/**
	 * This works only as a getter. The result is similar to the one returned by
	 * "values", with one big exception - all the values are flattened to
	 * strings, so that they can be used as USOS API method parameters. One
	 * widget may produce multiple keys and values during the flattening
	 * process!
	 * 
	 * Example conversions:
	 * 
	 * "x" => "x"
	 * true => "true"
	 * null => ""
	 * [1, 2, 3] => "1|2|3"
	 * {pl: "x", en: "y"} => will be split into two separate parameters, e.g.
	 *     if the widget was named "desc", then you will get {"desc_pl": "x",
	 *     "desc_en": "y"}.
	 * 
	 * Every widget is allowed to override this mapping (by exposing the
	 * flatValues method).
	 */
	var flatValues = function() {
		var extractValues = function($e) {
			// $.usosCore._console.assert($e instanceof $);
			var data = $e.data(NS);
			if (!data.getFlatValues) {
				throw "Missing methods in widget's data!";
			}
			var values = data.getFlatValues.apply($e);
			// $.usosCore._console.assert(typeof values === "object");
			return values;
		};
		return function() {
			var results = {};
			this.each(function() {
				/* Search for widgets. */
				var $this = $(this);
				var $candidates = _findNamedWidgets($this);
				$candidates.each(function() {
					var $this = $(this);
					$.each(extractValues($this), function(key, value) {
						results[key] = value;
					});
				});
			});
			return results;
		};
	}();
	
	/** Return the internal data object of given widget. */
	var widgetCall = function(methodName) {
		var result = null;
		var args = Array.prototype.slice.call(arguments, 1);
		this.each(function() {
			/* Confirm that this is a widget. */
			var $this = $(this);
			if ($this.hasClass('ua-widget')) {
				result = $this.data(NS)[methodName].apply(this, args);
			} else {
				$.usosCore._console.error("Calling widgetCall on a non-widget!");
			}
			return false; // break the .each loop
		});
		return result;
	};
	
	/**
	 * Parse USOS API's UserForm error response, attempt to display the errors
	 * directly on the supplied form. If some errors could not be displayed,
	 * display them in a separate window.
	 */
	var showErrors = function(options) {
		
		var settings = $.extend({}, {
			/** Required. USOS API UserForm response. */
			response: null,
			/** 
			 * Optional. The form with named widgets to display the errors
			 * over.
			 */
			form: null
		}, options);

		/* todo - a dictionary of all error keys to be displayed. */
		
		var todo = $.extend({}, settings.response.field_errors);
		
		/* Keep finding widgets for all the keys and remove them from the todo
		 * list. */
		
		if (settings.form) {
			_findNamedWidgets(settings.form).each(function() {
				var done = $(this).data(NS).showErrors.apply(this, [settings.response]);
				$.each(done, function(_, key) {
					delete todo[key];
				});
			});
		}
		
		var len = 0;
		$.each(todo, function() { len++; });
		if (len === 0) {
			/* All keys were displayed. */
			return;
		}
		
		/* Some keys were NOT displayed. Display them in a separate window. */
		
		var $msg = $("<div class='ua-paragraphs ua-container'>");
		$msg.append($("<p style='font-size: 120%; margin-bottom: 15px'>")
			.append($("<b>")
				.html($.usosCore.lang(
					"Zmiany nie mogły zostać zapisane.",
					"Unable to save changes."
				))
			)
		);
		var $ul = $("<ul>");
		$msg.append($ul);
		$.each(todo, function(key, error) {
			$ul.append($("<li>").html($.usosCore.lang(error)));
		});
		$msg.append($("<p style='text-align: center; font-size: 120%; margin-top: 20px'>")
			.html($("<a class='ua-link'>")
				.html($.usosCore.lang("Zamknij", "Close"))
				.click(function() {
					$msg.dialog('close');
				})
			)
		);
		
		$msg.dialog({
			dialogClass: "ua-panic-dialog",
			resizable: false,
			modal: true,
			width: "500px",
			height: "auto",
			closeText: $.usosCore.lang("Zamknij", "Close")
		});

	};
	
	/* STATIC METHODS */
	
	$.usosForms = $.extend({}, {
		// non-widget static methods
		'showErrors': showErrors
	}, widgets);
	
	/* FN METHODS */
	
	var FN = {
		'hrs': hrs,
		'value': value,
		'values': values,
		'flatValues': flatValues,
		'hideErrors': hideErrors,
		'widgetCall': widgetCall
	};

	$.fn[NS] = function(method) {
		if (FN[method]) {
			return FN[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.' + NS);
		}
	};
	
})(jQuery);
