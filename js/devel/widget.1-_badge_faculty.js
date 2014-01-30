(function($) {

    "use strict";

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
                        "static_map_urls[400x200]|" +
                        "stats[programme_count|course_count|staff_count]"
                    )
                }
            });
        },

        _createBadge: function(fac) {

            /* Structure */

            var badge = $(
                "<div class='ua-container'><table>" +
                "<tr><td class='ua-stats'><div></div></td></tr>" +
                "<tr><td class='ua-cover'><div class='ua-cover-inner'><div class='ua-title'></div></div></td></tr>" +
                "<tr><td class='ua-desc'><div></div></td></tr>" +
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
            var appendDiv = function(n, pl1, pl2, pl5, en1, en2) {
                stats.append($("<div class='ua-stat-entry'>")
                    .append($("<b>").text(n))
                    .append(" ")
                    .append($.usosCore._nlang(n, pl1, pl2, pl5, en1, en2))
                );
            };
            if (fac.stats.staff_count > 0) {
                appendDiv(
                    fac.stats.staff_count,
                    "pracownik", "pracowników", "pracowników",
                    "staff member", "staff members"
                );
            }
            if (fac.stats.programme_count > 0) {
                appendDiv(
                    fac.stats.programme_count,
                    "program studiów", "programy studiów", "programów studiów",
                    "study programme", "study programmes"
                );
            }
            if (fac.stats.course_count > 0) {
                appendDiv(
                    fac.stats.course_count,
                    "przedmiot", "przedmioty", "przedmiotów",
                    "course", "courses"
                );
            }

            /* Address, phone numbers, home page */

            var desc = badge.find('.ua-desc div');
            if (fac.postal_address || (fac.phone_numbers.length > 0)) {
                var address = $("<div class='ua-address'>")
                desc.append(address);
                if (fac.postal_address) {
                    var search_url = "https://maps.google.pl/?q=" + encodeURIComponent(fac.postal_address);
                    address.append($("<div>")
                        .append($("<span>")
                            .text(fac.postal_address)
                        )
                        .append($("<a class='ua-relative'>")
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
                    address.append($("<div>").text("Tel: " + fac.phone_numbers.join(", ")));
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
