/* WARNING: This "interface" is neither public nor backward-compatible! */

(function($) {

    var MYCODE = "entity/example/spaceship";

    $.usosEntity._register({

        entityCode: MYCODE,

        /**
         * The names of primary key "fields". The order matters. These values
         * will be used when invoking $.entity.link and when building URLs
         * based on entityURLs provided in $.usosCore.init.
         */
        primaryKeyFields: ["spaceship_id"],

        /**
         * Return a jQuery DOM element with the label for the given entity
         * instance. This is instant, not async. Assert that the instance
         * contains all the fields that you need (use
         * $.usosUtils.requireFields).
         */
        getLabel: function(spaceship) {
            var e = $.usosUtils.requireFields(spaceship, "id|name|class");
            return $("<span>")
                .text($.usosCore.lang(e.name) + " (" + e['class'] + ")");
        },

        /**
         * This is run **in context of an element**. If badge is implemented,
         * initialize it on "this" and return true. If not, do nothing and
         * return false.
         */
        initBadge: function(options) {
            return false;
        }
    });

})(jQuery);
