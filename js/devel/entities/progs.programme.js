(function($) {

    var MYCODE = "entity/progs/programme";

    $.usosEntity._register({

        entityCode: MYCODE,
        primaryKeyFields: ["programme_id"],

        getLabel: function(programme) {
            var e = $.usosUtils.requireFields(programme, "id|description");
            return $("<span>").text($.usosCore.lang(e.description));
        },

        initBadge: function(options) {
            return false;
        }

    });

})(jQuery);
