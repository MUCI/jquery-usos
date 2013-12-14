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
		$('#course').usosSelector({
			entity: "entity/courses/course",
			// multi: true,
			// value: ["1000-412SOP"],
			// width: "450px",
			change: function () {
				$('#result').text(JSON.stringify(
					$(this).usosSelector('value')
				));
			}
		});
	});
});
