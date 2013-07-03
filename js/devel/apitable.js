(function($) {
	
	"use strict";
	
	var NS = "usosApiTable";
	
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
	 * Refresh ascending/descending icons in mydata.elements.$sorters,
	 * based on mydata.currentOrder.
	 */
	var _refreshSorterImages = function(mydata) {
		var first;
		if (mydata.currentOrder.length > 0) {
			first = mydata.currentOrder[0];
		} else {
			/* A fake element, to make the iteration work. */
			first = {column: "", ascending: true};
		}
		mydata.elements.$sorters.each(function() {
			/* coldata is being initialized during the init method. */
			var coldata = $(this).data(NS);
			if (coldata.orderRules[0].column == first.column) {
				coldata.$img.attr("class", first.ascending ? 'ua-ascending' : 'ua-descending');
				$(this).closest("td").addClass("ua-sorted-by");
			} else {
				coldata.$img.removeClass("ua-ascending ua-descending");
				$(this).closest("td").removeClass("ua-sorted-by");
			}
		});
	};
	
	/**
	 * Return POST parameters consisting of mydata.settings.params extended
	 * with proper num/start/order_by.
	 */
	var _constructMethodParameters = function(mydata) {
		return $.extend({}, mydata.settings.params, {
			'order_by': _orderRulesToString(mydata.currentOrder),
			'start': mydata.currentOffset,
			'num': mydata.settings.pageLength
		});
	};
	
	/**
	 * Create UI elements based on settings. Return jQuery collection of
	 * elements to be appended to the UI root.
	 */
	var _createUiElements = function(settings) {
		var $div = $("<div>")
			.addClass("ua-container")
			.addClass("ua-table-container");
		var $table = $("<table>").addClass("ua-table");
		if (settings.nowrap) {
			$table.addClass("ua-ellipsis-tds");
		}
		$div.append($table);
		var $thead = _createDefaultThead(settings);
		$table.append($thead);
		var $tbody = $("<tbody>").addClass("ua-contents");
		$table.append($tbody);
		var $tfoot = _createDefaultTfoot(settings);
		$table.append($tfoot);
		return $div;
	};
	
	/**
	 * Create default THEAD based on settings.
	 */
	var _createDefaultThead = function(settings) {
		var $thead = $("<thead>");
		var $tr = $("<tr>");
		$thead.append($tr);
		$.each(settings.columns, function(index, column) {
			var $td = $("<td>");
			if (column.width) {
				$td.css("width", column.width);
			}
			if (column.align) {
				$td.css("text-align", column.align);
			}
			if (column.sortable) {
				$td.addClass("ua-sortable");
				$td.append($("<a>")
					.attr("tabindex", 0)
					.addClass("ua-sorter")
					.attr("data-ua-fields", column.field)
					.html(column.label)
				);
			} else {
				$td.addClass("ua-nonsortable");
				$td.html(column.label);
			}
			if (column.cssClass) {
				$.each(column.cssClass.split(" "), function(index, cls) {
					if (cls) {
						$td.addClass(cls);
					}
				});
			}
			$tr.append($td);
		});
		if (settings.actions.length > 0) {
			$tr.append($("<td>")
				.addClass("ua-nonsortable")
				.addClass("ua-actions")
				.css("width", (1 + settings.actions.length*19) + "px")
			);
		}
		return $thead;
	};
	
	/**
	 * Get the total number of columns to be displayed in the table.
	 * The parameter is NOT mydata, it is the one from mydata.settings.
	 */
	var _columnCount = function(settings) {
		var count = settings.columns.length;
		if (settings.actions.length > 0) {
			count++;
		}
		return count;
	};
	
	/**
	 * Dim the main content section of the table and display a message
	 * overlayed in front of it.
	 */
	var _overlayContentWith = function(mydata, $elements) {
		if (!mydata.elements.$contents.is(':parent')) {
			/* Empty contents. Nothing to overlay! In such case, fill it
			 * with a placeholder. */
			mydata.elements.$contents
				.html("<tr class='ua-placeholder'><td></td></tr>")
				.find('td')
				.attr('colspan', _columnCount(mydata.settings));
		}
		var $bg = mydata.elements.$div.find(".ua-overlay-background");
		if ($bg.length === 0) {
			$bg = $("<div>").addClass("ua-overlay-background").hide();
			mydata.elements.$div.append($bg);
		}
		var $fg = mydata.elements.$div.find(".ua-overlay-foreground");
		if ($fg.length === 0) {
			$fg = $("<table>")
				.addClass("ua-overlay-foreground")
				.hide()
				.append($("<tr>")
					.append($("<td>"))
				);
			mydata.elements.$div.append($fg);
		}
		$fg.find("td").empty().append($elements.clone());
		$bg
			.css("left", mydata.elements.$contents.position().left + 1)
			.css("top", mydata.elements.$contents.position().top + 1)
			.css("width", mydata.elements.$contents.width() - 1)
			.css("height", mydata.elements.$contents.height() - 1)
			.fadeIn('slow');
		$fg.delay(200).each(function() {
			
			/* Foreground is shown after the background animation is finished.
			 * However, overlay might have been removed before the animation
			 * could finish. This method is called either way! */
			
			if (!$.contains(document.documentElement, $bg[0])) {
				/* $bg was removed from DOM. */
				return;
			}
			$fg
				.css(mydata.elements.$contents.position())
				.css("width", mydata.elements.$contents.width())
				.css("height", mydata.elements.$contents.height())
				.fadeIn(500);
		});
	};
	
	/** Remove overlay previously added with _overlayContentWith. */
	var _removeOverlay = function(mydata) {
		mydata.elements.$div.find(".ua-overlay-background").remove();
		mydata.elements.$div.find(".ua-overlay-foreground").remove();
	};
	
	/**
	 * Create default TFOOT based on settings.
	 */
	var _createDefaultTfoot = function(settings) {
		var $tfoot = $("<tfoot>")
			.append($("<tr>")
				.append($("<td>")
					.attr("colspan", _columnCount(settings))
					.append($("<table>")
						.css("width", "100%")
						.append($("<tr>"))
					)
				)
			);
		$tfoot.find("table tr")
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
		return $tfoot;
	};
	
	/** Put text or elements into summary line. */
	var _updateSummary = function(mydata, $elements) {
		if (typeof $elements === "string") {
			$elements = $("<span>").text($elements);
		}
		mydata.elements.$summary.empty().append($elements.clone());
	};
	
	/**
	 * Create a TD for a LangDict value.
	 */
	var _langDictTdFormatter = function(value) {
		return $("<td>")
			.addClass("ua-datatype-langdict")
			.append($.usosCore.lang({
				langdict: value,
				format: "jQuery"
			}));
	};
	
	/**
	 * Create a TD for a boolean value.
	 */
	var _booleanTdFormatter = function(value) {
		var $td = $("<td>").addClass("ua-datatype-boolean");
		if (value) {
			$td
				.addClass("ua-true")
				.text($.usosCore.lang("TAK", "YES"));
		} else {
			$td
				.addClass("ua-false")
				.text($.usosCore.lang("NIE", "NO"));
		}
		return $td;
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
			$.usosCore.console.error("Could not deserialize apiTable state:", err);
			return {offset: 0, orderRules: []};
		}
	};
	
	/** Create TD element for given column definition and data row trData. */
	var _autoTdFormatter = function(trData, column) {
		if (!column.field) {
			return $("<td>").text("Missing 'field' key in column spec.");
		}
		var $td;
		var value = trData;
		$.each(column.field.split("."), function(_, key) { value = value[key]; });
		if (typeof value === 'object') {
			/* Assume it's a LangDict. */
			$td = _langDictTdFormatter(value);
		} else if (typeof value === 'number') {
			$td = $("<td>").addClass("ua-datatype-number").text(value);
		} else if (typeof value === 'string') {
			$td = $("<td>").addClass("ua-datatype-string").text(value);
		} else if (typeof value === 'boolean') {
			$td = _booleanTdFormatter(value);
		} else if (value === null) {
			$td = $("<td>")
				.append($("<span>")
					.addClass("ua-note")
					.text($.usosCore.lang("(brak danych)", "(no data)"))
				);
		} else if (value === undefined) {
			$td = $("<td>").text(
				"Missing field '" + column.field + "' in data feed."
			);
		} else {
			$td = $("<td>").text("Unknown column data type.");
		}
		return $td;
	};
	
	/**
	 * Initialize and load the first page.
	 */
	var init = function(options) {
		return this.each(function() {
			var $this = $(this);
			
			/* Check if previously initialized. */
			
			if ($this.data(NS)) {
				$this.usosApiTable('destroy');
			}
			$this.empty();
			
			/* Load settings, override with options. */
			
			var mydata = {};
			$this.data(NS, mydata);
			var defaultSettings = {
				hashParam: null,
				sourceId: "default",
				method: null,
				params: {},
				offsetReset: false,
				columns: null,
				defaultOrder: null,
				pageLength: 6,
				actions: [],
				emptyMessage: {
					pl: "Brak wyników",
					en: "No results"
				},
				nowrap: true
			};
			mydata.settings = $.extend({}, defaultSettings, options);
			
			/* Create UI elements. */
			
			$this.append(_createUiElements(mydata.settings));
			
			/* Discover, bind and extend key UI elements. */
			
			mydata.elements = {
				$root: $this,
				$div: $this.find('.ua-table-container'),
				$table: $this.find('.ua-table'),
				$summary: $this.find('.ua-summary'),
				$sorters: $this.find('.ua-sorter')
					.each(function() {
						/* Create an order indicator. Parse and store orderRules. */
						var $this = $(this);
						var $img = $("<div>").css('margin-left', '3px').hide();
						$this.after($img);
						var $loader = $("<span>").addClass("ua-loading").hide();
						$img.after($loader);
						$this.data(NS, {
							$img: $img,
							$loader: $loader,
							orderRules: _orderRulesFromString($this.attr('data-ua-fields'))
						});
						/* If this sorter is inside the header, make the whole TD clickable. */
						if ($this.parent().hasClass("ua-sortable")) {
							$this.parent().click(function() {
								$this.trigger('click');
							});
						}
					})
					.click(function() {
						/* Sorter clicked. We need to construct new order. */
						if (!mydata.initialized) {
							/* The object is not yet properly initialized. */
							return;
						}
						var coldata = $(this).data(NS);
						/* Hide other loading indicators. Show this one. */
						mydata.elements.$table.find("thead .ua-loading").hide();
						coldata.$loader.show();
						var clickedColumns = $.map(
							coldata.orderRules,
							function(e, i) { return e.column; }
						);
						mydata.currentOffset = 0;
						var ascending = true;
						if (
							mydata.currentOrder.length > 0 &&
							mydata.currentOrder[0].column == clickedColumns[0] &&
							mydata.currentOrder[0].ascending === true
						) {
							ascending = false;
						}
						var references = [];
						var newRules = [];
						var i;
						for (i=0; i<mydata.currentOrder.length; i++) {
							if ($.inArray(mydata.currentOrder[i].column, clickedColumns) != -1)
								references[mydata.currentOrder[i].column] = mydata.currentOrder[i];
							else
								newRules.push(mydata.currentOrder[i]);
						}
						var prefixRules = [];
						for (i=0; i<clickedColumns.length; i++) {
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
						for (i=0; i<newRules.length; i++)
							newOrder.push(newRules[i]);
						mydata.stateCoordinator.setState(_serializeState({
							orderRules: newOrder,
							offset: 0
						}));
						return false;
					})
					.keypress(function(e){
						if (e.which == 13) { $(this).click(); }
					}),
				$contents: $this.find('.ua-contents'),
				$prevPage: $this.find('.ua-prevpage')
					.click(function() {
						$(this).button("disable");
						mydata.stateCoordinator.setState(_serializeState({
							offset: mydata.currentOffset - mydata.settings.pageLength,
							orderRules: mydata.currentOrder
						}));
					}),
				$nextPage: $this.find('.ua-nextpage')
					.click(function() {
						$(this).button("disable");
						mydata.stateCoordinator.setState(_serializeState({
							offset: mydata.currentOffset + mydata.settings.pageLength,
							orderRules: mydata.currentOrder
						}));
					})
			};
			
			/* This is used for syncing requests sent and responses received. */
			
			mydata.syncObject = {};

			/* Find default action. */
			
			mydata.defaultAction = null;
			$.each(mydata.settings.actions, function(_, action) {
				if (action.isDefault) {
					if (mydata.defaultAction) {
						$.usosCore.console.error("More than one default action defined.");
						return false;  // breaks the loop
					}
					mydata.defaultAction = action;
				}
			});
			
			/* Reset UI. Refresh current order rules. */
			
			mydata.currentOrder = null;
			mydata.currentOffset = 0;
			
			/* Read current state. Our state coordinator decides on the current
			 * state (it *might* choose to use the default one, but sometimes it
			 * does not). Note that onStateChanged will be executed during the
			 * construction. */
			
			var defaultState = _serializeState({
				offset: 0,
				orderRules: _orderRulesFromString(mydata.settings.defaultOrder)
			});
			var onStateChanged = function(serializedState) {
				mydata.initialized = true;
				var newState = _unserializeState(serializedState);
				mydata.currentOrder = newState.orderRules;
				mydata.currentOffset = newState.offset;
				$this.usosApiTable('reload');
			};
			if (mydata.settings.hashParam) {
				mydata.stateCoordinator = new UrlHashStateCoordinator(
					mydata.settings.hashParam, defaultState, onStateChanged
				);
			} else {
				mydata.stateCoordinator = new InvisibleStateCoordinator(
					defaultState, onStateChanged
				);
			}
			
			/* Offset reset is done at most once, during init. */
			
			if (mydata.settings.offsetReset) {
				var state = _unserializeState(mydata.stateCoordinator.getState());
				state.offset = 0;
				mydata.stateCoordinator.setState(_serializeState(state));
			}
		});
	};

	/**
	 * Reload the current page.
	 */
	var reload = function() {
		return this.each(function() {
			var $this = $(this);
			var mydata = $this.data(NS);
			$.usosCore.console.log("Reloading with order " + _orderRulesToString(mydata.currentOrder) + "...");
			_refreshSorterImages(mydata);
			_overlayContentWith(mydata, $("<span>").addClass("ua-loading"));
			_updateSummary(mydata, $("<span>")
				.addClass("ua-loading")
				.text($.usosCore.lang("Wczytywanie...", "Loading..."))
			);
			$.usosCore.usosapiFetch({
				sourceId: mydata.settings.sourceId,
				method: mydata.settings.method,
				params: _constructMethodParameters(mydata),
				syncMode: "receiveLast",
				syncObject: mydata.syncObject,
				success: function(data) {
					if (mydata.destroyed) {
						return;
					}
					mydata.elements.$contents.empty();
					$.each(data.items, function(trIndex, trData) {
						var $tr = $("<tr>");
						$tr.data(NS, trData);
						$.each(mydata.settings.columns, function(tdIndex, column) {
							var $td;
							if (column.customTdFormatter) {
								$td = column.customTdFormatter(trData);
							} else {
								$td = _autoTdFormatter(trData, column);
							}
							/* Apply css classes from column.cssClass. */
							if (column.cssClass) {
								$.each(column.cssClass.split(" "), function(index, cls) {
									if (cls) {
										$td.addClass(cls);
									}
								});
							}
							/* Apply text align from column.align. */
							if (column.align) {
								$td.css("text-align", column.align);
							}
							/* Apply overflow handler, if needed. */
							if (mydata.settings.nowrap) {
								$td.on("mouseenter", function() {
									var $this = $(this);
									if ($this.attr('title')) {
										return;
									}
									
									var ellipsisShown = false;
									
									/* There is a much faster way for Chrome, but we need this to
									 * work on Firefox too. http://goo.gl/HIZkZ */
	
									var $e = $this
										.clone()
										.css({
											display: 'inline',
											width: 'auto',
											visibility: 'hidden'
										})
										.appendTo('body');
									ellipsisShown = $e.width() > $this.width();
									$e.remove();
	
									if (ellipsisShown) {
										$this.attr('title', $this.text());
									}
								});
							}
							$tr.append($td);
						});
						if (mydata.settings.actions.length > 0) {
							var $actionsTd = $("<td>").addClass("ua-actions");
							$.each(mydata.settings.actions, function(_, action) {
								var $div = $("<a>")
									.attr("tabindex", 0)
									.addClass("ua-action-icon")
									.append($("<div>")
										.addClass("ui-icon")
										.addClass(action.iconClass)
									)
									.attr("title", action.label)
									.click(function() {
										action.click(trData);
										return false;
									})
									.keypress(function(e){
										if (e.which == 13) { $(this).click(); }
									});
								if ((action.isVisible) && (!action.isVisible(trData))) {
									$div.css("visibility", "hidden");
								}
								$actionsTd.append($div);
							});
							$tr.append($actionsTd);
						}
						mydata.elements.$contents.append($tr);
					});
					/* Apply hover/click actions. */
					if (mydata.defaultAction) {
						mydata.elements.$contents.find("tr")
							.hover(
								function() { $(this).addClass("ua-hovered"); },
								function() { $(this).removeClass("ua-hovered"); }
							)
							.click(function() {
								mydata.defaultAction.click($(this).data(NS));
							});
					}
					/* Next/Prev buttons */
					mydata.elements.$nextPage.button(data.next_page ? "enable" : "disable");
					mydata.elements.$prevPage.button(mydata.currentOffset > 0 ? "enable" : "disable");
					/* Make the columns resizable. */
					mydata.elements.$table.colResizable({
						liveDrag: true,
						headerOnly: true
					});
					/* Remove all progress indicators. */
					mydata.elements.$table.find("thead .ua-loading").hide();
					_removeOverlay(mydata);
					/* Update the summary. */
					if (mydata.currentOffset + data.items.length === 0) {
						/* No data to display. */
						var $span = $("<span>")
							.html($.usosCore.lang(mydata.settings.emptyMessage));
						_overlayContentWith(mydata, $span);
						_updateSummary(mydata, "");
					} else {
						_updateSummary(mydata,
							$.usosCore.lang("Pokazywane elementy ", "Showing items ") +
							(mydata.currentOffset + 1) + ".." +
							(mydata.currentOffset + data.items.length)
						);
					}
				},
				error: function(xhr, errorCode, errorMessage) {
					var $errorSpan = $("<span>")
						.html($.usosCore.lang(
							"Wystąpił błąd podczas wczytywania. Spróbuj odświeżyć stronę (F5).",
							"There was an error while loading. Try to refresh the page (F5)."
						));
					_overlayContentWith(mydata, $errorSpan);
					_updateSummary(mydata, $errorSpan.clone(true));
					mydata.elements.$table.find("thead .ua-loading").hide();
				}
			});
		});
	};
	
	/**
	 * Release all handles and unbind all events.
	 */
	var destroy = function() {
		return this.each(function() {
			var $this = $(this);
			var data = $this.data(NS);
			data.destroyed = true;
			data.stateCoordinator.destroy();
			data.elements.$root.find("*").addBack().unbind();
			$this.removeData(NS);
		});
	};
	
	var PUBLIC = {
		'init': init,
		'reload': reload,
		'destroy': destroy
	};

	$.fn.usosApiTable = function(method) {
		if (PUBLIC[method]) {
			return PUBLIC[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if ((typeof method === 'object') || (!method)) {
			return init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.' + NS);
		}
	};
	
})(jQuery);
