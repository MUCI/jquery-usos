(function($) {

    var MYCODE = "entity/geo/building";

    $.usosEntity._register({

        entityCode: MYCODE,
        primaryKeyFields: ["building_id"],

        getLabel: function(building) {
            var e = $.usosUtils.requireFields(building, "id|name");
            return $("<span>")
                .text($.usosCore.lang(e.name))
                .usosBadge({
                    entity: MYCODE,
                    building_id: e.id
                });
        },

        initBadge: function(options) {
            this._usosBuildingBadge(options);
            return true;
        },

        getSelectorSetup: false
    });

    $.widget('usosWidgets._usosBuildingBadge', $.usosWidgets._usosBadge, {
        options: {
            building_id: null
        },
        widgetEventPrefix: "usosbadge:",
        _getEntityKey: function() { return ['building_id']; },
        _cssClass: function() { return "ua-badge-building"; },

        _fetchData2: function() {

            var widget = this;

            return $.usosCore.usosapiFetch({
                method: "services/geo/building2",
                params: {
                    building_id: widget.options.building_id,
                    langpref: $.usosCore.lang(),
                    fields: (
                        "id|name|static_map_urls[100x100]|related_faculties|" +
                        "postal_address|phone_numbers|profile_url"
                    )
                }
            });
        },

        _createBadge: function(building) {

            var widget = this;

            /* Structure */

            var badge = $(
                "<div><table class='ua-container'><tr><td class='ua-td1'>" +
                "<a class='ua-photo-link'><span class='ua-icon-office'></span><img class='ua-photo'/></a>" +
                "</td><td class='ua-td2'>" +
                "<div class='ua-td2top'><div class='ua-name'></div>" +
                "<div class='ua-desc'></div></div>" +
                "</td></tr></table></div>"
            );

            /* Photo / Map */

            var map_url = building.static_map_urls['100x100'];
            if (map_url) {
                badge.find('.ua-photo').attr("src", map_url);
            }

            /* Name and profile link */

            var profile_url = $.usosEntity.url("entity/geo/building", building.id) || building.profile_url;
            badge.find('.ua-name').html($("<a>")
                .attr("href", profile_url)
                .text($.usosCore.lang(building.name))
            );
            badge.find('.ua-photo-link').attr('href', profile_url);

            /* Address, phone numbers */

            var desc = badge.find('.ua-desc');
            if (building.postal_address) {
                var search_url = "https://maps.google.pl/?q=" + encodeURIComponent(building.postal_address);
                desc.append($("<div>")
                    .append($("<span>")
                        .text(building.postal_address)
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

            /* Phone numbers */

            if (building.phone_numbers.length > 0) {
                desc.append($("<div>").text(
                    $.usosCore.lang("Tel: ", "Phone: ") +
                    building.phone_numbers.join(", ")
                ));
            }

            /* Related faculties */

            var facs = building.related_faculties;
            var makeLine = function(content) {
                return content
                    .addClass("ua-ellipsis")
                    .css("max-width", "234px")  /* rel: g02d90l */
                    .on('mouseenter', function() {
                        var $this = $(this);
                        if (this.offsetWidth < this.scrollWidth && !$this.attr('title'))
                            $this.attr('title', $this.text());
                    });
            };
            if (facs.length == 1) {
                var link = $("<div class='ua-fac'>").html(
                    $.usosEntity.link("entity/fac/faculty", facs[0])
                );
                desc.append(link);
            } else if (facs.length > 1) {
                var tipContent = $("<div>");
                $.each(facs, function(i, fac) {
                    tipContent.append(makeLine(
                        $.usosEntity.label("entity/fac/faculty", fac)
                    ));
                });
                var link = $("<a class='ua-link ua-no-underline'>")
                    .attr("href", profile_url);
                desc.append($("<div class='ua-fac'>").append(link));
                link
                    .append(facs.length + " ")
                    .append($.usosCore._nlang(
                        facs.length,
                        "związana jednostka", "związane jednostki", "związanych jednostek",
                        "related faculty", "related faculties"
                    ))
                    .usosTip({
                        content: tipContent,
                        position: "bottom",
                        type: "tool",
                        _autoWidth: false
                    });
            }

            return badge;
        }
    });

})(jQuery);
