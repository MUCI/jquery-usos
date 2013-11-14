(function($) {
	
	"use strict";
	
	$.widget('usosWidgets._usosFacultyBadge', $.usosWidgets._usosBadge, {
		options: {
			fac_id: null
		},
		widgetEventPrefix: "usosbadge:",
		_getEntityKey: function() { return ['fac_id']; },
		_cssClass: function() { return ""; },
		
		_fetchData2: function() {
			
			var widget = this;
			
			return $.usosCore.usosapiFetch({
				method: "services/fac/faculty",
				params: {
					fac_id: widget.options.fac_id,
					fields: "id|name"
				}
			}).then(function(fac) {
				fac.stats = {};
				fac.stats.progs = 10;
				fac.stats.staff = 20;
				fac.stats.courses = 30;
				return fac;
			});
		},
		
		_createBadge: function(fac) {
			
			/* Structure */
			
			var badge = $(
				"<div class='ua-container'><div class='ua-name'></div></div>"
			);
			
			/* Name and profile link */

			badge.find('.ua-name').html($("<a>")
				.attr("href", "WRTODO")
				.text($.usosCore.lang(fac.name))
			);
			
			return badge;
		}
	});
	
})(jQuery);
