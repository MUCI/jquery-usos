$(function () {
    $.usosCore.init();
    $("#tip").usosTip();

    var update = function () {
        var paragraphs = $.usosUtils.makeParagraphs($('textarea').val());
        $('#result').html(paragraphs);
        $("#tip").usosTip("option", "content", paragraphs.clone());
    };

    update();
    $('textarea').on('keyup', update);
});