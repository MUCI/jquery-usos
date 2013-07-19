$(function () {
    $.usosCore.init();

    var fakeRequest = function () {
        /* Simulate 2 sec AJAX request. */
        var deferred = $.Deferred();
        var delay = Math.random() * 5.0;
        setTimeout(function (delay) {
            deferred.resolve();
        }, delay);
        return deferred;
    };

    $('td').each(function () {
        var self = $(this);
        self.usosProgressOverlay();
        fakeRequest()
            .always(function () {
                self.usosProgressOverlay('destroy');
            })
            .done(function (result) {
                self.text(result);
            });
    });
});