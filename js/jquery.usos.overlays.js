(function($) {
	
	"use strict";
	
	var NS = "usosOverlays";
	
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
			
			if ($this.data(NS)) {
				/* Delay execution after hide is complete. */
				$this.usosOverlays('hideContextMessage', function() {
					$this.usosOverlays('showContextMessage', options);
				});
				return;
			}
			
			/* Load settings, override with options. */
			
			var mydata = {};
			mydata.settings = {
				type: null,
				message: null,
				scrollToBeVisible: true
			};
			$.extend(mydata.settings, options);
			if (mydata.settings.type !== 'error') {
				$.usosCore.console.error("Message type must equal 'error'.");
				return;
			}
			if (mydata.settings.message === null) {
				$.usosCore.console.error("Message parameter is missing.");
				return;
			}
			$this.data(NS, mydata);
			
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
				$this.focus();
			});
			$this.bind("focus." + NS + " keypress." + NS + " change." + NS, function() {
				$this.usosOverlays("hideContextMessage");
			});
			mydata.$error.fadeTo("fast", 1.0);
			if (mydata.settings.scrollToBeVisible
					&& (!_isScrolledIntoView(mydata.$error))
					&& (!_isScrolling)) {
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
			var mydata = $this.data(NS);
			if (!mydata)
				return;
			mydata.$error.unbind();
			$this.unbind('.' + NS);
			$this.removeData(NS);
			mydata.$error.fadeTo("fast", 0, function() {
				mydata.$error.remove();
				if (callback) {
					callback();
				}
			});
		});
	};

	var PUBLIC = {
		'showContextMessage': showContextMessage,
		'hideContextMessage': hideContextMessage
	} 

	$.fn.usosOverlays = function(method) {
		if (PUBLIC[method]) {
			return PUBLIC[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.' + NS);
		}
	};
	
})(jQuery);
