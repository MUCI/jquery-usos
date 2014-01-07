(function($) {
	
	"use strict";
	
	$.widget('usosWidgets.usosTip', {
		options: {
			content: "",
			position: "top",
			delayed: false,
			type: "default",
			_autoWidth: true
		},
		widgetEventPrefix: "usostip:",
		defaultElement: "<span>",
		
		_create: function() {
			
			var widget = this;

			var content = null;
			var contentProvider = null;
			if (typeof widget.options.content === 'function') {
				content = $.usosCore.lang("Wczytywanie...", "Loading...");
				contentProvider = widget.options.content;
			} else {
				content = widget.options.content;
			}
			var theme = "ua-tooltip ";
			var offsetX = 0;
			var offsetY = 0;
			if (widget.options.type == "tool") {
				theme += "ua-tooltip-tool";
				if (widget.options.position == "left" || widget.options.position == "right") {
					offsetX = -4;
				} else {
					offsetY = -4;
				}
			} else {
				theme += "ua-tooltip-default";
			}
			widget.element.tooltipster({
				content: $.usosUtils._tooltipster_html(content, widget.options._autoWidth),
				onlyOne: false,
				delay: widget.options.delayed ? 500 : (contentProvider ? 200 : 50),
				speed: 0,
				position: widget.options.position,
				offsetX: offsetX,
				offsetY: offsetY,
				updateAnimation: false,
				theme: theme,
				functionReady: function() {
					if (contentProvider === null) {
						return;
					}
					var promise = contentProvider.apply(widget.element);
					contentProvider = null;  // so it will get called once only
					promise.done(function(obj) {
						widget.element.tooltipster('update', $.usosUtils._tooltipster_html(obj, widget.options._autoWidth));
					}).fail(function() {
						var content = $.usosCore.lang(
							"Nie udało się załadować treści podpowiedzi. " +
							"Odśwież stronę i spróbuj ponownie.",
							"Could not load the content of the tip. " +
							"Refresh the page and try again."
						);
						widget.element.tooltipster('update', $.usosUtils._tooltipster_html(content));
					});
				}
			});
			widget.element.attr("tabindex", 0);
			widget._on(widget.element, {
				focus: function() { widget.element.tooltipster('show'); },
				blur: function() { widget.element.tooltipster('hide'); }
			});
		},
		
		_setOption: function(key, value) {
			var widget = this;
			this._super(key, value);
			if (key == 'content') {
				widget.element.tooltipster(
					'update',
					$.usosUtils._tooltipster_html(widget.options.content, widget.options._autoWidth)
				);
			}
			return widget;
		},
				
		_destroy: function() {
			this.element.tooltipster('destroy');
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
		
		return $("<div class='ua-tip'><div/></div>").usosTip(arguments[0]);
	};
	$.usosWidgets.usosTip.create = create;
	
})(jQuery);
