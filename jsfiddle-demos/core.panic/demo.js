$.usosCore.init({
	langpref: 'pl',
	usosAPIs: {
		'default': {
			'methodUrl': "http://apps.usos.edu.pl/%s"
		}
	}
});

$(function() {
	// Resize the result pane for a better view!
	$.usosCore.panic();
});
