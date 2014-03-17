(function($) {

    "use strict";

    var NS = "usosEntity";

    var _entdefs = {};
    /**
     * Register a new entity. Should be a subclass of entities/base.js.
     */
    var _register = function(entityDefinition) {
        _entdefs[entityDefinition.entityCode] = entityDefinition;
    };

    /**
     * Get the definition instance, or throw exception (if the code was not
     * registered).
     */
    var _get = function(entityCode) {
        if (_entdefs.hasOwnProperty(entityCode)) {
            return _entdefs[entityCode];
        } else {
            throw "Unknown entityCode: " + entityCode;
        }
    };

    var _getEntityURL = function(entityCode) {
        var args = arguments;
        var entity = _get(entityCode);
        var dict = {};
        var lst = [];
        var add = function(name, value) {
            dict[name] = value;
            lst.push(value);
        };
        $.each(entity.primaryKeyFields, function(i, name) {
            add(name, args[i+1]);
        });
        var url = $.usosCore._getSettings().entityURLs[entityCode];
        if (typeof url === "null") {
            // No URL.
        } if (typeof url === "function") {
            url = url.apply(null, lst);
            if (typeof url !== "string") {
                url = null;
            }
        } else if (typeof url === "string") {
            $.each(dict, function(name, value) {
                url = url.replace("${" + name + "}", value);
            });
        }
        return url;
    };

    var _getEntityLabel = function(withLink, args) {

        var entityCode = args[0];
        var entityData = args[1];

        if ((entityData === null) || (entityData === undefined)) {
            return $("<span class='ua-note'>").text($.usosCore.lang(
                "(brak danych)", "(no data)"
            ));
        }

        var entity = _get(entityCode);
        var label = entity.getLabel(entityData);

        if (!withLink) {
            return label;
        }

        var a = $("<a>").attr('class', 'ua-link').html(label);
        var url = _getEntityURL(entityCode, entityData.id);
        if (url) {
            a.attr("href", url);
        }
        return a;
    };

    $[NS] = {
        label: function() { return _getEntityLabel.call(null, false, arguments); },
        link: function() { return _getEntityLabel.call(null, true, arguments); },
        url: _getEntityURL,
        _register: _register,
        _get: _get
    };

})(jQuery);
