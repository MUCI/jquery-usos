$(function() {
	$.usosCore.init({
		usosAPIs: {
			'default': {
				'methodUrl': "http://apps.usos.edu.pl/%s"
			}
		}
	});

	$.usosCore.usosapiFetch({
		method: "services/apiref/method_index"
	}).done(function(list) {
		$.each(list, function(_, method) {
			$('#methods').append($("<li>").text(method.name));
		});
	}).fail($.usosCore.panic);
});
