(function($) {
	
	"use strict";
	
	var NS2 = "usosOverlays.progress";
	
	var _findZIndex = function($node) {
		var max = 0;
		$node.parents().each(function() {
			var zIndex = parseInt($(this).css('zIndex'), 10);
			if (zIndex > max)
				max = zIndex;
		});
		return max;
	};
	
	/**
	 * Show (or hide) a simple progress indicator over the matched element(s).
	 */
	var progressIndicator = function(options) {
		return this.each(function() {
			var $this = $(this);
			var mydata = $this.data(NS2);
			if (!mydata) {
				mydata = {};
				$this.data(NS2, mydata);
				mydata.settings = {
					state: "loading",
					delay: 300,
					opacity: 0.8,
					fadeDuration: 300
				};
			}
			if (typeof options !== 'object') {
				options = {state: options};
			}
			$.extend(mydata.settings, options);
			
			/* If state is 'hide', then simply destroy all the elements (if they exist). */
			
			if (mydata.settings.state == 'hide') {
				if (mydata.$bg) {
					mydata.$bg.remove();
					mydata.$fg.remove();
					$this.removeData(NS2);
				}
				return;
			}
			
			/* Initialize $bg and $fg objects. Set proper widths and heights. */
			
			if (!mydata.$bg) {
				mydata.$bg = $("<div>")
					.addClass("ua-progressoverlay-background")
					.hide();
				$(document.body).append(mydata.$bg);
				mydata.$fg = $("<table>")
					.addClass("ua-progressoverlay-foreground")
					.hide()
					.append($("<tr>")
						.append($("<td>"))
					);
				$(document.body).append(mydata.$fg);
			}
			var $bg = mydata.$bg;
			var $fg = mydata.$fg;
			$fg.find("td").empty();
			$bg.add($fg)
				.css("z-index", _findZIndex($this))
				.css("left", $this.offset().left)
				.css("top", $this.offset().top)
				.css("width", $this.outerWidth())
				.css("height", $this.outerHeight())
				.css("opacity", mydata.settings.opacity)
				.delay(mydata.settings.delay)
				.each(function() {
					/* There is a huge probability, that the progress indicator
					 * was cancelled (hidden) before the delay had passed. Before
					 * we fadeIn, we have to verify that. */
					if ($('body').has($(this)).length > 0) {
						$(this).fadeIn(mydata.settings.fadeDuration);
					}
				});
			
			/* Based on options and/or space available, decide what to show. */
			
			var title;
			switch (mydata.settings.state) {
				case 'loading': title = $.usosCore.lang("Wczytywanie...", "Loading..."); break;
				case 'saving': title = $.usosCore.lang("Zapisywanie...", "Saving..."); break;
				case 'hide': throw("Should return eariler!");
				default: throw("Unknown state: " + mydata.settings.state);
			}
			$fg.find("td")
				.append($("<span>")
					.attr('class', 'ua-loading')
					.attr('title', title)
				);
			
			$fg.delay(mydata.settings.delay + (mydata.settings.fadeDuration / 2)).each(function() {
				
				/* Foreground is shown after the background animation is finished.
				 * However, overlay might have been removed before the animation
				 * could finish. This method is called either way! */
				
				if (!$.contains(document.documentElement, $bg[0])) {
					/* $bg was removed from DOM. */
					return;
				}
				$fg.fadeIn(mydata.settings.fadeDuration);
			});
		});
	};

	var PUBLIC = {
		'progressIndicator': progressIndicator
	};

	$.fn.usosOverlays = function(method) {
		if (PUBLIC[method]) {
			return PUBLIC[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else {
			$.error('Method ' + method + ' does not exist.');
		}
	};
	
})(jQuery);
