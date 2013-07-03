(function($) {
	
	"use strict";
	
	var NS = "usosUtils";
	
	/**
	 * Filter the fields inside the object based on the given fields description
	 * (in the same format as in the USOS API "fields" parameter). Log an error
	 * if required field is not found (used for deep-checking required
	 * parameters).
	 * 
	 * Example:
	 * requireFields({a: {b: 3, c: 2}, b: 1, c: 1}, "a[c]|c") -> {a: {c: 2}, c: 1}.
	 */
	var requireFields = function() {
		
		/**
		 * Check if given path is defined within an object and return the value
		 * stored at this path. E.g. within:
		 *   {a: {b: 3, c: 2}}
		 * four paths are defined:
		 *   [], ["a"], ["a", "b"], ["a", "c"].
		 */
		var _getPath = function(obj, path) {
			var ref = obj;
			$.each(path, function(_, e) {
				ref = ref[e];
				if (typeof ref === "undefined")
					return ref;
			});
			return ref;
		};
		
		/**
		 * Store the value at the given path within the obj.
		 */
		var _setPath = function(obj, path, value) {
			var ref = obj;
			var last = path.length - 1;
			$.each(path, function(i, e) {
				if (i == last) {
					ref[e] = value;
				} else {
					if (typeof ref[e] === "undefined") {
						ref[e] = {};
					}
					ref = ref[e];
				}
			});
		};
		
		return function(obj, fieldsDesc) {
			var newObj = {};
			var dfsPath = [];
			var field = "";
			var s = fieldsDesc + "$";
			for (var i=0; i<s.length; i++) {
				var c = s.charAt(i);
				if (c == "[" || c == "]" || c == "|" || c == "$") {
					dfsPath.push(field);
					var x = null;
					if (field !== "") {
						x = _getPath(obj, dfsPath);
						if (typeof x === "undefined") {
							$.usosCore._console.error("Required field " + dfsPath.join(".") + " not found.");
						}
					}
					if (c == "[") {
						// nothing!
					} else if (c == "|" || c == "$") {
						if (field !== "") {
							_setPath(newObj, dfsPath, x);
						}
						dfsPath.pop();
					} else if (c == "]") {
						if (field !== "") {
							_setPath(newObj, dfsPath, x);
						}
						dfsPath.pop();
						dfsPath.pop();
					}
					field = "";
				} else {
					field += c;
				}
			}
			return newObj;
		};
	}();

	var makeParagraphs = function(s) {
		var pars = s.split(/[\r\n]{2,}/);
		var $result = $("<div>");
		$.each(pars, function(_, par) {
			$result.append($("<p>").text(par));
		});
		return $result.children();
	};
	
	$[NS] = {
		requireFields: requireFields,
		makeParagraphs: makeParagraphs
	};
	
})(jQuery);
