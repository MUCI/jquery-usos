(function($) {
	
	"use strict";
	
	var NS = "usosForms";
	
	var FN = {
		
		hideErrors: $.usosCore._methodForwarder("usosValue", "_hideErrors", "setter"),
		
		/**
		 * @memberOf $.fn.usosForms
		 */
		showErrors: function(response) {
			if ((!response) || (!response.user_messages)) {
				$.usosCore.panic(response);
				return false;
			}
			var fieldMessages = response.user_messages.fields;
			if (!fieldMessages) {
				$.usosCore.panic(response);
				return false;
			}
			
			/* todo - a dictionary of all error keys to be displayed. */
			
			var todo = $.extend({}, response.user_messages.fields);
			
			/* Keep finding widgets for all the keys and remove the matched
			 * keys from the todo list. */
			
			this.each(function() {
				var matched = $(this).data('usosValue')._showErrors(response);
				$.each(matched, function(_, key) {
					delete todo[key];
				});
			});
			
			var len = 0;
			$.each(todo, function() { len++; });
			if (len === 0) {
				/* All errors were shown in proper places. */
				return true;
			}
			
			/* Some errors were NOT shown. Hide all the errors which WERE shown,
			 * display the panic screen and return false. */
			
			if ($.usosCore._getSettings().debug) {
				$.usosCore._console.warn(
					"showErrors: failed to match some fields. Will resolve to $.usosCore.panic. " +
					"The following keys:", todo, "were not found in", this
				);
			}
			
			this.usosForms('hideErrors');
			$.usosCore.panic(response);
			return false;
		},
		
		flatValues: function() {
			
			/* getter only */
			
			var results = {};
			this.each(function() {
				$.each($(this).data("usosValue")._flatValues(), function(key, value) {
					results[key] = value;
				});
			});
			return results;
		},
		
		values: function() {
			
			/* getter */
			if (arguments.length == 0) {
				var results = {};
				this.each(function() {
					var input = $(this).data("usosValue");
					results[input.options.name] = input.value();
				});
				return results;
			}
			
			/* setter */
			var vals = arguments[0];
			this.each(function() {
				var input = $(this).data("usosValue");
				if (vals[input.options.name] !== undefined) {
					input.value(vals[input.options.name]);
				}
			});
			return this;
		},
		
		findValueWidgets: function() {
			var inputs = this.find(".ua-usosvalue").addBack(".ua-usosvalue");
			var isContained = function() {
				return inputs.has(this).length > 0;
			};
			return inputs.not(isContained);
		}
	};
	
	$.fn[NS] = function(method) {
		if (FN[method]) {
			return FN[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.' + NS);
		}
	};
	
})(jQuery);
