$(function() {
    $.usosCore.init({
        langpref: "pl",
        usosAPIs: {
            'default': {
                'methodUrl': "https://public.usos.edu.pl/jquery-usos/proxy/usosapiProxy.php?_method_=%s"
            }
        }
    });

    $(function() {
        $.usosCore.usosapiFetch({
            method: 'services/fac/search',
            params: {
                lang: "pl",
                query: "matemat",
                fields: "id|name"
            }
        }).done(function(response) {
            $.each(response.items, function(_, fac) {
                $('#result').append($('<li>').html($.usosEntity.label('entity/fac/faculty', fac)));
            });
        });
    });
});
