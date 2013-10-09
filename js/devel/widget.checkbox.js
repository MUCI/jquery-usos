(function($) {
	
	"use strict";

	$.widget('usosWidgets.usosCheckbox', $.usosWidgets.usosValue, {
		options: {
			value: false,
			caption: ""
		},
		widgetEventPrefix: "usoscheckbox:",
		
		/**
		 * @memberOf $.usosWidgets.usosCheckbox
		 */
		_init: function() {
			var widget = this;
			widget._super("_init");
			widget._build();
		},
		
		_build: function() {
			var widget = this;
			widget.element.empty();
			
			var content;
			if (widget.options.caption instanceof $) {
				content = widget.options.caption;
			} else {
				content = $("<span>").html($.usosCore.lang(widget.options.caption));
			}
			widget.element.append($("<label>")
				.append($("<table class='ua-checkbox'>")
					.append($("<tr>")
						.append($("<td>")
							.append($("<input type='checkbox'>"))
						)
						.append($("<td>")
							.append(content)
						)
					)
				)
			);
			var input = widget.element.find('input');
			if (widget.options.value) {
				input.prop('checked', true);
			}
			input.on("change", function(e) {
				widget.options.value = input.prop('checked');
				widget._trigger("change", e);
			});
		},
		
		_setOption: function(key, value) {
			this._super(key, value);
			if ($.inArray(key, ['caption']) !== -1) {
				this._build();
			} else if (key == 'value') {
				this.element.find('input').prop("checked", value ? true : false);
			}
			return this;
		},

		_destroy: function() {
			this.element.empty();
			this._super("_destroy");
		}
	});
	
})(jQuery);
