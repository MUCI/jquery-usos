$(function() {
	$.usosCore.init({
		langpref: 'pl',
		usosAPIs: {
			'default': {
				'methodUrl': "http://apps.usos.edu.pl/%s"
			}
		}
	});

	// Resize the result pane for a better view!
	$.usosCore.panic();
});
