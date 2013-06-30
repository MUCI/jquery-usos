/* Cross-origin requests for usosapiProxy.php will work only
 * if both DEBUG is not and $debugUser is set. */
				 
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
