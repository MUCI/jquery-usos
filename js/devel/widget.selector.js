(function($) {

    "use strict";

    var _getEntitySetup = function(entityCode) {
        var entity = $.usosEntity._get(entityCode);
        if (entity.getSelectorSetup) {
            return entity.getSelectorSetup();
        }
        throw "This entity doesn't implement selectors yet: " + entityCode;
    };

    /** Return true if two values are equal. */
    var _isEqual = function(va, vb) {
        return JSON.stringify(va) == JSON.stringify(vb);
    };

    /**
     * Returns the number of seconds to wait after the user finished typing.
     * After such delay, AJAX request is issued.
     */
    var _getAjaxDelay = function(query) {

        /* In the future, we may decide that it should vary on such things
         * as browser version, resolution, internet speed etc. Currently, we
         * assume that all clients are fast enough. */

        if (query) {
            return 0.25;
        } else {
            return 0.05;
        }
    };

    /** We're using a single timer for all the selectors. */
    var _timer = null;

    /**
     * Delay running callback for 'delay' seconds. If _startTimer is called again
     * before delay is passed, the timer resets.
     */
    var _startTimer = function(delay, callback) {
        _stopTimer();
        _timer = setTimeout(
            function() {
                _timer = null;
                callback();
            },
            delay * 1000
        );
    };

    /**
     * Cancel the timer (previously started with _startTimer).
     */
    var _stopTimer = function() {
        if (_timer) {
            clearTimeout(_timer);
            _timer = null;
        }
    };

    $.widget('usosWidgets.usosSelector', $.usosWidgets._usosValue, {
        options: {
            entity: null,
            source_id: "default",
            width: "300px",
            multi: false,
            value: null,
            placeholder: null,
            searchParams: {}
        },
        widgetEventPrefix: "usosselector:",
        _lastQuery: "",

        /**
         * @memberOf $.usosWidgets.usosSelector
         */
        _init: function() {
            this._super("_init");
            this._recreate();
            this._postInit();
        },

        /**
         * Get options.width in pixels.
         */
        _width: function() {
            var widget = this;
            return Math.max(parseInt(widget.options.width, 10), 80);
        },

        _setOption: function(key, value) {
            this._super(key, value);
            if ($.inArray(key, ['entity', 'width', 'multi']) !== -1) {
                this._recreate();
            } else if (key == 'value') {
                this.value(key, value);
            }
            return this;
        },

        _recreate: function() {
            var widget = this;
            widget._uid = Math.random().toString(36).substring(2, 10);
            widget._entitySetup = _getEntitySetup(widget.options.entity);
            widget._knownItems = {};

            /* Create UI elements. */

            widget._progressIndicator = $("<span class='ua-progress'>").hide();
            widget.element
                .empty()
                .addClass("ua-container ua-selector")
                .css("width", widget._width() + "px")
                .append(widget._progressIndicator)
                .append($("<textarea>")
                    .attr("rows", "1")
                    .css("width", widget._width() + "px")
                );

            /* This is used by usosapiFetch for synchronizing suggestion requests. */

            widget._suggestionsSyncObject = {};

            /* This is used for publishing the 'change' event. */

            widget._previousValue = widget.options.multi ? [] : null;

            /* Discover, bind and extend key UI elements. */

            widget._textarea = widget.element.find("textarea");
            var prompt = (
                (widget.options.placeholder !== null)
                ? $.usosCore.lang(widget.options.placeholder)
                : widget._entitySetup.prompt
            );
            if (prompt) {
                var label = $('<label class="ua-screen-reader-only">').attr("for", widget._uid);
                label.text(prompt + $.usosCore.lang(
                    " - Wpisz tekst i wciśnij enter aby wyszukać",
                    " - Type text and press enter to search"
                ));
                widget._textarea.before(label);
            }
            widget._textarea.attr('id', widget._uid);
            var distanceToTop = widget.element.offset().top;
            var distanceToBottom = $(document).height() - (
                widget.element.offset().top + widget.element.height()
            );

            widget._textarea
                .textext({
                    plugins: 'autocomplete tags focus prompt',
                    prompt: prompt,
                    html: {
                        dropdown: (
                            '<div class="text-dropdown" style="min-width: 300px">' +
                            '<div class="text-list" tabindex="-1"></div>'
                        )
                    },
                    autocomplete: {
                        dropdown: {
                            maxHeight: "250px",
                            position:
                                (distanceToBottom > 200) ? "below" :
                                ((distanceToTop > distanceToBottom) ? "above" : "below")
                        },
                        render: function(suggestion) {

                            /* Usually, "suggestion" vartiable is the entity ID. However,
                             * is also can be one of the "special values". */

                            var span = $('<span>');
                            if (suggestion == "empty") {
                                span.addClass("ua-empty").html($.usosCore.lang(
                                    "Brak wyników", "No results"
                                ));
                            } else if (suggestion == "more") {
                                span.addClass("ua-more").html($.usosCore.lang(
                                    "Pokaż więcej wyników", "See more results"
                                ));
                            } else if (suggestion == "more-hidden") {
                                span.addClass("ua-more ua-more-hidden").html($.usosCore.lang(
                                    "Pokaż wyniki", "See results"
                                ));
                            }
                            else {
                                span.html(widget._entitySetup.suggestionRenderer(
                                    widget._knownItems[suggestion]
                                ));
                            }
                            span.find("*").addBack().addClass("text-label");
                            return span;
                        }
                    },
                    ext: {
                        tags: {
                            renderTag: function(tag)
                            {
                                var node = $(this.opts('html.tag'));
                                var elem = widget._entitySetup.tagRenderer(
                                    widget._knownItems[tag]
                                );
                                elem.css({
                                    'white-space': 'nowrap',
                                    'display': 'inline-block',
                                    'overflow': 'hidden',
                                    'text-overflow': 'ellipsis',
                                    'max-width': (widget._width() - 40) + "px"
                                });
                                node.find('.text-label').html(elem);
                                node.data(widget.widgetFullName, widget._knownItems[tag]);
                                node.data('text-tag', tag);
                                return node;
                            }
                        }
                    }
                })
                .bind('getSuggestions', function(e, data)
                {
                    var $self = $(this);
                    var textext = $(e.target).textext()[0];
                    var query = (data ? data.query : '') || '';
                    widget._lastQuery = query;

                    _startTimer(
                        _getAjaxDelay(query),
                        function()
                        {
                            widget._progressIndicator.delay(300).fadeIn(300);
                            $.usosCore.usosapiFetch({
                                source_id: widget.options.source_id,
                                method: widget._entitySetup.search.method,
                                params: $.extend(
                                    {},
                                    widget.options.searchParams,
                                    widget._entitySetup.search.paramsProvider(query)
                                ),
                                syncMode: 'receiveIncrementalFast',
                                syncObject: widget._suggestionsSyncObject,
                                success: function(data) {
                                    var keys = [];
                                    $.each(widget._entitySetup.search.itemsExtractor(data), function(_, item) {
                                        var id = widget._entitySetup.idExtractor(item);
                                        widget._knownItems[id] = item;
                                        keys.push(id);
                                    });
                                    if (keys.length > 3) {
                                        keys.push("more");
                                    } else if (keys.length == 0) {
                                        keys.push("empty");
                                    } else if (keys.length > 0) {
                                        keys.push("more-hidden");
                                    }
                                    $self.trigger('setSuggestions', { result: keys });
                                    widget._checkProgress();
                                },
                                error: function(xhr, errorCode, errorMessage) {
                                    widget._textarea.usosNotice({
                                        content: $.usosCore.lang(
                                            "Nie udało się wczytać listy sugestii. Spróbuj odświeżyć stronę (F5).",
                                            "Could not load the list of suggestions. Try to refresh tha page (F5)."
                                        )
                                    });
                                    widget._checkProgress();
                                }
                            });
                        }
                    );
                })
                .bind('isTagAllowed', function(e, data) {
                    if (data.tag == "empty") {
                        data.result = false;
                        widget._popout();
                        return;
                    }
                    if (data.tag == "more" || data.tag == "more-hidden") {
                        widget._popout();
                        data.result = false;
                        return;
                    }
                    if (!widget._knownItems[data.tag]) {
                        widget._textarea.usosNotice({
                            content: $.usosCore.lang(
                                "Przed wciśnięciem Enter należy poczekać na załadowanie listy sugestii.",
                                "Before pressing Enter, you should wait until the suggestions show up."
                            )
                        });
                        data.result = false;
                        return;
                    }
                    var values = widget._getIds();
                    if ((!widget.options.multi) && (values.length > 0)) {
                        widget._setIds([]);
                        return;
                    }
                    if (widget.options.multi && $.inArray(data.tag, values) !== -1) {
                        widget._textarea.usosNotice({
                            content: $.usosCore.lang(
                                "Ta pozycja już znajduje się na liście.",
                                "This item is already on the list."
                            )
                        });
                        data.result = false;
                        return;
                    }
                })
                .bind('setFormData', function() {
                    var currentValue = widget.element.usosSelector('value');
                    widget.options.value = currentValue;
                    if (!widget.options.multi) {
                        if (currentValue === null) {
                            widget._markUnfilled();
                        } else {
                            widget._markFilled();
                        }
                    }
                    if (!_isEqual(currentValue, widget._previousValue)) {
                        var prev = widget._previousValue;
                        var cur = currentValue;
                        widget._previousValue = currentValue;
                        widget._trigger('change');
                        if (!widget._textarea.prop("disabled")) {
                            if (
                                cur != null
                                && widget._entitySetup.affector
                                && ($.usosCore._getSettings().usosAPIs['default'].user_id !== null)
                            ) {
                                /* Affector function is responsible for calling proper
                                 * search_history_affect USOS API method. It takes a list of IDs.
                                 * We need to determine with which set of items search history
                                 * should be updated. */
                                if (!$.isArray(cur)) {
                                    cur = [cur];
                                }
                                if (!$.isArray(prev)) {
                                    prev = [prev];
                                }
                                var newids = $(cur).not(prev).get();
                                if (newids.length > 0) {
                                    widget._entitySetup.affector(newids);
                                }
                            }
                        }
                    }
                });

            if (widget.options.value) {
                widget.element.usosSelector('value', widget.options.value);
            }
        },

        /**
         * Give our component a "filled" look. This is used, when 'multi' is false,
         * and there is one selected ID present.
         */
        _markFilled: function() {
            this.element.addClass("ua-filled");
        },

        /**
         * Remove the "filled" look and feel (previously applied with _markFilled).
         */
        _markUnfilled: function() {
            this.element.removeClass("ua-filled");
        },

        /**
         * Get the list of IDs of currently selected items.
         */
        _getIds: function() {
            var keys = [];
            var widget = this;
            $.each(widget._textarea.textext()[0].tags().tagElements(), function(_, element) {
                keys.push(widget._entitySetup.idExtractor($(element).data(widget.widgetFullName)));
            });
            return keys;
        },

        /**
         * Check the internal syncObject and determine if we should still show the
         * progress indicator or not. This is called after AJAX request completes
         * (both after success of failure).
         */
        _checkProgress: function() {
            var widget = this;
            var so = widget._suggestionsSyncObject;
            if (so.lastIssuedRequestId == so.lastReceivedRequestId) {
                /* All AJAX requests complete. Hide the progress indicator. */
                widget._progressIndicator.stop(true, false).hide();
            }
        },

        /**
         * Set the list of currently selected IDs. This will usually trigger an AJAX call
         * to retrieve the items for the given IDs.
         */
        _setIds: function(ids) {

            var widget = this;

            /* Temporarily disable all the input (until we finish loading). */

            var previousDisabledState = widget._textarea.prop("disabled");
            widget._textarea.prop("disabled", true);

            /* This is the function we're going to call after we have all the ids loaded
             * (into the knownItems dictionary). */

            var continuation = function() {
                $.each(widget._getIds(), function(_, id) {
                    widget._textarea.textext()[0].tags().removeTag(id);
                });
                var validIds = ids.filter(function(id) {
                    return typeof widget._knownItems[id] !== 'undefined';
                });
                widget._textarea.textext()[0].tags().addTags(validIds);
                widget._textarea.prop("disabled", previousDisabledState);
                if (validIds.length < ids.length) {
                    widget._textarea.usosNotice({
                        content: $.usosCore.lang(
                            "Wystąpił błąd podczas wczytywania wartości tego pola. Sprawdź, czy pole " +
                            "zawiera pożądaną wartość. Jeśli problem będzie się powtarzał, proszę " +
                            "skontaktować się z administratorem.",

                            "Error occured while loading values for this form field. Check if the field " +
                            "has the proper value. If this problem persists, please contact the administrator."
                        )
                    });
                }
            };

            /* Compute the set of unknown IDs. */

            var unknownIds = ids.filter(function(id) {
                return typeof widget._knownItems[id] === 'undefined';
            });

            /* If not empty, make an AJAX call to retrieve the missing items. */

            if (unknownIds.length > 0) {
                widget.element.usosProgressOverlay();
                $.usosCore.usosapiFetch({
                    source_id: widget.options.source_id,
                    method: widget._entitySetup.get.method,
                    params: widget._entitySetup.get.paramsProvider(unknownIds),
                    success: function(data) {
                        widget.element.usosProgressOverlay('destroy');
                        $.each(widget._entitySetup.get.itemsExtractor(data), function(_, item) {
                            var id = widget._entitySetup.idExtractor(item);
                            widget._knownItems[id] = item;
                        });
                        continuation();
                    },
                    error: function(xhr, errorCode, errorMessage) {
                        widget._textarea.usosNotice({
                            content: $.usosCore.lang(
                                "Wystąpił błąd podczas wczytywania wartości tego pola. Spróbuj " +
                                "odświeżyć stronę (F5).",
                                "Error occured while loading values for this form field. Try to " +
                                "refresh the page (F5)."
                            )
                        });
                    }
                });
            } else {
                continuation();
            }
        },

        value: function(val) {

            /* getter */
            if (typeof val === 'undefined') {
                var values = this._getIds();
                if (this.options.multi) {
                    return values;
                } else if (values.length === 0) {
                    return null;
                } else {
                    return values[0];
                }
            }

            /* setter */
            if (this.options.multi) {
                this._setIds(val);
            } else if (val === null) {
                this._setIds([]);
            } else {
                this._setIds([val]);
            }

            return this;
        },

        _destroy: function() {
            this.element.empty();
            this._super("_destroy");
        },

        /**
         * Display results in a separate window.
         */
        _popout: function() {
            var widget = this;
            var uiElems = $('body > *');
            uiElems.attr('aria-hidden', 'true');
            var div = $("<div>");
            $("body").addClass("ua-stop-scrolling");
            div.dialog({
                dialogClass: "ua-panic-dialog ua-scrollable ua-selector-popup",
                resizable: false,
                modal: true,
                width: Math.min(Math.max(300, widget._width()) * 2.2 + 30, $(window).width() * 0.8),
                minHeight: 200,
                height: Math.min($(window).height() * 0.7, 600),
                closeText: $.usosCore.lang("Zamknij", "Close"),
                close: function() {
                    $("body").removeClass("ua-stop-scrolling");
                    uiElems.removeAttr('aria-hidden');
                    widget._textarea.focus();
                    try {
                        div.usosProgressOverlay('destroy');
                    } catch(err) {}
                }
            });
            div.usosProgressOverlay();
            $.usosCore.usosapiFetch({
                source_id: widget.options.source_id,
                method: widget._entitySetup.search.method,
                params: $.extend(
                    {},
                    widget.options.searchParams,
                    widget._entitySetup.search.paramsProvider(widget._lastQuery),
                    {num: 20}
                )
            }).always(function() {
                try {
                    div.usosProgressOverlay('destroy');
                } catch(err) {}
            }).done(function(data) {
                div.append($.usosCore.lang(
                    "<p class='ua-howto' tabindex='0'><span class='if-query'>Wyniki dla zapytania <span class='query'></span>.<br></span>" +
                    "Kliknij element, aby go wybrać. Wciśnij klawisz Esc, aby zamknąć to okno. " +
                    "<span class='ua-screen-reader-only'>Na liście wyników możesz poruszać się tabulatorem oraz strzałkami góra/dół.</span></p>",

                    "<p class='ua-howto tabindex='0'><span class='if-query'>Search results for <span class='query'></span>.<br></span>" +
                    "Click to choose element. Press Esc, to cancel.</p>"
                ));
                div.prepend('<span class="ua-close-button" aria-hidden="true"></span>');
                div.find('.ua-close-button').bind('click', function(e) {
                    e.preventDefault();
                    div.dialog("close");
                });
                div.find('.ua-howto')
                    .bind('keypress keydown', function(e) {
                        if (e.keyCode == 40 || e.which == 40) {
                            $('.ua-inline-suggestion').first().focus();
                        }
                    })
                    .focus();
                var itemsContainer = $("<ul style='display: inline-block; text-align: center; padding: 0;'>");
                div.append(itemsContainer);
                var items = widget._entitySetup.search.itemsExtractor(data);
                $.each(items, function(index, item) {
                    var id = widget._entitySetup.idExtractor(item);
                    var span = $("<li class='ua-inline-suggestion'> ")
                        .css("width", Math.max(300, widget._width()) - 4)
                        .html(widget._entitySetup.suggestionRenderer(item))
                        .attr("tabindex", 0)
                        .attr("id", "ua-suggestion-id-" + index)
                        .on("focus", function() { $(this).addClass("text-selected"); })
                        .on("blur", function() { $(this).removeClass("text-selected"); })
                        .hover(
                            function() { $(this).addClass("text-selected"); },
                            function() {
                                if (!($(this).is(":focus"))) {
                                    $(this).removeClass("text-selected");
                                }
                            }
                        )
                        .on("click keypress keydown", function(e) {
                            var keyCode = e.keyCode || e.which;
                            if (
                                (e.type == "keypress" || e.type == "keydown")
                                && e.which != 13 && e.which != 9 && e.which != 27 && e.which != 32
                                && e.which != 38 && e.which != 40
                            ) {
                                /* Ignore all keypresses other than enter, tab, escape, space, up and down arrow */
                                return;
                            }
                            /* Keyboard access */
                            switch(keyCode) {
                                case 9: return true;
                                case 27:
                                    div.dialog("close");
                                    return true;
                                case 39: return true;
                                case 38:
                                    if ($(this).attr('id') == 'ua-suggestion-id-0') {
                                        $('.ua-howto').focus();
                                    } else {
                                        $(this).prev().focus();
                                    }
                                    e.preventDefault();
                                    return true;
                                case 40:
                                    if ($(this).attr('id') == 'ua-suggestion-id-19') {
                                        $('.ua-warning').focus();
                                    } else {
                                        $(this).next().focus();
                                    }
                                    e.preventDefault();
                                    return true;
                            }
                            var value;
                            if (widget.options.multi) {
                                value = widget.value();
                                value.push(id);
                            } else {
                                value = id;
                            }
                            widget.value(value);
                            if (widget._entitySetup.affector) {
                                widget._entitySetup.affector([value]);
                            }
                            div.dialog("close");
                        });
                    itemsContainer.append(span);
                });
                if (items.length == 0) {
                    $('.ua-howto').addClass('ua-warning').html($.usosCore.lang(
                        "Brak wyników dla zapytania <span class='query'></span>. Aby zamknąć okno wciśnij klawisz Esc",

                        "No results found for <span class='query></span>. Press Esc to close this window."
                    )).removeClass('ua-howto');
                }
                if (items.length >= 20) {
                    div.append($.usosCore.lang(
                        "<p class='ua-warning ua-focusvisible' tabindex='0'><b>Wyświetlanych jest tylko 20 najlepszych trafień.</b> " +
                        "Jeśli nadal nie możesz znaleźć, to zamknij okno i spróbuj " +
                        "doprecyzować swoje zapytanie. Na przykład, jeśli szukasz " +
                        "osoby, to możesz spróbować podać jej numer indeksu. Albo jeśli " +
                        "szukasz przedmiotu, spróbuj podać jego kod. "+
                        "<span class='ua-screen-reader-only'>Wciśnij klawisz Esc aby zamknąć to okno</span>",

                        "<p class='ua-warning ua-focusvisible' tabindex='0'><b>Only the best 20 matches are displayed.</b> " +
                        "If you still have trouble with your search then close this window and try " +
                        "a more specific query. For example, if you're looking for a person " +
                        "then you might want to try providing his/her student ID. Or, if you're looking " +
                        "for a course then try providing its code. <span class='ua-screen-reader-only'>Press Esc, to cancel</span>"
                    ));
                    div.find('.ua-warning').bind('keypress keydown', function(e) {
                        if (e.keyCode == 38 || e.which == 38) {
                            $('.ua-inline-suggestion').last().focus();
                        }
                    });
                }
                if (widget._lastQuery) {
                    div.find(".ua-howto .query").text(widget._lastQuery);
                } else {
                    div.find(".ua-howto .if-query").hide().attr('aria-hidden', 'true');
                }
            }).fail(function(response) {
                $.usosCore.panic(response);
                div.dialog("close");
            });
        }
    });

})(jQuery);
