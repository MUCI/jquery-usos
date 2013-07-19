$(function () {
    $.usosCore.init();

    var fakeRequest = function () {
        var deferred = $.Deferred();
        var delay = Math.floor(Math.random() * 7000);
        setTimeout(function () {
            deferred.resolve(delay + "ms");
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