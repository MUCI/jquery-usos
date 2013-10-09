(function($) {
	
	"use strict";

	$.widget('usosWidgets.usosValue', {
		options: {
			'name': null
		},
		
		_init: function() {
			this.element.addClass("ua-usosvalue");
			this.element.data("usosValue", this);
			this.element.attr("data-name", this.options.name);
		},

		_destroy: function() {
			this._hideErrors();
			this.element.removeClass("ua-usosvalue");
		},
		
		/**
		 * Transform a value into a flattened string *or null*. Please note,
		 * that in case of more complex values, subclasses should override the
		 * flatValues method.
		 */
		_flattenValue: function(val) {
			if (typeof val === 'string') {
				return val;
			} else if ($.isArray(val)) {
				/* Assume it's an array of strings or numbers. */
				return val.join("|");
			} else if (val === null) {
				return null;
			} else if (typeof val === 'boolean') {
				return val ? "true" : "false";
			}
			throw "Internal jQuery-USOS error. Invalid value for _flattenValue.";
		},
		
		/**
		 * Override this if your input returns more complex values. The
		 * default implementation deals only with simple lists, strings and
		 * booleans. Also note, that if the value of your input is null, then
		 * by default its name won't even appear in the flat representation
		 * (if you want it to appear then its value should be set to an empty
		 * string).
		 */
		_flatValues: function() {
			var values = {};
			var val = this.value();
			if (val !== null) {
				values[this.options.name] = this._flattenValue(this.value());
			}
			return values;
		},
		
		_showErrors: function(response) {
			var message = response.user_messages.fields[this.options.name];
			if (message) {
				this._displayError(message, this.options.name);
				return [this.options.name];
			} else {
				return [];
			}
		},
		
		/**
		 * Display an error message beside a proper element identified by key.
		 * In case of most widgets (unless they override _showErrors), the key
		 * will be equal to this.options.name and can be dismissed.
		 */
		_displayError: function(message, key) {
			this.element
				.addClass("ua-error-shown")
				.usosNotice({
					content: $.usosCore.lang(message)
				});
		},
		
		/**
		 * Hide all errors previously shown by _displayError.
		 */
		_hideErrors: function() {
			this.element.find(".ua-error-shown").addBack(".ua-error-shown")
				.removeClass("ua-error-shown")
				.usosNotice("hide");
		},
		
		/**
		 * Default focus implementation in to simply focus on the first
		 * focusable element found within. Override it if it doesn't work in
		 * case of your input.
		 */
		_focus: function() {
			var elem = this.element.find("input, textarea, select, button").first();
			elem.trigger("focus");
		},
		
		focus: function() {
			if (!this.options.disabled) {
				this._focus();
			}
		},
		
		disable: function() {
			this._super("disable");
			this.element.find(".ui-button").button("option", "disabled", true);
			this.element.find("input, textarea, select, button").prop("disabled", true);
		},
		
		enable: function() {
			this._super("enable");
			this.element.find(".ui-button").button("option", "disabled", false);
			this.element.find("input, textarea, select, button").prop("disabled", false);
		},
		
		/** Public shorthand for option("value"). */
		value: function(val) {
			
			var widget = this;
			
			/* getter */
			if (typeof val === 'undefined') {
				return widget.option("value");
			}
			
			/* setter */
			widget.option("value", val);
			return this;
		}
	});
	
})(jQuery);
