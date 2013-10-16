(function($) {
	
	"use strict";
	
	var NS = "usosValue";
	
	var FN = {
		
		/* Public usosValue methods. */
		
		value: $.usosCore._usosValueForward("value", "auto"),
		enable: $.usosCore._usosValueForward("enable", "setter"),
		disable: $.usosCore._usosValueForward("disable", "setter"),
		focus: $.usosCore._usosValueForward("focus", "setter"),
	};
	
	$.fn[NS] = function(method) {
		if (FN[method]) {
			return FN[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.' + NS);
		}
	};
	
})(jQuery);
