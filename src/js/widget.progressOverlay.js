(function($) {

    "use strict";

    var _findZIndex = function($node) {
        var max = 0;
        $node.parents().each(function() {
            var zIndex = parseInt($(this).css('zIndex'), 10);
            if (zIndex > max)
                max = zIndex;
        });
        return max;
    };

    $.widget('usosWidgets.usosProgressOverlay', {
        options: {
            type: "loading",
            delay: 300,
            opacity: 0.8,
            fadeDuration: 300
        },
        widgetEventPrefix: "usosprogressoverlay:",

        _create: function() {

            var widget = this;

            /* Initialize bg and fg objects. Set proper widths and heights. */

            widget.bg = $("<div>")
                .addClass("ua-progressoverlay-background")
                .css("opacity", 0.01);
            $(document.body).append(widget.bg);
            widget.fg = $("<table>")
                .addClass("ua-progressoverlay-foreground")
                .css("opacity", 0.01)
                .append($("<tr>")
                    .append($("<td>"))
                );
            $(document.body).append(widget.fg);

            widget.fg.find("td").empty();
            widget.bg.add(widget.fg)
                .css("z-index", _findZIndex(widget.element) + 1)
                .css("left", widget.element.offset().left)
                .css("top", widget.element.offset().top)
                .css("width", widget.element.outerWidth())
                .css("height", widget.element.outerHeight())
                .css("opacity", 0.01)
                .delay(widget.options.delay)
                .each(function() {

                    /* There is a huge probability, that the progress indicator
                     * was cancelled (destroyed) before the delay had passed. Before
                     * we fadeIn, we have to verify that. */

                    if ($('body').has(widget.bg).length > 0) {
                        $(this).animate({"opacity": widget.options.opacity}, widget.options.fadeDuration);
                    }
                });

            /* Based on options and/or space available, decide what to show. */

            var title;
            switch (widget.options.type) {
                case 'loading': title = $.usosCore.lang("Wczytywanie...", "Loading..."); break;
                case 'saving': title = $.usosCore.lang("Zapisywanie...", "Saving..."); break;
                default: throw("Unknown type: " + widget.options.type);
            }
            widget.fg.find("td")
                .append($("<span>")
                    .attr('class', 'ua-loading')
                    .attr('title', title)
                );

            widget.fg.delay(widget.options.delay + (widget.options.fadeDuration / 2)).each(function() {

                /* Foreground is shown after the background animation is finished.
                 * However, overlay might have been removed before the animation
                 * could finish. This method is called either way! */

                if (widget.bg && widget.fg) {
                    widget.fg.fadeIn(widget.options.fadeDuration);
                }
            });
        },

        _destroy: function() {
            var widget = this;
            if (widget.bg) {
                widget.bg.stop(true).remove();
                delete widget.bg;
            }
            if (widget.fg) {
                widget.fg.stop(true).remove();
                delete widget.fg;
            }
        },
    });

})(jQuery);
