(function($) {

    "use strict";

    $.widget('usosWidgets.usosSelectbox', $.usosWidgets._usosValue, {
        options: {
            width: "300px",
            value: '',
            options: []  // list of value+caption dictionaries.
        },
        widgetEventPrefix: "usosselectbox:",

        /**
         * @memberOf $.usosWidgets.usosSelectbox
         */
        _init: function() {
            var widget = this;
            widget._super("_init");
            widget._build();
            widget._postInit();
        },

        _createOption: function(value, text, selected) {
            var option = $("<option>")
                .text($.usosCore.lang(text));
            if (typeof value === "string") {
                option.attr('value', value);
            } else {
                // For non-string values
                option.attr('value', "(complex)"); // useful when debugging
                option.data('value', value);
            }
            if (selected) {
                option.prop('selected', true);
            }
            option.addClass((value === null) ? "ua-null-value" : "ua-nonnull-value");
            return option;
        },

        _getOptionValue: function(option) {
            if ($(option).data('value') !== undefined) {
                // For non-string values
                return $(option).data('value');
            } else {
                return $(option).attr('value');
            }
        },

        _getSelectValue: function() {
            var selected = this.element.find('select option:selected');
            if (selected.length > 0) {
                return this._getOptionValue(selected);
            } else {
                return null;
            }
        },

        _refreshClass: function() {
            var widget = this;
            var select = widget.element.find('select');
            if (widget.options.value === null) {
                select.addClass("ua-null-selected");
            } else {
                select.removeClass("ua-null-selected");
            }
        },

        _build: function() {
            var widget = this;
            widget.element
                .empty()
                .append($("<select class='ua-form'>")
                    .css('width', widget.options.width)
                );
            var val = widget.value();
            var select = widget.element.find('select');
            $.each(widget.options.options, function(_, data) {
                select.append(widget._createOption(
                    data.value, data.caption, val === data.value
                ));
            });
            widget._refreshClass();
            select.on("change", function(e) {
                widget.options.value = widget._getSelectValue();
                widget._refreshClass();
                widget._trigger("change", e);
            });
        },

        _setOption: function(key, value) {
            this._super(key, value);
            var widget = this;
            if ($.inArray(key, ['width', 'options']) !== -1) {
                widget._build();
            } else if (key == 'value') {
                widget.element.find('select').val(value);
                if (widget._getSelectValue() !== value) {
                    $.each(widget.element.find('select option'), function(_, option) {
                        if (widget._getOptionValue(option) === value) {
                            option.prop("selected", true);
                            return false; // break
                        }
                    });
                }
            }
            return this;
        },

        _destroy: function() {
            this.element.empty();
            this._super("_destroy");
        }
    });

})(jQuery);
