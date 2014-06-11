$.usosCore.init({
    langpref: 'pl',
    usosAPIs: {
        'default': {
            'methodUrl': "https://public.usos.edu.pl/jquery-usos/proxy/usosapiProxy.php?_method_=%s"
        }
    }
});

$(function () {
    $("[user_id]").each(function () {
        $(this).usosBadge({
            entity: "entity/users/user",
            user_id: $(this).attr("user_id"),
            position: "top"
        });
    });
    $("[fac_id]").each(function () {
        $(this).usosBadge({
            entity: "entity/fac/faculty",
            fac_id: $(this).attr("fac_id")
        });
    });
    $("[building_id]").each(function () {
        $(this).usosBadge({
            entity: "entity/geo/building",
            building_id: $(this).attr("building_id")
        });
    });
});