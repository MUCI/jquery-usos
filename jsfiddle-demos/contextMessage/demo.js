$(function() {
	$.usosCore.init();

	$('#button').click(function() {
		if ($('#text').val().length < 5) {
			$('#text').usosOverlays('showContextMessage', {
				type: "error",
				message: "At least 5 characters required!"
			});
		}
	});
});
