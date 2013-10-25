$(function() {
	$.usosCore.init({
		debug: true  // Try setting to false.
	});

	$(function() {
		var obj = {a: {b: 3, c: 2}, b: 1, c: 1};
		var req = "a[c]|c";  // Try adding "|d".
		var result = $.usosUtils.requireFields(obj, req);
		console.log(result);
		$('#result').text(JSON.stringify(result));
	});
});
