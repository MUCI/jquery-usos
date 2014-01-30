(function($) {

    "use strict";

    var mycaches = {};

    $.widget('usosWidgets._usosBadge', {
        options: {
            'entity': null,
            'position': "right"
        },

        _create: function() {

            var widget = this;
            widget.element.data("usosBadge", this);

            /* Postpone actual initialization until the user hovers over
             * the item for some time. */

            widget._on(widget.element, {
                mouseenter: function() {
                    widget.timeoutId = setTimeout(function() {
                        widget._create2();
                    }, 200);
                },
                mouseleave: function() {
                    clearTimeout(widget.timeoutId);
                }
            });
        },

        /**
         * Continue initialization.
         */
        _create2: function() {

            var widget = this;

            /* Prevent re-initialization (via another mouseover). */

            if (widget.timeoutId) {

                /* If timeoutId is still set, then it means that the mouse is
                 * still over the element. If it stays there, then we should
                 * autoopen the tooltip. */

                widget._off(widget.element, "mouseenter mouseleave");
                clearTimeout(widget.timeoutId);
                widget.timeoutId = null;

                var autoopenTimeoutId = setTimeout(function() {
                    widget.element.tooltipster("show");
                    widget._off(widget.element, "mouseout");
                }, 200);
                widget._on(widget.element, {
                    mouseleave: function() {
                        clearTimeout(autoopenTimeoutId);
                    }
                });
            }

            /* Prevent creation of a badge inside of another badge/tooltip. */

            if (widget.element.closest(".ua-tooltip").length > 0) {
                widget.destroy();
                return;
            }

            /* Initialize tooltipster. */

            widget.element.tooltipster({
                content: $.usosUtils._tooltipster_html(

                    /* This is the default tooltip content. It can get updated either before or
                     * after it is shown. */

                    "<p class='ua-loading'>" + $.usosCore.lang("Wczytywanie...", "Loading...") + "</p>"
                ),
                onlyOne: false,
                delay: 400,
                updateAnimation: false,
                interactive: true,
                speed: 0,
                position: widget.options.position,
                theme: "ua-container ua-tooltip ua-tooltip-badge " + widget._cssClass(),
                functionAfter: function() {

                    /* When tooltip is closed, tooltipster removes it from the DOM. This in turn,
                     * destroys all widgets contained within. If we want the widgets to work properly
                     * when the tooltip is opened next time, then we need to recreate the widgets
                     * again. */

                    widget._updateBadgeContent();
                }
            });

            /* 2. Begin loading data. */

            widget._updateBadgeContent();
        },

        /**
         * Begin fetching and creating the badge.
         */
        _updateBadgeContent: function() {
            var widget = this;
            widget._fetchData().done(function(data) {
                widget.element.tooltipster("update", widget._createBadge(data));
            }).fail(function() {
                widget.element.tooltipster("update", $("<p class='ua-loading'>")
                    .text($.usosCore.lang(
                        "Wystąpił błąd. Prosimy odświeżyć stronę.",
                        "Error occured. Please refresh the page."
                    ))
                );
            });
        },

        /**
         * Return a Promise object which resolves into the data object required by
         * the _createBadge method. This promise can be resolved immediatelly, if
         * the data was previously loaded (unless overriden, it is cached until the
         * page reloads).
         */
        _fetchData: function() {

            var widget = this;
            var deferred = $.Deferred();

            var mycache;
            if (!mycaches.hasOwnProperty(widget.options.entity)) {
                mycaches[widget.options.entity] = {};
            }
            mycache = mycaches[widget.options.entity];
            var cache_key = widget._getCacheKey();
            if (mycache[cache_key]) {

                /* Return the cached data. */
                deferred.resolve(mycache[cache_key]);

            } else {

                widget._fetchData2().done(function(data) {

                    /* Cache the result and resolve. */

                    mycache[cache_key] = data;
                    deferred.resolve(data);
                }).fail(function() {
                    deferred.reject();
                });

            }

            return deferred.promise();
        },

        _setOption: function(key, value) {
            /* Recreate. */
            this._create2();
            return this;
        },

        _destroy: function() {
            var widget = this;
            widget.element.tooltipster('destroy');
        },

        _getCacheKey: function() {
            var widget = this;
            var values = [];
            $.each(widget._getEntityKey(), function(_, optionName) {
                values.push(widget.options[optionName]);
            });
            return JSON.stringify(values);
        },
    });

})(jQuery);
