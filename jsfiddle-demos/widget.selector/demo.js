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
		// multi: true,
		// value: ["1000-412SOP"],
		change: function () {
			$('#result').text(JSON.stringify(
				$(this).usosSelector('value')
			));
		}
	});
});
