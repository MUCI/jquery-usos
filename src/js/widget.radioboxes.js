(function($) {

    "use strict";

    var counter = 1;

    $.widget('usosWidgets.usosRadioboxes', $.usosWidgets._usosValue, {
        options: {
            width: "500px",
            value: '',
            options: []  // list of value+caption dictionaries.
        },
        widgetEventPrefix: "usosradioboxes:",

        _create: function() {
            var widget = this;
            widget.uniqueName = "ua-radio-uid-" + counter++;
        },

        /**
         * @memberOf $.usosWidgets.usosRadioboxes
         */
        _init: function() {
            var widget = this;
            widget._super("_init");
            widget._build();
            widget._postInit();
        },

        _createOption: function(value, text, selected) {
            var widget = this;
            var label = $("<label>")
                .append($("<table class='ua-checkbox-or-radio'>")
                    .append($("<tr>")
                        .append($("<td>")
                            .append($("<input type='radio'>"))
                        )
                        .append($("<td>")
                            .append($.usosCore.lang(text))
                        )
                    )
                );
            var input = label.find("input");
            input.attr('name', widget.uniqueName);
            if (typeof value === "string") {
                input.attr('value', value);
            } else {
                // For non-string values
                input.attr('value', "(complex)"); // useful when debugging
                input.data('value', value);
            }
            if (selected) {
                input.attr('checked', true);
            }
            return label;
        },

        _getInputValue: function(input) {
            if ($(input).data('value') !== undefined) {
                // For non-string values
                return $(input).data('value');
            } else {
                return $(input).attr('value');
            }
        },

        _getRadiogroupValue: function() {
            var selected = this.element.find('input:checked');
            if (selected.length > 0) {
                return this._getInputValue(selected);
            } else {
                return null;
            }
        },

        _build: function() {
            var widget = this;
            widget.element
                .empty()
                .append($("<div class='ua-radiogroup'>")
                    .css('width', widget.options.width)
                );
            var val = widget.value();
            var radiogroup = widget.element.find('div.ua-radiogroup');
            $.each(widget.options.options, function(_, data) {
                radiogroup.append(widget._createOption(
                    data.value, data.caption, val === data.value
                ));
            });
            radiogroup.find('input').on("change", function(e) {
                widget.options.value = widget._getRadiogroupValue();
                widget._trigger("change", e);
            });
        },

        _setOption: function(key, value) {
            this._super(key, value);
            var widget = this;
            if ($.inArray(key, ['width', 'options']) !== -1) {
                widget._build();
            } else if (key == 'value') {
                $.each(widget.element.find('input'), function(_, option) {
                    if (widget._getInputValue(option) === value) {
                        $(option).attr("checked", true);
                        return false; // break
                    }
                });
            }
            return this;
        },

        _destroy: function() {
            this.element.empty();
            this._super("_destroy");
        }
    });

})(jQuery);
