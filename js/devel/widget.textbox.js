(function($) {

    "use strict";

    $.widget('usosWidgets.usosTextbox', $.usosWidgets._usosValue, {
        options: {
            value: '',
            placeholder: null,
            multiline: false
        },
        widgetEventPrefix: "usostextbox:",

        /**
         * @memberOf $.usosWidgets.usosTextbox
         */
        _init: function() {
            var widget = this;
            widget._super("_init");
            widget._build();
            widget._postInit();
        },

        _build: function() {
            var widget = this;
            widget.element.empty();
            var input;
            var outerWidth;
            if (!widget.options.multiline) {
                input = $("<input type='text' class='ua-form'>");
                outerWidth = 300;
            } else {
                input = $("<textarea class='ua-form'>");
                outerWidth = 450;
            }
            widget.element.append(input);
            if (widget.options.disabled) {
                input.prop("disabled", true);
            }
            input.css("width", (outerWidth - 9) + "px"); // f93ko: 9 = padding+border
            input.val(widget.options.value);
            if (widget.options.placeholder) {
                input.attr('placeholder', $.usosCore.lang(widget.options.placeholder));
            }
            input.on("change", function(e) {
                widget.options.value = input.val();
                widget._trigger("change", e);
            });
        },

        _setOption: function(key, value) {
            this._super(key, value);
            if ($.inArray(key, ['placeholder', 'multiline']) !== -1) {
                this._build();
            } else if (key == 'value') {
                this.element.find('input, textarea').val((value === null) ? "" : value);
            }
            return this;
        },

        _destroy: function() {
            this.element.empty();
            this._super("_destroy");
        }
    });

})(jQuery);
