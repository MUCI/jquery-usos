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
		change: function () {
			$('#result').text(JSON.stringify($(this).usosSelector('value')));
		}
	});
});
