$(function() {
    $.usosCore.init({
        langpref: "pl",
        entityURLs: {
            'entity/fac/faculty': "http://example.com/faculty/${fac_id}"
        }
    });

    $(function() {
        $('#result').text($.usosEntity.url('entity/fac/faculty', '10000000'));
    });
});
