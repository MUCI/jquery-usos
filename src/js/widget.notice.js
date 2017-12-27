(function($) {

    "use strict";

    var _isScrolling = false;
    var _isScrolledIntoView = function(elem) {
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();
        var elemTop = $(elem).offset().top;
        var elemBottom = elemTop + $(elem).height();
        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    };

    $.widget('usosWidgets.usosNotice', {
        options: {
            content: "",
            scroll: true
        },
        widgetEventPrefix: "usosnotice:",

        _create: function() {

            var widget = this;
            widget.element.addClass("ua-usosnotice");

            /* Start creating the tooltip. When it's ready, _tooltipReady will
             * be called. */

            widget.element.tooltipster({
                trigger: 'custom',
                interactive: true,
                content: $.usosUtils._tooltipster_html(widget.options.content),
                onlyOne: false,
                position: 'right',
                theme: "ua-container ua-tooltip ua-tooltip-error",
                functionReady: function() {
                    widget._tooltipReady();
                },
                functionAfter: function() {
                    widget.destroy();
                },
                functionInit: function() {
                    // Provide compatibility with the Tooltipster API that does not provide tooltipster attribute
                    widget.element.data('tooltipster', widget.element);
                }
            });

            /* We want to hide the tooltip when underlying element is focused
             * or changed in any other way. We don't know if the element itself
             * is focusable, so we need to observe all elements "below it" too. */

            var hide = function() { widget.hide(); };
            widget._on(widget.element.find(":focusable").addBack(":focusable"), {
                focus: hide,
                keypress: hide,
                change: hide
            });
        },

        _init: function() {
            var widget = this;
            widget.element.tooltipster('show');
            widget._scroll();
        },

        /** Scroll the view so that the tooltip is visible. */
        _scroll: function() {
            var widget = this;
            var tooltipster = widget.element.data('tooltipster');
            if (
                tooltipster &&
                widget.options.scroll &&
                (!_isScrolledIntoView(tooltipster)) &&
                (!_isScrolling)
            ) {
                _isScrolling = true;
                $('html, body').animate({
                    scrollTop: widget.element.data('tooltipster').offset().top - 30
                }, 500, function() {
                    _isScrolling = false;
                });
            };
        },

        _tooltipReady: function() {

            var widget = this;

            /* Tooltipster keeps the tooltip element in .data('tooltipster'), but
             * this is currently undocumented and I guess it may change in future
             * versions. */

            var tooltipster = widget.element.data('tooltipster');
            tooltipster.css("pointer-events", "");
            tooltipster.find('.tooltipster-content').css("pointer-events", "auto");

            /* Scroll the view so that the tooltip is visible. */

            widget._scroll();

            /* Capture some events on the tooltipster content. */

            widget._on(tooltipster.find('.tooltipster-content'), {

                click: function() {

                    /* When the user clicks the error message, we want to focus on the
                     * field with the error. However, we don't know if this.element is focusable.
                     * We'll give the focus to the first focusable element we can find. */

                    widget._trigger(
                        widget.element.find(":focusable").addBack(":focusable").first(),
                        'focus'
                    );
                    widget.hide();
                },

                mouseleave: function() {

                    /* Prevent tooltipster from automatically closing the tooltip. We want
                     * it closed when it's clicked. */

                    return false;
                }
            });
        },

        hide: function() {
            this.element.tooltipster('hide');
        },

        _setOption: function(key, value) {
            var widget = this;
            widget._super(key, value);
            if (key == 'content') {
                widget.element.tooltipster(
                    'content',
                    $.usosUtils._tooltipster_html(widget.options.content)
                );
            }
            return widget;
        },

        _destroy: function() {
            this.element.tooltipster('destroy');
            this.element.removeClass("ua-usosnotice");
        }
    });

})(jQuery);
