$.usosCore.init();

$(function () {
    $('input').click(function () {
        if ($('textarea').val()) {
            alert("OK!");
        } else {
            $('textarea').usosNotice({
                content: {
                    pl: "To pole jest wymagane!",
                    en: "This field is required!"
                }
            });
        }
    });
});
