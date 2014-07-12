$(function() {
    $.usosCore.init({
        usosAPIs: {
            'default': {
                'methodUrl': "https://usosphp.mimuw.edu.pl/~rygielski/usosweb/usosapiProxy.php?_method_=%s"
            }
        }
    });

    $(function() {
        $.usosCore.usosapiFetch({
            method: "services/apiref/method_index"
        }).done(function(list) {
            $("#result").text(list.length + " methods.");
        }).fail(function() {
            /* Cross-origin requests in usosapiProxy.php will work only
             * if both DEBUG flag and $debugUser field are set! */
            $("#result").text("Failed to access usosapiProxy.php. Is $debugUser set?");
        });
    });
});
