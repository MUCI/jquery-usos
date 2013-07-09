$(function() {
	$.usosCore.init();
	$('#result').append($.usosTip.create("Po polsku", "In English"));
    $('#result').append($.usosTip.create({
        content: function() {
            var deferred = $.Deferred();
            setTimeout(function() {
                deferred.resolve({pl: "Wczytane!", en: "Loaded!"});
            }, 3000);
            return deferred;
        }
    }));
});
