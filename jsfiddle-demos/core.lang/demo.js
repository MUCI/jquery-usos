$(function() {
	$.usosCore.init({
		langpref: "en"
	});

	// $('#result').text($.usosCore.lang("Po polsku", "In English"));
	// $('#result').text($.usosCore.lang("Po polsku", null));
	// $('#result').text($.usosCore.lang(null, "In English"));
	// $('#result').text($.usosCore.lang(null, null));
	// $('#result').text($.usosCore.lang(null));
	// $('#result').text($.usosCore.lang("Untranslated"));
	// $('#result').text($.usosCore.lang());
	
	$('#result').html($.usosCore.lang({
		langdict: {pl: "Po <b>polsku</b>", en: null},
		format: 'jQuery.html' // also try 'jQuery.text'
	}));
});
