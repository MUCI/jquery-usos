(function($) {
	
	"use strict";
	
	var NS = "usosBadge";
	
	var FN = {
		
		/* Public usosBadge methods. */
		
		destroy: $.usosCore._methodForwarder("usosBadge", "destroy", "setter")
	};
	
	var init = function(options) {
		
		/* Extract the entity code and create the proper widget
		 * based on it. */
		
		switch (options.entity) {
			case 'entity/users/user':
				this._usosUserBadge(options);
				break;
			case 'entity/fac/faculty':
				/* Ignore. Still working on this one! */
				// this._usosFacultyBadge(options);
				break;
			default:
				throw "Unknown entity: " + options.entity;
		}
		return this;
	};
	
	$.fn[NS] = function(method) {
		if (FN[method]) {
			return FN[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if ((typeof method === 'object') || (!method)) {
			return init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.' + NS);
		}
	};
	
})(jQuery);
