$(function() {
	$.usosCore.init({
		langpref: "pl",
		usosAPIs: {
			'default': {
				'methodUrl': "http://apps.usos.edu.pl/%s"
			}
		},
		entityURLs: {
			'entity/fac/faculty': "http://example.com/faculty/${fac_id}"
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
			$('#result').append($('<li>').html($.usosEntity.link('entity/fac/faculty', fac)));
		});
	});
});
