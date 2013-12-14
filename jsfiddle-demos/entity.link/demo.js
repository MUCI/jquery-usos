$(function() {
	$.usosCore.init({
		langpref: "pl",
		usosAPIs: {
			'default': {
				'methodUrl': "https://public.usos.edu.pl/jquery-usos/proxy/usosapiProxy.php?_method_=%s"
			}
		},
		entityURLs: {
			'entity/fac/faculty': "http://example.com/faculty/${fac_id}"
		}
	});

	$(function() {
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
});
