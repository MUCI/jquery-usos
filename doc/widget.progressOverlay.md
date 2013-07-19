usosProgressOverlay widget
==========================

Display a progress indicator over an element. Good for background loading/saving.

Screenshot
----------

![Screenshot](http://i.imgur.com/mtlRYQ4.png)

Demos
-----

  * [usosProgressOverlay widget Demo](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/widget.progressOverlay)

Example
-------

```javascript
var request = $.ajax(...);
$('#someElement').usosProgressOverlay();
request.always(function() {
	$('#someElement').usosProgressOverlay('destroy');
}).done(function(result) {
	$('#someElement').text(/* ... */);
});
```

Options
-------

  * `type` - either `loading` (default) or `saving`, may influence some display
    properties,
  * `delay` - default 300, the amount of time after which the overlay is
    *starting* to be displayed.
  * `opacity` - default 0.8, the maximum opacity of the overlay (after it is
    fully shown.
  * `fadeDuration` - default 300, duration of the fading animation. 

Methods
-------

  * `destroy()` - call this once the loading/saving is finished.