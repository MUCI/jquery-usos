(function($) {
	
	"use strict";
	
	var NS = "usosTip";
	
	var create = function() {
		
		if (arguments.length == 1) {
			if (arguments[0] instanceof $) {
				/* create(jQuery_object) */
				return create({
					content: arguments[0]
				});
			} else if (typeof arguments[0].content !== 'undefined') {
				
				/* Fall out of the if block! */
				
			} else if (
				(typeof arguments[0].pl !== 'undefined')
				|| (typeof arguments[0].en !== 'undefined')
			) {
				/* create(langdict) */
				return create({
					content: arguments[0]
				});
			} else {
				/* create(string) */
				return create(arguments[0], arguments[0]);
			}
		} else if (arguments.length == 2) {
			/* create(pl, en) */
			return create({
				content: {
					pl: arguments[0],
					en: arguments[1]
				}
			});
		} else {
			throw("Invalid arguments");
		}

		var $this = $("<div class='ua-tip'><div/></div>");

		var mydata = {};
		$this.data(NS, mydata);
		mydata.settings = $.extend({}, {
			content: null,
			position: "top"
		}, arguments[0]);
		
		var content = null;
		var contentProvider = null;
		if (typeof mydata.settings.content === 'function') {
			content = $.usosCore.lang("Wczytywanie...", "Loading...");
			contentProvider = mydata.settings.content;
		} else {
			content = mydata.settings.content;
		}
		mydata.$img = $this.find('div');
		mydata.$img
			.tooltipster({
				content: $.usosUtils._tooltipster_html(content),
				onlyOne: false,
				delay: contentProvider ? 200 : 0,
				speed: 0,
				position: mydata.settings.position,
				theme: "ua-tooltip ua-tooltip-info",
				functionReady: function() {
					if (contentProvider === null) {
						return;
					}
					var promise = contentProvider.apply($this);
					contentProvider = null;  // so it will get called once only
					promise.done(function(obj) {
						mydata.$img.tooltipster('update', $.usosUtils._tooltipster_html(obj));
					}).fail(function() {
						var content = $.usosCore.lang(
							"Nie udało się załadować treści podpowiedzi. " +
							"Odśwież stronę i spróbuj ponownie.",
							"Could not load the content of the tip. " +
							"Refresh the page and try again."
						);
						mydata.$img.tooltipster('update', $.usosUtils._tooltipster_html(content));
					});
				}
			})
			.attr("tabindex", 0)
			.focus(function() {
				$(this).tooltipster('show');
			})
			.blur(function() {
				$(this).tooltipster('hide');
			});
		
		return $this;
	};
	
	/* Static methods. */
	
	$.usosTip = {
		create: create
	};
	
})(jQuery);
