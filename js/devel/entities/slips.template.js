(function($) {

    var MYCODE = "entity/slips/template";

    $.usosEntity._register({

        entityCode: MYCODE,
        primaryKeyFields: ["template_id"],

        getLabel: function(tpl) {
            var e = $.usosUtils.requireFields(tpl, "id|name");
            return $("<span>").text($.usosCore.lang(e.name));
        },

        initBadge: function(options) {
            return false;
        }
    });

})(jQuery);
