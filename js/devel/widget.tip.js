(function($) {
	
	"use strict";
	
	$.widget('usosWidgets.usosTip', {
		options: {
			content: "",
			position: "top"
		},
		widgetEventPrefix: "usostip:",
		defaultElement: "<span>",
		
		_create: function() {
			
			var widget = this;
			
			widget.element.empty();
			widget.element.append($("<div class='ua-tip'><div/></div>"));

			var content = null;
			var contentProvider = null;
			if (typeof widget.options.content === 'function') {
				content = $.usosCore.lang("Wczytywanie...", "Loading...");
				contentProvider = widget.options.content;
			} else {
				content = widget.options.content;
			}
			widget.img = widget.element.find('.ua-tip div');
			widget.img.tooltipster({
				content: $.usosUtils._tooltipster_html(content),
				onlyOne: false,
				delay: contentProvider ? 200 : 50,
				speed: 0,
				position: widget.options.position,
				theme: "ua-tooltip ua-tooltip-info",
				functionReady: function() {
					if (contentProvider === null) {
						return;
					}
					var promise = contentProvider.apply(widget.element);
					contentProvider = null;  // so it will get called once only
					promise.done(function(obj) {
						widget.img.tooltipster('update', $.usosUtils._tooltipster_html(obj));
					}).fail(function() {
						var content = $.usosCore.lang(
							"Nie udało się załadować treści podpowiedzi. " +
							"Odśwież stronę i spróbuj ponownie.",
							"Could not load the content of the tip. " +
							"Refresh the page and try again."
						);
						widget.img.tooltipster('update', $.usosUtils._tooltipster_html(content));
					});
				}
			});
			widget.img.attr("tabindex", 0);
			widget._on(widget.img, {
				focus: function() { widget.img.tooltipster('show'); },
				blur: function() { widget.img.tooltipster('hide'); }
			});
		},
		
		_setOption: function(key, value) {
			var widget = this;
			this._super(key, value);
			if (key == 'content') {
				widget.img.tooltipster(
					'update',
					$.usosUtils._tooltipster_html(widget.options.content)
				);
			}
			return widget;
		},
				
		_destroy: function() {
			this.img.tooltipster('destroy');
			this.element.empty();
		}
	});
	
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
			} else if (typeof arguments[0] === 'function') {
				/* create(function) */
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
		
		return $("<span>").usosTip(arguments[0]);
	};
	$.usosWidgets.usosTip.create = create;
	
})(jQuery);
