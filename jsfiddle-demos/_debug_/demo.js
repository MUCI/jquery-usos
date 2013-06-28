$(function() {
	$.usosCore.init({
		usosAPIs: {
			'default': {
				'methodUrl': "http://xusosweb.rygielski.net/usosapiProxy.php?method=%s"
			}
		}
	});

	$.usosCore.usosapiFetch({
		method: "services/apiref/method_index",
		success: function(list) {
			$("#result").text(list.length + " methods.");
		}
	});
});
