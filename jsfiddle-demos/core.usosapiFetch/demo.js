$(function() {
    $.usosCore.init({
        usosAPIs: {
            'default': {
                'methodUrl': "https://public.usos.edu.pl/jquery-usos/proxy/usosapiProxy.php?_method_=%s"
            }
        }
    });

    $(function() {
        $.usosCore.usosapiFetch({
            method: "services/apiref/method_index"
        }).done(function(list) {
            $.each(list, function(_, method) {
                $('#methods').append($("<li>").text(method.name));
            });
        }).fail($.usosCore.panic);
    });
});
