(function($) {
	
	"use strict";

	$.widget('usosWidgets._usosBadge', {
		options: {
			'entity': null,
			'position': "right"
		},
		
		_create: function() {
			this.element.data("usosBadge", this);
		},

		_destroy: function() {
		},
		
	});
	
})(jQuery);
