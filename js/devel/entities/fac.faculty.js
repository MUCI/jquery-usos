(function($) {

    var MYCODE = "entity/fac/faculty";

    $.usosEntity._register({

        entityCode: MYCODE,
        primaryKeyFields: ["fac_id"],

        getLabel: function(faculty) {
            var e = $.usosUtils.requireFields(faculty, "id|name");
            return $("<span>")
                .text($.usosCore.lang(e.name))
                .usosBadge({
                    entity: MYCODE,
                    fac_id: e.id
                });
        },

        initBadge: function(options) {
            this._usosFacultyBadge(options);
            return true;
        },

        getSelectorSetup: function() {
            return {
                prompt: $.usosCore.lang("Wpisz nazwę jednostki", "Enter a faculty name"),
                search: {
                    method: 'services/fac/search',
                    paramsProvider: function(query) {
                        return {
                            'lang': $.usosCore.lang(),
                            'fields': 'id|match|name',
                            'query': query
                        };
                    },
                    itemsExtractor: function(data) {
                        return data.items;
                    }
                },
                get: {
                    method: 'services/fac/faculties',
                    paramsProvider: function(ids) {
                        return {
                            'fac_ids': ids.join("|"),
                            'fields': 'id|name'
                        };
                    },
                    itemsExtractor: function(data) {

                        /* The 'faculties' method returns an unordered dictionary of the {fac_id: faculty} form. */

                        var items = [];
                        $.each(data, function(fac_id, faculty) {
                            if (faculty === null) {
                                $.usosCore._console.warn("Faculty " + fac_id + " not found! Will be skipped!");
                                return true; // continue
                            }
                            items.push(faculty);
                        });
                        return items;
                    }
                },
                idExtractor: function(item) {
                    /* Both methods have the "id" field. */
                    return item.fac_id || item.id;
                },
                suggestionRenderer: function(item) {
                    var div = $("<div>");
                    div.html(item.match);
                    div.usosBadge({
                        entity: 'entity/fac/faculty',
                        fac_id: item.fac_id || item.id
                    });
                    return div;
                },
                tagRenderer: function(item) {

                    /* Both methods have the "name" field. */

                    var name = $.usosCore.lang(item.name);

                    /* Return in a block with decent max-width applied. */

                    return $('<span>')
                        .text(name)
                        .usosBadge({
                            entity: 'entity/fac/faculty',
                            fac_id: item.fac_id || item.id,
                            position: "top"
                        });
                }
            };
        }
    });

    $.widget('usosWidgets._usosFacultyBadge', $.usosWidgets._usosBadge, {
        options: {
            position: "top",  // overrides default "right"
            fac_id: null
        },
        widgetEventPrefix: "usosbadge:",
        _getEntityKey: function() { return ['fac_id']; },
        _cssClass: function() { return "ua-badge-fac"; },

        _fetchData2: function() {

            var widget = this;

            return $.usosCore.usosapiFetch({
                method: "services/fac/faculty",
                params: {
                    fac_id: widget.options.fac_id,
                    fields: (
                        "id|profile_url|name|phone_numbers|homepage_url|postal_address|" +
                        "path[id|profile_url|name]|" +
                        "static_map_urls[400x200]|logo_urls[100x100]|" +
                        "stats[programme_count|course_count|staff_count|public_subfaculty_count]"
                    )
                }
            });
        },

        _createBadge: function(fac) {

            /* Structure */

            var badge = $(
                "<div class='ua-container'><table>" +
                "<tr><td class='ua-stats' colspan='2'><div></div></td></tr>" +
                "<tr><td class='ua-cover' colspan='2'><div class='ua-cover-inner'><div class='ua-title'></div></div></td></tr>" +
                "<tr><td class='ua-logo'></td><td class='ua-desc'><div></div></td></tr>" +
                "</table></div>"
            );

            /* Cover image */

            if (fac.static_map_urls['400x200'] != null) {
                badge.find(".ua-cover")
                    .css("background-image", "url(" + fac.static_map_urls['400x200'] + ")");
            }

            /* Name and profile link */

            var title = badge.find('.ua-title');
            $.each(fac.path, function(_, fac) {
                title.append($("<div class='ua-ancestor'>").html(
                    $("<a>")
                        .attr("href", $.usosEntity.url("entity/fac/faculty", fac.id) || fac.profile_url)
                        .text($.usosCore.lang(fac.name))
                ));
            });
            title.append($("<div class='ua-name'>").html(
                $("<a>")
                    .attr("href", $.usosEntity.url("entity/fac/faculty", fac.id) || fac.profile_url)
                    .text($.usosCore.lang(fac.name))
            ));

            /* Stats */

            var stats = badge.find('.ua-stats div');
            var tip = $("<table class='ua-tool-num-stats'>");
            var appendStat = function(iconClass, n, pl1, pl2, pl5, en1, en2) {
                stats.append($("<div class='ua-stat-entry'>")
                    .append($("<span class='ua-icon ua-icon-16 ua-icon-inline'>").addClass(iconClass))
                    .append($("<span>").text(n))
                );
                tip.append($("<tr>")
                    .append($("<td>").text(n))
                    .append($("<td>").append($.usosCore._nlang(n, pl1, pl2, pl5, en1, en2)))
                );
            };
            appendStat(
                "ua-icon-users",
                fac.stats.staff_count,
                "pracownik", "pracowników", "pracowników",
                "staff member", "staff members"
            );
            appendStat(
                "ua-icon-library",
                fac.stats.programme_count,
                "program studiów", "programy studiów", "programów studiów",
                "study programme", "study programmes"
            );
            appendStat(
                "ua-icon-books",
                fac.stats.course_count,
                "przedmiot", "przedmioty", "przedmiotów",
                "course", "courses"
            );
            appendStat(
                "ua-icon-tree",
                fac.stats.public_subfaculty_count,
                "podjednostka", "podjednostki", "podjednostek",
                "subfaculty", "subfaculties"
            );
            stats.usosTip({
                content: tip,
                type: "tool",
                position: "left"
            });

            /* Logo */

            badge.find('.ua-logo').append($("<a>")
                .attr("href", fac.profile_url)
                .append($("<img>")
                    .attr("src", fac.logo_urls["100x100"])
                )
            );

            /* Address, phone numbers, home page */

            var desc = badge.find('.ua-desc div');
            if (fac.postal_address || (fac.phone_numbers.length > 0)) {
                var address = $("<div class='ua-address'>")
                desc.append(address);
                if (fac.postal_address) {
                    var search_url = "https://maps.google.pl/?q=" + encodeURIComponent(fac.postal_address);
                    address.append($("<span>")
                        .append($("<span>")
                            .text(fac.postal_address)
                        )
                        .append($("<a>")
                            .attr("target", "_blank")
                            .attr("href", search_url)
                            .html($("<span class='ui-icon ui-icon-extlink'></span>")
                                .usosTip({
                                    type: "tool",
                                    position: "bottom",
                                    delayed: true,
                                    content: $.usosCore.lang(
                                        "Pokaż w mapach Google",
                                        "Show in Google Maps"
                                    )
                                })
                            )
                        )
                    );
                }
                if (fac.phone_numbers.length > 0) {
                    address.append($("<span>").html(
                        "<span style='white-space: nowrap'>" +
                        $.usosCore.lang("Tel: ", "Phone: ") +
                        fac.phone_numbers.join(",</span> <span style='white-space: nowrap'>")
                    ));
                }
            }
            if (fac.homepage_url) {
                desc.append($("<a class='ua-www'>")
                    .attr("target", "_blank")
                    .attr("href", fac.homepage_url)
                    .text(fac.homepage_url)
                );
            }

            return badge;
        },
    });


})(jQuery);
