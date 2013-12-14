$(function() {
	$.usosCore.init({
		langpref: 'pl',
		usosAPIs: {
			'default': {
				'methodUrl': "https://public.usos.edu.pl/jquery-usos/proxy/usosapiProxy.php?_method_=%s"
			}
		}
	});

	$(function() {
		// Resize the result pane for a better view!
		$.usosCore.panic();
	});
});
