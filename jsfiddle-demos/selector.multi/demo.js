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
		entity: "entity/courses/course",
		width: "450px",
		multi: true,
		value: ["1000-412SOP"]
	});
	$('#course').on("usosselector:change", function () {
		$('#result').text(JSON.stringify($(this).usosSelector('value')));
	});
});
