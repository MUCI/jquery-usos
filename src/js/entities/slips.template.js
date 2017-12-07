(function($) {

    var MYCODE = "entity/slips/template";

    $.usosEntity._register({

        entityCode: MYCODE,
        primaryKeyFields: ["tpl_id"],

        getLabel: function(tpl) {
            var e = $.usosUtils.requireFields(tpl, "id|name");
            return $("<span>").text($.usosCore.lang(e.name));
        },

        initBadge: function(options) {
            return false;
        },

        getSelectorSetup: function() {
            return {
                prompt: $.usosCore.lang("Wpisz nazwę szablonu obiegówki", "Enter a slip template name"),
                search: {
                    method: 'services/slips/search_templates',
                    paramsProvider: function(query) {
                        return {
                            'langpref': $.usosCore.lang(),
                            'fields': 'id|match|name|state',
                            'query': query
                        };
                    },
                    itemsExtractor: function(data) {
                        return data.items;
                    }
                },
                get: {
                    method: 'services/slips/templates',
                    paramsProvider: function(ids) {
                        return {
                            'tpl_ids': ids.join("|"),
                            'fields': 'id|name'
                        };
                    },
                    itemsExtractor: function(data) {
                        var items = [];
                        $.each(data, function(tpl_id, template) {
                            if (template === null) {
                                $.usosCore._console.warn("Template " + tpl_id + " not found! Will be skipped!");
                                return true; // continue
                            }
                            items.push(template);
                        });
                        return items;
                    }
                },
                idExtractor: function(item) {
                    return item.id;
                },
                suggestionRenderer: function(item) {
                    var $div = $("<div>");
                    $div.append($("<span>").html(item.match));
                    if (item.state != 'active') {
                        $div.append(" ").append($("<span class='ua-note'>").text(
                            item.state == 'draft' ?
                            $.usosCore.lang("(kopia robocza)", "(draft)") :
                            $.usosCore.lang("(przestarzały)", "(obsolete)")
                        ));
                    }
                    return $div;
                },
                tagRenderer: function(item) {
                    return $('<span>')
                        .text(item.name)
                        .click(function() {
                            var url = $.usosEntity.url('entity/slips/template', item.id);
                            if (!url) {
                                return;
                            }
                            var msg = $.usosCore.lang(
                                "Przejść do strony szablonu \"" + item.name + "\"?",
                                "Go to the \"" + item.name + "\" template page?"
                            );
                            if (confirm(msg)) {
                                document.location = url;
                            }
                        });
                }
            };
        }
    });

})(jQuery);
