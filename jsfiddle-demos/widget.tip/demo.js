$(function() {
	$.usosCore.init();

	$(function() {
		
		/* Simplest (and most common) use case */
		
		$('#result').append($.usosWidgets.usosTip.create("Po polsku", "In English"));
		
		/* Dynamic loading */
		
		$('#result').append($.usosWidgets.usosTip.create({
			content: function() {
				/* Simulate 2 sec AJAX request. */
				var deferred = $.Deferred();
				setTimeout(function() {
					deferred.resolve({
						pl: "Wczytane dynamicznie!",
						en: "Dynamically loaded!"
					});
				}, 2000);
				return deferred;
			}
		}));
		
		/* Nonstatic constructor */
		
		var sentence = "This is a sample <b>sentence</b>. ";
		$("#result").append($("<span id='myTip'>"));
		$("#myTip").usosTip({content: sentence});
		
		/* Changing the content. */
		
		$("button").click(function () {
			var oldContent = $("#myTip").usosTip("option", "content");
			var newContent = oldContent + sentence;
			$("#myTip").usosTip("option", "content", newContent);
		});
	});
});
