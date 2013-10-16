(function($) {
	
	"use strict";
	
	var NS = "usosEntity";
	
	var _getEntityURL = function(entityCode) {
		var dict = {};
		var lst = [];
		var add = function(name, value) {
			dict[name] = value;
			lst.push(value);
		};
		switch (entityCode) {
			case 'entity/users/user':
				add("user_id", arguments[1]);
				break;
			case 'entity/fac/faculty':
				add("fac_id", arguments[1]);
				break;
			case 'entity/slips/template':
				add("tpl_id", arguments[1]);
				break;
			case 'entity/progs/programme':
				add("programme_id", arguments[1]);
				break;
			default:
				throw "Unknown entity: " + entityCode;
		}
		var url = $.usosCore._getSettings().entityURLs[entityCode];
		if (typeof url === "null") {
			// No URL.
		} if (typeof url === "function") {
			url = url.apply(null, lst);
			if (typeof url !== "string") {
				url = null;
			}
		} else if (typeof url === "string") {
			$.each(dict, function(name, value) {
				url = url.replace("${" + name + "}", value);
			});
		}
		return url;
	};
	
	var _getEntityLabel = function(withLink, args) {
		var $a;
		if (withLink) {
			$a = $("<a>").attr('class', 'ua-link');
		} else {
			$a = $("<span>");
		}
		var url;
		var e;
		var entityCode = args[0];
		if ((args[1] === null) || (args[1] === undefined)) {
			return $("<span class='ua-note'>").text($.usosCore.lang(
				"(brak danych)",
				"(no data)"
			));
		}
		switch (entityCode) {
			case 'entity/users/user':
				e = $.usosUtils.requireFields(args[1], "id|first_name|last_name");
				$a.text(e.first_name + " " + e.last_name);
				url = _getEntityURL(entityCode, e.id);
				break;
			case 'entity/fac/faculty':
			case 'entity/slips/template':
				e = $.usosUtils.requireFields(args[1], "id|name");
				$a.text($.usosCore.lang(e.name));
				url = _getEntityURL(entityCode, e.id);
				break;
			case 'entity/progs/programme':
				e = $.usosUtils.requireFields(args[1], "id|description");
				$a.text($.usosCore.lang(e.description));
				url = _getEntityURL(entityCode, e.id);
				break;
			default:
				throw "Unknown entity: " + entityCode;
		}
		if (withLink && url) {
			$a.attr("href", url);
		}
		return $a;
	};
	
	$[NS] = {
		label: function() { return _getEntityLabel.call(null, false, arguments); },
		link: function() { return _getEntityLabel.call(null, true, arguments); },
		url: _getEntityURL
	};
	
})(jQuery);
