(function($) {
	
	"use strict";
	
	var NS = "usosValue";
	
	var FN = {
		
		/* Public usosValue methods. */
		
		value: $.usosCore._methodForwarder("usosValue", "value", "auto"),
		enable: $.usosCore._methodForwarder("usosValue", "enable", "setter"),
		disable: $.usosCore._methodForwarder("usosValue", "disable", "setter"),
		focus: $.usosCore._methodForwarder("usosValue", "focus", "setter"),
	};
	
	$.fn[NS] = function(method) {
		if (FN[method]) {
			return FN[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.' + NS);
		}
	};
	
})(jQuery);
