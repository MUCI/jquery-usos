(function($) {
	
	"use strict";
	
	var NS1 = "usosOverlays.contextMessage";
	var NS2 = "usosOverlays.progress";
	
	var _isScrolling = false;
	
	var _isScrolledIntoView = function(elem) {
		var docViewTop = $(window).scrollTop();
		var docViewBottom = docViewTop + $(window).height();
		var elemTop = $(elem).offset().top;
		var elemBottom = elemTop + $(elem).height();
		return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
	};
	
	/**
	 * Show an overlay with given error message above matched element(s).
	 */
	var showContextMessage = function(options) {
		return this.each(function() {
			var $this = $(this);
			
			/* Check if previously initialized. */
			
			if ($this.data(NS1)) {
				/* Delay execution after hide is complete. */
				$this.usosOverlays('hideContextMessage', function() {
					$this.usosOverlays('showContextMessage', options);
				});
				return;
			}
			
			/* Load settings, override with options. */
			
			var mydata = {};
			mydata.settings = $.extend({}, {
				type: null,
				message: null,
				scrollToBeVisible: true
			}, options);
			if (mydata.settings.type !== 'error') {
				$.usosCore.console.error("Message type must equal 'error'.");
				return;
			}
			if (mydata.settings.message === null) {
				$.usosCore.console.error("Message parameter is missing.");
				return;
			}
			$this.data(NS1, mydata);
			
			mydata.$error = $("<div>")
				.addClass("ua-container")
				.addClass("ua-form-error")
				.css("opacity", ".1")
				.text(mydata.settings.message);
			$('body').append(mydata.$error);
			mydata.$error.position({
				my: "center-20 bottom-3",
				at: "right top",
				of: $this,
				using: function(position, feedback) {
					$(this).css(position);
					$("<div>")
						.addClass("ua-form-error-arrow")
						.addClass(feedback.vertical)
						.addClass(feedback.horizontal)
						.appendTo(this);
				}
			});
			mydata.$error.click(function() {
				/* When the user clicks the error message, we want to focus on the
				 * errornous field. However, we don't know if $this is focusable.
				 * That's why we will first try to find focusable elements "below" it. */
				
				var $tmp = $this.find("input:visible, select:visible, textarea:visible");
				if ($tmp.length === 0) {
					$this.trigger('focus');
				} else if ($tmp.length == 1) {
					$tmp.trigger('focus');
				} else {
					/* Multiple focusable elements found. Trigger nothing, but hide
					 * the error (usually hiding is triggered after the focus is gained). */
					
					$this.usosOverlays("hideContextMessage");
				}
			});
			
			/* We don't know if the item is focusable or not. That's why we will also
			 * try to observe all focusable items "below" it. */
			
			$this.find("input:visible, select:visible, textarea:visible").addBack()
				.on("focus." + NS1 + " keypress." + NS1 + " change." + NS1, function() {
					$this.usosOverlays("hideContextMessage");
				});
			mydata.$error.fadeTo("fast", 1.0);
			if (
				mydata.settings.scrollToBeVisible &&
				(!_isScrolledIntoView(mydata.$error)) &&
				(!_isScrolling)
			) {
				_isScrolling = true;
				$('html, body').animate({
					scrollTop: mydata.$error.offset().top - 30
				}, 500, function() {
					_isScrolling = false;
				});
			}
		});
	};
	
	/**
	 * Hide overlays previously shown with 'showContextMessage'.
	 */
	var hideContextMessage = function(callback) {
		return this.each(function() {
			var $this = $(this);
			var mydata = $this.data(NS1);
			if (!mydata)
				return;
			mydata.$error.unbind();
			$this.unbind('.' + NS1);
			$this.removeData(NS1);
			mydata.$error.fadeTo("fast", 0, function() {
				mydata.$error.remove();
				if (callback) {
					callback();
				}
			});
		});
	};

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
		'showContextMessage': showContextMessage,
		'hideContextMessage': hideContextMessage,
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
