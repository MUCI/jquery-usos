$(function() {
	$.usosCore.init({
		langpref: 'pl',
		usosAPIs: {
			'default': {
				'methodUrl': "http://apps.usos.edu.pl/%s"
			}
		}
	});

	$('#course').usosSelector({
		entity: "course",
		width: "450px",
		multi: true,
		value: ["1000-412SOP"]
	});
	$('#course').change(function () {
		$('#result').text(JSON.stringify($(this).usosSelector('value')));
	});
});
