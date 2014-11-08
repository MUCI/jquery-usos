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
        },

        getSelectorSetup: function() {
            return {
                prompt: $.usosCore.lang("Wpisz nazwę programu", "Enter a programme name"),
                search: {
                    method: 'services/progs/search',
                    paramsProvider: function(query) {
                        return {
                            lang: $.usosCore.lang(),
                            fields: 'items[match|programme[id|name|faculty[name|logo_urls[50x50]]]]|next_page',
                            query: query,
                            num: 4
                        };
                    },
                    itemsExtractor: function(data) {
                        return data.items;
                    }
                },
                get: {
                    method: 'services/progs/programmes',
                    paramsProvider: function(ids) {
                        return {
                            programme_ids: ids.join("|"),
                            fields: 'id|name'
                        };
                    },
                    itemsExtractor: function(data) {

                        /* Data contains unordered dictionary in the {programme_id: ...} format. */

                        var items = [];
                        $.each(data, function(programme_id, programme) {
                            if (programme === null) {
                                $.usosCore._console.warn("Programme " + programme_id + " not found! Will be skipped!");
                                return true; // continue
                            }
                            items.push({match: null, programme: programme});
                        });
                        return items;
                    }
                },
                idExtractor: function(item) {
                    return item.programme.id;
                },
                suggestionRenderer: function(item) {
                    var div = $(
                        "<div class='ua-programmesuggestion'><table><tr>" +
                        "<td class='ua-td1'><img/></td>" +
                        "<td class='ua-td2'><div class='ua-match'></div><div class='ua-tagline'></div></td>" +
                        "</tr></table></div>"
                    );
                    div.find(".ua-match").html(item.match);
                    div.find("img").attr("src", item.programme.faculty.logo_urls['50x50']);
                    div.find(".ua-tagline").append($("<span class='ua-note'>").text($.usosCore.lang(item.programme.faculty.name)));
                    return div;
                },
                affector: function(programme_ids) {
                    $.each(programme_ids, function(_, programme_id) {
                        $.usosCore.usosapiFetch({
                            method: "services/progs/search_history_affect",
                            params: {
                                programme_id: programme_id
                            }
                        });
                    });
                },
                tagRenderer: function(item) {
                    var name = $.usosCore.lang(item.programme.name);

                    /* Return in a block with decent max-width applied. */

                    return $('<span>')
                        .text(name)
                        /* Add .usosBadge(...) here, when implemented (align
                         * top). */
                        ;
                }
            };
        }
    });

})(jQuery);
