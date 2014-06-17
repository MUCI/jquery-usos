(function($) {

    "use strict";

    var NS = "_usosApiTable";

    /**
     * InvisibleStateCoordinator simply stores the state in memory and
     * publishes the new state whenever it is changed with setState method.
     *
     * Compare this with UrlHashStateCoordinator.
     */
    function InvisibleStateCoordinator(defaultState, onStateChanged) {
        this._state = defaultState;
        this._lastPublishedState = null;
        this.onStateChanged = onStateChanged;
        this.publishState();
    }
    InvisibleStateCoordinator.prototype.publishState = function(force) {
        var currentState = this.getState();
        if ((!force) && (currentState == this.lastPublishedState))
            return;
        this._lastPublishedState = currentState;
        this.onStateChanged(currentState);
    };
    InvisibleStateCoordinator.prototype.getState = function() {
        return this._state;
    };
    InvisibleStateCoordinator.prototype.setState = function(state) {
        this._state = state;
        this.publishState();
    };
    InvisibleStateCoordinator.prototype.destroy = function() {
    };

    /**
     * UrlHashStateCoordinator stores the state in the fragment part of an URL.
     * Fragment may contain multiple params - the state is stored in a param
     * named paramName.
     */
    function UrlHashStateCoordinator(paramName, defaultState, onStateChanged) {
        this.paramName = paramName;
        this._lastPublishedState = null;
        this.onStateChanged = onStateChanged;
        var me = this;
        /* Subscribe to the hashchange event. */
        $(window).bind('hashchange.' + NS, function(e) {
            me.publishState();
        });
        /* If there is no state in hash, set to default one. This will also
         * trigger this.publishState(), via hashchange event. */
        if (this.getState() === null) {
            this.setState(defaultState);
        } else {
            this.publishState();
        }
    }
    UrlHashStateCoordinator.prototype.publishState = function(force) {
        var currentState = this.getState();
        if ((!force) && (currentState == this.lastPublishedState))
            return;
        this._lastPublishedState = currentState;
        this.onStateChanged(currentState);
    };
    UrlHashStateCoordinator.prototype.getState = function() {
        var v = $.bbq.getState(this.paramName);
        if (v)
            return v;
        return null;
    };
    UrlHashStateCoordinator.prototype.setState = function(state) {
        var x = {};
        x[this.paramName] = state;
        $.bbq.pushState(x);
    };
    UrlHashStateCoordinator.prototype.destroy = function() {
        $(window).unbind('hashchange.' + NS);
    };

    /** [{column: "abc", ascending: false}] => "-abc" */
    var _orderRulesToString = function(orderRules) {
        return ($.map(orderRules, function(e) { return (e.ascending ? "" : "-") + e.column; })).join("|");
    };

    /** "x|-abc" => [{column: "x", ascending: true}, {column: "abc", ascending: false}] */
    var _orderRulesFromString = function(s) {
        return $.map(s.split("|"), function(e) { return { column: e.replace("-", ""), ascending: e[0] != '-' }; });
    };

    /**
     * Create a TD for a LangDict value.
     */
    var _langDictTdFormatter = function(value) {
        return $("<td>")
            .addClass("ua-datatype-langdict")
            .append($.usosCore.lang({
                langdict: value,
                wrapper: "jQuery.text"
            }));
    };

    /**
     * Create a TD for a boolean value.
     */
    var _booleanTdFormatter = function(value) {
        var td = $("<td>").addClass("ua-datatype-boolean");
        if (value) {
            td
                .addClass("ua-true")
                .text($.usosCore.lang("TAK", "YES"));
        } else {
            td
                .addClass("ua-false")
                .text($.usosCore.lang("NIE", "NO"));
        }
        return td;
    };

    var SERIALIZER_VERSION = "1";

    /**
     * Serialize a state (usually applied before being passed to
     * stateCoordinator).
     */
    var _serializeState = function(state) {
        return (
            SERIALIZER_VERSION + "," +
            state.offset + "," +
            _orderRulesToString(state.orderRules).replace(/\|/g, ",")
        );
    };

    /**
     * Unserialize a state (usually applied after being received from
     * stateCoordinator).
     */
    var _unserializeState = function(serializedState) {
        try {
            var tmp = serializedState.split(",");
            if (tmp[0] == "1") {
                return {
                    offset: parseInt(tmp[1], 10),
                    orderRules: _orderRulesFromString(tmp.slice(2).join("|"))
                };
            } else {
                throw "Unknown serializer version";
            }
        } catch(err) {
            $.usosCore._console.error("Could not deserialize apiTable state:", err);
            return {offset: 0, orderRules: []};
        }
    };

    /** Create TD element for given column definition and data row trData. */
    var _autoTdFormatter = function(trData, column) {
        if (!column.field) {
            return $("<td>").text("Missing 'field' key in column spec.");
        }
        var td;
        var value = trData;
        $.each(column.field.split("."), function(_, key) { value = value[key]; });
        if (typeof value === 'object') {
            /* Assume it's a LangDict. */
            td = _langDictTdFormatter(value);
        } else if (typeof value === 'number') {
            td = $("<td>").addClass("ua-datatype-number").text(value);
        } else if (typeof value === 'string') {
            td = $("<td>").addClass("ua-datatype-string").text(value);
        } else if (typeof value === 'boolean') {
            td = _booleanTdFormatter(value);
        } else if (value === null) {
            td = $("<td>")
                .append($("<span>")
                    .addClass("ua-note")
                    .text($.usosCore.lang("(brak danych)", "(no data)"))
                );
        } else if (value === undefined) {
            td = $("<td>").text(
                "Missing field '" + column.field + "' in data feed."
            );
        } else {
            td = $("<td>").text("Unknown column data type.");
        }
        return td;
    };

    $.widget('usosWidgets._usosApiTable', {
        options: {
            hashParam: null,
            source_id: "default",
            method: null,
            params: {},
            offsetReset: false,
            columns: null,
            defaultOrder: null,
            pageLength: 6,
            methodLimit: null,
            actions: [],
            emptyMessage: {
                pl: "Brak wyników",
                en: "No results"
            },
            nowrap: true
        },
        widgetEventPrefix: "_usosapitable:",

        initialized: false,
        destroyed: false,
        currentOrder: null, // WRBUG
        stateCoordinator: null, // WRBUG
        syncObject: null,
        defaultAction: null,

        ediv: null,
        etable: null,
        esummary: null,

        _create: function() {
            var widget = this;

            /* Basic layout */

            widget.element.empty();
            var div = $("<div class='ua-container ua-table-container'>");
            var table = $("<table class='ua-table'>");
            if (widget.options.nowrap) {
                table.addClass("ua-ellipsis-tds");
            }
            div.append(table);
            widget.element.append(div);

            /* THEAD */

            var thead = $("<thead>");
            var tr = $("<tr>");
            thead.append(tr);
            $.each(widget.options.columns, function(_, column) {
                var td = $("<td>");
                if (column.width) {
                    td.css("width", column.width);
                }
                if (column.align) {
                    td.css("text-align", column.align);
                }
                if (column.sortable) {
                    td.addClass("ua-sortable");
                    td.append($("<a>")
                        .attr("tabindex", 0)
                        .addClass("ua-sorter")
                        .attr("data-ua-fields", column.field)
                        .html(column.label)
                    );
                } else {
                    td.addClass("ua-nonsortable");
                    td.html(column.label);
                }
                if (column.cssClass) {
                    $.each(column.cssClass.split(" "), function(_, cls) {
                        if (cls) {
                            td.addClass(cls);
                        }
                    });
                }
                tr.append(td);
            });
            if (widget.options.actions.length > 0) {
                tr.append($("<td>")
                    .addClass("ua-nonsortable")
                    .addClass("ua-actions")
                    .css("width", (1 + widget.options.actions.length*19) + "px")
                );
            }
            table.append(thead);

            /* TBODY */

            var tbody = $("<tbody class='ua-contents'>");
            table.append(tbody);

            /* TFOOT */

            var tfoot = $("<tfoot>")
                .append($("<tr>")
                    .append($("<td>")
                        .attr("colspan", widget._columnCount())
                        .append($("<table>")
                            .css("width", "100%")
                            .append($("<tr>"))
                        )
                    )
                );
            tfoot.find("table tr")
                .append($("<td>")
                    .css("vertical-align", "middle")
                    .append($("<div>")
                        .addClass("ua-summary")
                    )
                )
                .append($("<td>")
                    .append($("<ul>")
                        .addClass("ua-more")
                        .append($("<div>")
                            .addClass("ua-prevpage")
                            .button({
                                disabled: true,
                                icons: { primary: "ui-icon-carat-1-w" },
                                label: $.usosCore.lang("POPRZEDNIA STRONA", "PREVIOUS PAGE")
                            })
                        )
                        .append($("<div>")
                            .addClass("ua-nextpage")
                            .button({
                                disabled: true,
                                icons: { secondary: "ui-icon-carat-1-e" },
                                label: $.usosCore.lang("NASTĘPNA STRONA", "NEXT PAGE")
                            })
                        )
                    )
                );
            table.append(tfoot);

            /* Discover, bind and extend key UI elements. */

            widget.ediv = div;
            widget.etable = div.find('.ua-table');
            widget.esummary = div.find('.ua-summary');
            widget.esorters = div.find('.ua-sorter');
            widget.econtents = div.find('.ua-contents');
            widget.eprevPage = div.find('.ua-prevpage');
            widget.enextPage = div.find('.ua-nextpage');

            widget.esorters.each(function() {

                /* Create an order indicator. Parse and store orderRules. */

                var that = $(this);
                var img = $("<div>").css('margin-left', '3px').hide();
                that.after(img);
                var loader = $("<span class='ua-loading'>").hide();
                img.after(loader);
                that.data(NS, {
                    img: img,
                    loader: loader,
                    orderRules: _orderRulesFromString(that.attr('data-ua-fields'))
                });

                /* If this sorter is inside the header, make the whole TD clickable. */

                if (that.parent().hasClass("ua-sortable")) {
                    widget._on(that.parent(), {
                        click: function() {
                            that.trigger('click');
                        }
                    });
                }
            });

            widget._on(widget.esorters, {
                click: function(e) {

                    /* Sorter clicked. We need to construct new order. */

                    if (!widget.initialized) {
                        /* The widget is not yet properly initialized. */
                        return;
                    }

                    var coldata = $(e.currentTarget).data(NS);

                    /* Hide other loading indicators. Show this one. */

                    // WRTODO: extract? document?

                    widget.etable.find("thead .ua-loading").hide();
                    coldata.loader.show();
                    var clickedColumns = $.map(
                        coldata.orderRules,
                        function(e, i) { return e.column; }
                    );
                    widget.currentOffset = 0;
                    var ascending = true;
                    if (
                        widget.currentOrder.length > 0 &&
                        widget.currentOrder[0].column == clickedColumns[0] &&
                        widget.currentOrder[0].ascending === true
                    ) {
                        ascending = false;
                    }
                    var references = [];
                    var newRules = [];
                    var i;
                    for (i = 0; i < widget.currentOrder.length; i++) {
                        if ($.inArray(widget.currentOrder[i].column, clickedColumns) !== -1)
                            references[widget.currentOrder[i].column] = widget.currentOrder[i];
                        else
                            newRules.push(widget.currentOrder[i]);
                    }
                    var prefixRules = [];
                    for (i = 0; i < clickedColumns.length; i++) {
                        var rule = null;
                        if (references[clickedColumns[i]]) {
                            rule = references[clickedColumns[i]];
                            rule.ascending = ascending;
                        }
                        else
                            rule = {column: clickedColumns[i], ascending: ascending};
                        prefixRules.push(rule);
                    }
                    var newOrder = prefixRules;
                    for (i = 0; i < newRules.length; i++)
                        newOrder.push(newRules[i]);
                    widget.stateCoordinator.setState(_serializeState({
                        orderRules: newOrder,
                        offset: 0
                    }));
                    return false;
                },
                keypress: function(e) {
                    if (e.which == 13) { $(e.currentTarget).trigger("click"); }
                }
            });

            widget._on(widget.eprevPage, {
                click: function(e) {
                    $(e.currentTarget).button("disable");
                    widget.stateCoordinator.setState(_serializeState({
                        offset: widget.currentOffset - widget.options.pageLength,
                        orderRules: widget.currentOrder
                    }));
                }
            });

            widget._on(widget.enextPage, {
                click: function(e) {
                    $(e.currentTarget).button("disable");
                    widget.stateCoordinator.setState(_serializeState({
                        offset: widget.currentOffset + widget.options.pageLength,
                        orderRules: widget.currentOrder
                    }));
                }
            });

            /* This is used for syncing requests sent and responses received. */

            widget.syncObject = {};

            /* Find default action. */

            widget.defaultAction = null;
            $.each(widget.options.actions, function(_, action) {
                if (action.isDefault) {
                    if (widget.defaultAction) {
                        $.usosCore._console.error("More than one default action defined.");
                        return false;  // breaks the loop
                    }
                    widget.defaultAction = action;
                }
            });

            /* Reset UI. Refresh current order rules. */

            widget.currentOrder = null;
            widget.currentOffset = 0;

            /* Read current state. Our state coordinator decides on the current
             * state (it *might* choose to use the default one, but sometimes it
             * does not). Note that onStateChanged will be executed during the
             * construction. */

            var defaultState = _serializeState({
                offset: 0,
                orderRules: _orderRulesFromString(widget.options.defaultOrder)
            });
            var onStateChanged = function(serializedState) {
                widget.initialized = true;
                var newState = _unserializeState(serializedState);
                widget.currentOrder = newState.orderRules;
                widget.currentOffset = newState.offset;
                widget.reload();
            };
            if (widget.options.hashParam) {
                widget.stateCoordinator = new UrlHashStateCoordinator(
                    widget.options.hashParam, defaultState, onStateChanged
                );
            } else {
                widget.stateCoordinator = new InvisibleStateCoordinator(
                    defaultState, onStateChanged
                );
            }

            /* Offset reset is done at most once, during init. */

            if (widget.options.offsetReset) {
                var state = _unserializeState(widget.stateCoordinator.getState());
                state.offset = 0;
                widget.stateCoordinator.setState(_serializeState(state));
            }

            return div;
        },

        reload: function() {
            var widget = this;

            $.usosCore._console.log("Reloading with order " + _orderRulesToString(widget.currentOrder) + "...");
            widget._refreshSorterImages();
            widget._overlayContentWith($("<span>").addClass("ua-loading"));
            widget._updateSummary($("<span>")
                .addClass("ua-loading")
                .text($.usosCore.lang("Wczytywanie...", "Loading..."))
            );
            $.usosCore.usosapiFetch({
                source_id: widget.options.source_id,
                method: widget.options.method,
                params: widget._constructMethodParameters(),
                syncMode: "receiveLast",
                syncObject: widget.syncObject,
                success: function(data) {
                    if (widget.destroyed) {
                        return;
                    }
                    widget.econtents.empty();
                    $.each(data.items, function(_, trData) {
                        var tr = $("<tr>");
                        tr.data(NS, trData);
                        $.each(widget.options.columns, function(_, column) {
                            var td;
                            if (column.customTdFormatter) {
                                td = column.customTdFormatter(trData);
                            } else {
                                td = _autoTdFormatter(trData, column);
                            }
                            /* Apply css classes from column.cssClass. */
                            if (column.cssClass) {
                                $.each(column.cssClass.split(" "), function(index, cls) {
                                    if (cls) {
                                        td.addClass(cls);
                                    }
                                });
                            }
                            /* Apply text align from column.align. */
                            if (column.align) {
                                td.css("text-align", column.align);
                            }
                            /* Apply overflow handler, if needed. */
                            if (widget.options.nowrap) {
                                widget._on(td, {
                                    mouseenter: function(e) {
                                        var that = $(e.currentTarget);
                                        if (that.attr('title')) {
                                            return;
                                        }

                                        var ellipsisShown = false;

                                        /* There is a much faster way for Chrome, but we need this to
                                         * work on Firefox too. http://goo.gl/HIZkZ */

                                        var e = that
                                            .clone()
                                            .css({
                                                display: 'inline',
                                                width: 'auto',
                                                visibility: 'hidden'
                                            })
                                            .appendTo('body');
                                        ellipsisShown = e.width() > that.width();
                                        e.remove();

                                        if (ellipsisShown) {
                                            that.attr('title', that.text());
                                        }
                                    }
                                });
                            }
                            tr.append(td);
                        });
                        if (widget.options.actions.length > 0) {
                            var actionsTd = $("<td class='ua-actions'>");
                            $.each(widget.options.actions, function(_, action) {
                                var div = $("<a class='ua-action-icon'>")
                                    .attr("tabindex", 0)
                                    .append($("<div>")
                                        .addClass("ui-icon")
                                        .addClass(action.iconClass)
                                    )
                                    .usosTip({
                                        type: "tool",
                                        content: action.label,
                                        position: "top",
                                        delayed: true
                                    })
                                    .click(function() {
                                        action.click(trData);
                                        return false;
                                    })
                                    .keypress(function(e) {
                                        if (e.which == 13) { $(this).trigger("click"); }
                                    });
                                if ((action.isVisible) && (!action.isVisible(trData))) {
                                    div.css("visibility", "hidden");
                                }
                                actionsTd.append(div);
                            });
                            tr.append(actionsTd);
                        }
                        widget.econtents.append(tr);
                    });
                    /* Apply hover/click actions. */
                    if (widget.defaultAction) {
                        widget._on(widget.econtents.find("tr"), {
                            mouseenter: function(e) { $(e.currentTarget).addClass("ua-hovered"); },
                            mouseleave: function(e) { $(e.currentTarget).removeClass("ua-hovered"); },
                            click: function(e) {
                                widget.defaultAction.click($(e.currentTarget).data(NS));
                            }
                        });
                    }
                    /* Next/Prev buttons */
                    widget.enextPage.button(data.next_page ? "enable" : "disable");
                    widget.eprevPage.button(widget.currentOffset > 0 ? "enable" : "disable");
                    /* Make the columns resizable. */
                    widget.etable.colResizable({
                        liveDrag: true,
                        headerOnly: true
                    });
                    /* Remove all progress indicators. */
                    widget.etable.find("thead .ua-loading").hide();
                    widget._removeOverlay();
                    /* Update the summary. */
                    if (widget.currentOffset + data.items.length === 0) {
                        /* No data to display. */
                        var span = $("<span>")
                            .html($.usosCore.lang(widget.options.emptyMessage));
                        widget._overlayContentWith(span);
                        widget._updateSummary("");
                    } else {
                        if (
                            widget.options.methodLimit
                            && widget.currentOffset + widget.options.pageLength >= widget.options.methodLimit
                        ) {
                            var notice = $("<div>").html($.usosCore.lang(
                                "<b style='color: #c00'>Uwaga:</b> Wyświetlanych jest " +
                                widget.options.methodLimit + " pierwszych wyników wyszukiwania",

                                "<b style='color: #c00'>Please note:</b> Only the first " +
                                widget.options.methodLimit + " search results are displayed"
                            ));
                            notice.append(" ").append($.usosWidgets.usosTip.create(
                                "<p>Nawet jeśli więcej wyników pasuje do Twojego zapytania, z pomocą " +
                                "tej wyszukiwarki możesz ich wyświetlić co najwyżej <b>" +
                                widget.options.methodLimit + "</b>.</p>" +
                                "<p>Jeśli nie możesz znaleźć szukanego elementu na liście, to spróbuj " +
                                "zmodyfikować parametry swojego wyszukiwania (np. użyć filtrów lub inaczej " +
                                "posortować listę wyników).</p>",

                                "<p>Even if more results match your query, this page allows you to " +
                                "see at most <b>" + widget.options.methodLimit + "</b> of them.</p>" +
                                "<p>If you cannot find your element on this list, then try to modify " +
                                "your search parameters (e.g. use the filters or try to sort the results " +
                                "differently).</p>"
                            ));
                            widget._updateSummary(notice);
                        } else {
                            widget._updateSummary(
                                $.usosCore.lang("Pokazywane elementy ", "Showing items ") +
                                (widget.currentOffset + 1) + ".." +
                                (widget.currentOffset + data.items.length)
                            );
                        }
                    }
                },
                error: function() {
                    var errorSpan = $("<span>")
                        .html($.usosCore.lang(
                            "Wystąpił błąd podczas wczytywania. Spróbuj odświeżyć stronę (F5).",
                            "There was an error while loading. Try to refresh the page (F5)."
                        ));
                    widget._overlayContentWith(errorSpan);
                    widget._updateSummary(errorSpan.clone(true));
                    widget.etable.find("thead .ua-loading").hide();
                }
            });

        },

        /**
         * Get the total number of columns to be displayed in the table.
         */
        _columnCount: function() {
            var widget = this;
            var count = widget.options.columns.length;
            if (widget.options.actions.length > 0) {
                count++;
            }
            return count;
        },

        _init: function() {
            var widget = this;
            widget._super("_init");
        },

        _setOptions: function(options) {
            var widget = this;

            widget._super(options);
            widget._create();

            return this;
        },

        /** Put text or elements into summary line. */
        _updateSummary: function(elements) {
            var widget = this;

            if (typeof elements === "string") {
                elements = $("<span>").text(elements);
            }
            widget.esummary.empty().append(elements);
        },

        /** Remove overlay previously added with _overlayContentWith. */
        _removeOverlay: function() {
            var widget = this;

            widget.ediv.find(".ua-overlay-background").remove();
            widget.ediv.find(".ua-overlay-foreground").remove();
        },

        /**
         * Dim the main content section of the table and display a message
         * overlayed in front of it.
         */
        _overlayContentWith: function(elements) {
            var widget = this;

            if (!widget.econtents.is(':parent')) {
                /* Empty contents. Nothing to overlay! In such case, fill it
                 * with a placeholder. */
                widget.econtents
                    .html("<tr class='ua-placeholder'><td></td></tr>")
                    .find('td')
                    .attr('colspan', widget._columnCount());
            }
            var bg = widget.ediv.find(".ua-overlay-background");
            if (bg.length === 0) {
                bg = $("<div class='ua-overlay-background'>").hide();
                widget.ediv.append(bg);
            }
            var fg = widget.ediv.find(".ua-overlay-foreground");
            if (fg.length === 0) {
                fg = $("<table class='ua-overlay-foreground'>")
                    .hide()
                    .append($("<tr>")
                        .append($("<td>"))
                    );
                widget.ediv.append(fg);
            }
            fg.find("td").empty().append(elements.clone());
            bg
                .css("left", widget.econtents.position().left + 1)
                .css("top", widget.econtents.position().top + 1)
                .css("width", widget.econtents.width() - 1)
                .css("height", widget.econtents.height() - 1)
                .fadeIn('slow');
            fg.delay(200).each(function() {

                /* Foreground is shown after the background animation is finished.
                 * However, overlay might have been removed before the animation
                 * could finish. This method is called either way! */

                if (!$.contains(document.documentElement, bg[0])) {
                    /* bg was removed from DOM. */
                    return;
                }
                fg
                    .css(widget.econtents.position())
                    .css("width", widget.econtents.width())
                    .css("height", widget.econtents.height())
                    .fadeIn(500);
            });
        },

        /**
         * Return POST parameters consisting of widget.options.params extended
         * with proper num/start/order_by.
         */
        _constructMethodParameters: function() {
            var widget = this;
            return $.extend({}, widget.options.params, {
                'order_by': _orderRulesToString(widget.currentOrder),
                'start': widget.currentOffset,
                'num': widget.options.pageLength
            });
        },

        /**
         * Refresh ascending/descending icons in widget.esorters, based on
         * widget.currentOrder.
         */
        _refreshSorterImages: function() {
            var widget = this;

            var first;
            if (widget.currentOrder.length > 0) {
                first = widget.currentOrder[0];
            } else {
                /* A fake element, to make the iteration work. */
                first = {column: "", ascending: true};
            }
            widget.esorters.each(function() {
                /* coldata is being initialized during the init method. */
                var coldata = $(this).data(NS);
                if (coldata.orderRules[0].column == first.column) {
                    coldata.img.attr("class", first.ascending ? 'ua-ascending' : 'ua-descending');
                    $(this).closest("td").addClass("ua-sorted-by");
                } else {
                    coldata.img.removeClass("ua-ascending ua-descending");
                    $(this).closest("td").removeClass("ua-sorted-by");
                }
            });
        },

        _destroy: function() {
            var widget = this;

            widget.destroyed = true;
            widget.stateCoordinator.destroy();
            widget.element.empty();
            widget._super("_destroy");
        }
    });

})(jQuery);
