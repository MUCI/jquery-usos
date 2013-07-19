$(function() {
	$.usosCore.init({
		langpref: "pl",
		usosAPIs: {
			'default': {
				'methodUrl': "http://apps.usos.edu.pl/%s"
			}
		}
	});
	$.usosCore.usosapiFetch({
		method: 'services/fac/search',
		params: {
			lang: "pl",
			query: "matemat",
			fields: "id|name"
		}
	}).done(function(response) {
		$.each(response.items, function(_, fac) {
			$('#result').append($('<li>').html($.usosEntity.label('entity/fac/faculty', fac)));
		});
	});
});
