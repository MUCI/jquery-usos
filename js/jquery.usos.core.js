(function($) {
	
	"use strict";
	
	var NS = "usosCore";
	
	var mydata = {
		settings: null
	};
	
	/** Initialize core functionality used by other jquery.usos.* plugins. */
	var init = function(options) {
		
		/* Check if previously initialized. */
		
		if (mydata.settings !== null) {
			console.warning("jQuery.usosCore is already initialized! Subsequent calls to init will be ingored!");
			return;
		}
		
		/* Load settings, override with options. */
		
		var defaultSettings = {
			langpref: "en",
			usosAPIs: {
				"default": {
					methodUrl: null,  // e.g. "https://usosapps.usos.edu.pl/%s"
					extraParams: {}
				}
			}
		};
		mydata.settings = defaultSettings;
		$.extend(true, mydata.settings, options);
	};
	
	var _checkInit = function() {
		if (mydata.settings === null) {
			throw("Call jQuery.usosCore.init first!");
		}
	};
	
	/** Perform an AJAX request to USOS API method. */
	var usosapiFetch = function(opts) {
		_checkInit();
		
		var defaultOptions = {
			sourceId: "default",
			method: "method_name",
			params: {},
			syncMode: "noSync",  // "noSync", "receiveIncrementalFast", "receiveLast"
			syncObject: null,
			success: null,
			error: null
		};
		var options = defaultOptions;
		$.extend(options, opts);
		
		/* Verify params (especially those prone for spelling errors). */
		
		if (options.syncMode == "noSync") {
			if (options.syncObject !== null) {
				throw("syncObject must stay null if syncMode is 'noSync'");
			}
		} else if ((options.syncMode == "receiveLast") || (options.syncMode == "receiveIncrementalFast")) {
			if (options.syncObject === null) {
				throw("syncObject must be an object if syncMode is other than 'noSync'. Check out the docs!");
			}
		} else {
			throw("Invalid syncMode: " + options.syncMode);
		}
		
		/* If the uses a syncObject, then get the new request id. */
		
		var requestId = null;
		if (options.syncObject !== null) {
			if (typeof options.syncObject.lastIssuedRequestId === "undefined") {
				options.syncObject.lastIssuedRequestId = 0;
				options.syncObject.lastReceivedRequestId = 0;
			}
			options.syncObject.lastIssuedRequestId++;
			requestId = options.syncObject.lastIssuedRequestId;
		}
		
		/* Contruct the method URL for the given sourceId and method. */
		
		var url = mydata.settings.usosAPIs[options.sourceId].methodUrl.replace("%s", options.method);
		
		/* Append extraParams (overwrite existing params!) defined for the given sourceId. */
		
		var params = options.params;
		$.extend(params, mydata.settings.usosAPIs[options.sourceId].extraParams);
		
		/* Make the call. */
		
		$.ajax({
			type: 'POST',
			url: url,
			data: params,
			dataType: 'json',
			success: function(data, textStatus, jqXHR) {
				if (options.syncObject !== null) {
					if (options.syncObject.lastReceivedRequestId > requestId) {
						
						/* This response is overdue. We already received other response with
						 * greater requestId. We will ignore this response. */
						
						return;
					}
					if ((options.syncMode == "receiveLast")
							&& requestId < options.syncObject.lastIssuedRequestId) {
						
						/* This response is obolete. A request with greater requestId was
						 * already issued. We will ignore this response. */
						
						return;
					}
					options.syncObject.lastReceivedRequestId = requestId;
				}
				
				if (options.success !== null) {
					options.success(data, textStatus, jqXHR);
				}
			},
			error: function(xhr, errorCode, errorMessage) {
				if (options.syncObject !== null) {
					if (options.syncObject.lastReceivedRequestId > requestId) {
						/* As above. */
						return;
					}
					options.syncObject.lastReceivedRequestId = requestId;
				}
				
				if (options.error !== null) {
					options.error(xhr, errorCode, errorMessage);
				}
			}
		});
	};
	
	/** Transform a LangDict object into a text (or $span) in preferred language. */
	var langSelect = function() {
		_checkInit();
		
		if (arguments.length == 2) {
			
			/* When called with two arguments, treat as an alias to: */
			
			return langSelect({
				langdict: {
					pl: arguments[0],
					en: arguments[1]
				},
				format: "text"
			})
		}
		if (arguments.length != 1) {
			throw("Invalid arguments", arguments);
		}
		var opts = arguments[0];
		
		if (opts.pl && opts.en && !opts.langdict) {
			
			/* When called with a LangDict object, treat as an alias to: */
			
			return langSelect({
				langdict: opts,
				format: "text"
			})
		}
		
		var defaultOptions = {
			langdict: null,
			format: "text",
			langpref: "inherit"
		};
		var options = defaultOptions;
		$.extend(options, opts);
		
		if (options.langpref == "inherit") {
			options.langpref = mydata.settings.langpref;
		}
		
		var lang = options.langpref;
		var pl = options.langdict.pl;
		var en = options.langdict.en;
		
		if (options.format == "text") {
			return (lang == 'pl') ? pl : en;
		} else if (options.format == "$span") {
			var $ret = $("<span>");
			if (lang == 'pl') {
				if (pl) {
					$ret.text(pl);
				} else if (en) {
					$ret
						.append($("<span>").addClass("ua-note").text("(po angielsku)"))
						.append(" " + en);
				} else {
					$ret.append($("<span>").addClass("ua-note").text("(brak danych)"));
				}
			} else {
				if (en) {
					$ret.text(en);
				} else if (pl) {
					$ret
						.append($("<span>").addClass("ua-note").text("(in Polish)"))
						.append(" " + pl);
				} else {
					$ret.append($("<span>").addClass("ua-note").text("(unknown)"));
				}
			}
			return $ret;
		}
	};
	
	var _freezeOne = function(arg) {
		if (typeof arg === 'object') {
			return $.extend(true, {}, arg);
		} else {
			return arg;
		}
	};
	var _freezeAll = function(args) {
		var frozen = [];
		for (var i=0; i<args.length; i++) {
			frozen.push(_freezeOne(args[i]));
		}
		return frozen;
	};
	
	/** Wrapper for 'console' object. Deals with http://stackoverflow.com/questions/4057440/ */
	var fixedConsole = {
		log: function() { console.log.apply(console, _freezeAll(arguments)); },
		warn: function() { console.warn.apply(console, _freezeAll(arguments)); },
		error: function() { console.error.apply(console, _freezeAll(arguments)); }
	};
	
	/** Get the current language code. */
	var getLangPref = function() {
		_checkInit();
		return mydata.settings.langpref;
	};
	
	$.usosCore = {
		'init': init,
		'usosapiFetch': usosapiFetch,
		'getLangPref': getLangPref,
		'langSelect': langSelect,
		'console': fixedConsole
	};
	
})(jQuery);
