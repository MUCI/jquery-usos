(function($) {

    "use strict";

    var NS = "usosBadge";

    var FN = {

        /* Public usosBadge methods. */

        option: $.usosCore._methodForwarder("usosBadge", "option", "setter"),
        destroy: $.usosCore._methodForwarder("usosBadge", "destroy", "setter")
    };

    var init = function(options) {

        /* Extract the entity code and create the proper widget
         * based on it. */

        var entityDef = $.usosEntity._get(options.entity);
        if (!entityDef.initBadge.call(this, options)) {
            throw "Badge not implemented for this entity: " + options.entity;
        }
        return this;
    };

    $.fn[NS] = function(method) {
        if (FN[method]) {
            return FN[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if ((typeof method === 'object') || (!method)) {
            return init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.' + NS);
        }
    };

})(jQuery);
