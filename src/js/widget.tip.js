(function($) {

    "use strict";

    var closeableTips = [];

    /*
     * Hides all tooltips on page except for one and resets
     * persistence state for all tooltips.
     */
    function hideAllTipsExcept(except, resetPersistence) {
        closeableTips.forEach (function(widget) {
            if (widget !== except) {
                widget.element.tooltipster('hide');
                if (resetPersistence === true) {
                    widget._persistent = false;
                }
            }
        });
    }

    $(window).on('click', function() {
        hideAllTipsExcept(null, true);
    });

    var isTouchDevice = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));

    $.widget('usosWidgets.usosTip', {
        options: {
            content: "",
            position: "top",
            delayed: false,
            type: "default",
            showAs: "auto",
            _autoWidth: true
        },
        widgetEventPrefix: "usostip:",
        defaultElement: "<span>",

        /*
         * A persistent tooltip is a tooltip shown on click (not on hover). It has
         * "empty" mouseleave listener (useful with touchscreens when there is none).
         */
        _persistent: false,

        _showOnHover: null,
        _userContent: null,
        _created: false,

        _create: function() {
            var widget = this;

            if (
                (widget.element.prop('tagName').toLowerCase() == 'img')
                && (!widget.element.attr('alt'))
            ) {
                widget.element.attr('alt', $.usosCore.lang('Podpowiedź', 'Tip'));
            }

            /* Lazy initialization. */

            widget.element.attr("tabindex", 0);
            widget.element.one("mouseover focus touchstart", function() {
                widget._create2();
            });
        },

        _create2: function() {

            var widget = this;

            if (widget._created) {
                return;
            }
            widget._created = true;

            var tooltipContent = null;
            var contentProvider = null;
            if (typeof widget.options.content === 'function') {
                tooltipContent = $.usosCore.lang("Wczytywanie...", "Loading...");
                contentProvider = widget.options.content;
            } else {
                widget._userContent = widget.options.content;
                tooltipContent = widget._decideTooltipContent();
            }
            var theme = "ua-container ua-tooltip ";
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
                /*
                 * Important for custom tooltip behavior handling.
                 */
                trigger: 'custom',

                content: $.usosUtils._tooltipster_html(tooltipContent, widget.options._autoWidth),
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
                        widget._userContent = obj;
                        var tooltipContent = widget._decideTooltipContent();
                        widget.element.tooltipster('content', $.usosUtils._tooltipster_html(tooltipContent, widget.options._autoWidth));
                    }).fail(function() {
                        var tmp = $.usosCore.lang(
                            "Nie udało się załadować treści podpowiedzi. " +
                            "Odśwież stronę i spróbuj ponownie.",
                            "Could not load the content of the tip. " +
                            "Refresh the page and try again."
                        );
                        widget.element.tooltipster('content', $.usosUtils._tooltipster_html(tmp));
                    });
                }
            });

            closeableTips.push(widget);

            widget._on(widget.element, {
                mouseleave: function(e) {
                    if(widget._persistent) {
                        return;
                    }
                    widget.element.tooltipster('hide');
                },
                mouseenter: function(e) {
                    e.stopPropagation();
                    hideAllTipsExcept(widget);
                    widget.element.tooltipster('show');
                },
                focus: function() {
                    hideAllTipsExcept(widget);
                    widget.element.tooltipster('show');
                },
                blur: function() { widget.element.tooltipster('hide'); },
                click: function(e, extra) {

                    widget._persistent = true;
                    hideAllTipsExcept(widget, true);
                    e.stopPropagation();

                    if (isTouchDevice) {
                        widget.element.tooltipster('show');
                    }

                    if (widget._showOnHover) {
                        return;
                    }

                    if (!extra || (!extra.fromKeypress)) {
                        widget.element.trigger('blur');
                    }

                    widget._showDialog();
                },
                keypress: function(e) {

                    var key = e.keyCode || e.which;

                    if (key == 13 || key == 32) {
                        /* Ignore all keypresses other than space and enter */
                        e.preventDefault();
                        e.stopPropagation();
                        widget.element.trigger("click", [{fromKeypress: true}]);
                    }
                }
            });
            widget.element.tooltipster('show');
        },

        _showDialog: function() {
            var widget = this;
            var wrapper = $("<div class='ua-paragraphs'>")
                .html($.usosUtils._tooltipster_html(widget._userContent, false))
                .css({
                    width: "600px",
                    "overflow-y": "scroll"
                });
            wrapper.dialog({
                dialogClass: "ua-panic-dialog",
                resizable: false,
                modal: true,
                width: "600px",
                height: 400,
                closeText: $.usosCore.lang("Zamknij", "Close"),
                open: function(event, ui) {
                    $('.ui-widget-overlay')
                        .on('click', function() {
                            $(this).siblings('.ui-dialog').find('.ui-dialog-content').dialog('close');
                        });
                }
            });
        },

        _decideTooltipContent: function() {

            var widget = this;
            var userContent = widget._userContent;

            widget._showOnHover = function() {
                if (widget.options.type != 'default') {

                    /* We don't want this behavior with tool-type tips. This
                     * is mentioned in the docs too. */

                    return true;
                }

                var value = widget.options.showAs;


                if (value == "tooltip") {
                    return true;
                } else if (value == "dialog") {
                    return false;
                }

                if (value != "auto") {
                    $.usosCore._console.warn("Invalid value for showAs:", value);
                }

                return ($.usosUtils._tooltipster_html(userContent, false).text().length < 1300);
            }();

            var tooltipContent;

            if (widget._showOnHover) {
                tooltipContent = userContent;
                var currentCursor = widget.element.css("cursor");
                if (currentCursor == "auto" || currentCursor == "text") {
                    widget.element.css("cursor", "default");
                }
            } else {
                tooltipContent = (
                    "<span class='ua-icon ua-icon-16 ua-icon-inline ua-icon-blue-prefix ua-icon-forward'></span>" +
                    $.usosCore.lang("Kliknij, aby otworzyć...", "Click to open...")
                );
                widget.element.css("cursor", "pointer");
            }
            return tooltipContent;
        },

        _setOption: function(key, value) {
            var widget = this;
            this._super(key, value);
            if (key == 'content') {
                widget._contentUpdate(
                    $.usosUtils._tooltipster_html(widget.options.content, widget.options._autoWidth)
                );
            }
            return widget;
        },

        _destroy: function() {
            this.element.tooltipster('destroy');
            this.element.removeAttr("tabindex");
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
