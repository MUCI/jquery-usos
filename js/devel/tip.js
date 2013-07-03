(function($) {
	
	"use strict";
	
	var NS = "usosTip";
	
	/**
	 * Convert a "non-function" content parameter (passed as the "content"
	 * option) to jQuery elementset.
	 */
	var _getContentFromNonfunction = function(obj) {
		var $content;
		if (obj instanceof $) {
			/* jQuery elementset */
			$content = obj;
		} else if (obj.pl || obj.en) {
			/* LangDict. */
			$content = $.usosCore.lang({
				langdict: obj,
				format: "jQuery"
			});
		} else {
			$content = $("<span>").html(obj);
		}
		
		/* We need to guess a proper max-width for the given content. We'll
		 * use simple heuristics, based on the length of the text given. */
		
		var len = $content.text().length;
		var maxWidth;
		if (len < 30) {
			maxWidth = "auto";
		} else if (len < 300) {
			maxWidth = "300px";
		} else if (len < 1200) {
			/* We don't want it to be too high, so it is better to make it wider. */
			var scale = 1.0 - ((1200 - len) / 900.0);
			maxWidth = (300 + 300 * scale) + "px";
		} else {
			maxWidth = "600px";
		}
		return $("<div>")
			.append($content)
			.css("max-width", maxWidth);
	};
	
	var _formatContentForTooltipster = function($content) {
		return $("<div>").append($content).html();
	};
	
	/**
	 * Options:
	 * 
	 * content - LangDict or jQuery elementset or a function.
	 * 
	 * If content is a function F, then F should *return* a Promise object which
	 * - when it's done - should return a LangDict or jQuery elementset. F will
	 * be called at most once (only if tooltip is about to be displayed), in the
	 * context ("this") of the jQuery-wrapped tooltip's DOM element.
	 * 
	 * position - left, right, top, bottom.
	 */
	var create = function(options) {
		
		var $this = $("<div class='ua-tip'><div/></div>");

		var mydata = {};
		$this.data(NS, mydata);
		mydata.settings = $.extend({}, {
			content: null,
			position: "top"
		}, options);
		
		var content = null;
		var contentProvider = null;
		if (typeof mydata.settings.content === 'function') {
			content = $.usosCore.lang("Wczytywanie...", "Loading...");
			contentProvider = mydata.settings.content;
		} else {
			content = _getContentFromNonfunction(mydata.settings.content);
		}
		mydata.$img = $this.find('div');
		mydata.$img
			.tooltipster({
				content: _formatContentForTooltipster(content),
				delay: contentProvider ? 200 : 0,
				speed: 0,
				position: mydata.settings.position,
				theme: "ua-tooltip ua-tooltip-info",
				functionReady: function() {
					if (contentProvider === null) {
						return;
					}
					var promise = contentProvider.apply($this);
					contentProvider = null;  // so it will get called once only
					promise.done(function(obj) {
						var newContent = _getContentFromNonfunction(obj);
						mydata.$img.tooltipster('update', _formatContentForTooltipster(newContent));
					}).fail(function() {
						var $newContent = $("<div>").text($.usosCore.lang(
							"Nie udało się załadować treści podpowiedzi. " +
							"Odśwież stronę i spróbuj ponownie.",
							"Could not load the content of the tip. " +
							"Refresh the page and try again."
						));
						$newContent.css("max-width", "200px");
						mydata.$img.tooltipster('update', _formatContentForTooltipster($newContent));
					});
				}
			})
			.attr("tabindex", 0)
			.focus(function() {
				$(this).tooltipster('show');
			})
			.blur(function() {
				$(this).tooltipster('hide');
			});
		
		return $this;
	};
	
	/* Static methods. */
	
	$.usosTip = {
		create: create
	};
	
})(jQuery);
