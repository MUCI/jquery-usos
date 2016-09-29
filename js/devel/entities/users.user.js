(function($) {

    var MYCODE = "entity/users/user";

    $.usosEntity._register({

        entityCode: MYCODE,
        primaryKeyFields: ["user_id"],

        getLabel: function(user) {
            var e = $.usosUtils.requireFields(user, "id|first_name|last_name");
            return $("<span>")
                .text(e.first_name + " " + e.last_name)
                .usosBadge({
                    entity: MYCODE,
                    user_id: e.id
                });
        },

        initBadge: function(options) {
            this._usosUserBadge(options);
            return true;
        },

        getSelectorSetup: function() {
            var user_fields = (
                /* Possible performance gain: https://redmine.usos.edu.pl/issues/8158 */
                "id|sex|first_name|last_name|" +
                "employment_functions[function|faculty|is_official]|" +
                "student_programmes[programme|status]|" +
                "employment_positions|photo_urls[50x50]"
            );
            return {
                prompt: $.usosCore.lang("Wpisz imię i nazwisko", "Enter the user's name"),
                search: {
                    method: 'services/users/search2',
                    paramsProvider: function(query) {
                        return {
                            lang: $.usosCore.lang(),
                            query: query,
                            num: 4,
                            fields: "items[match|user[" + user_fields + "]]"
                        };
                    },
                    itemsExtractor: function(data) {
                        return data.items;
                    }
                },
                get: {
                    method: 'services/users/users',
                    paramsProvider: function(ids) {
                        return {
                            user_ids: ids.join("|"),
                            fields: user_fields
                        };
                    },
                    itemsExtractor: function(data) {
                        var items = [];
                        $.each(data, function(user_id, user) {
                            if (user === null) {
                                $.usosCore._console.warn("User " + user_id + " not found! Will be skipped!");
                                return true;  // continue
                            }
                            items.push({"user": user});
                        });
                        return items;
                    }
                },
                idExtractor: function(item) {
                    return item.user.id;
                },
                suggestionRenderer: function(item) {
                    var $div = $(
                        "<div class='ua-usersuggestion'><table><tr>" +
                        "<td class='ua-td1'><img alt=''/></td>" +
                        "<td class='ua-td2'><div class='ua-match'></div><div class='ua-tagline'></div></td>" +
                        "</tr></table></div>"
                    );
                    $div.find(".ua-match").html(item.match);
                    $div.find("img").attr("src", item.user.photo_urls['50x50']);
                    $.each(item.user.employment_positions, function(_, f) {
                        $div.find(".ua-tagline")
                            .append($("<span class='ua-note'>")
                                .text(
                                    $.usosCore.lang(f.position.name) +
                                    " (" + $.usosCore.lang(f.faculty.name) + ")"
                                )
                            )
                            .append(" ");
                    });
                    $.each(item.user.employment_functions, function(_, f) {
                        if (!f.is_official) {
                            return;
                        }
                        $div.find(".ua-tagline")
                            .append($("<span class='ua-note'>")
                                .text(
                                    $.usosCore.lang(f['function']) +
                                    " (" + $.usosCore.lang(f.faculty.name) + ")"
                                )
                            )
                            .append(" ");
                    });
                    var active_sps = [];
                    $.each(item.user.student_programmes, function(_, sp) {
                        if ((sp.status == "active") || (sp.status == "graduated_before_diploma")) {
                            active_sps.push(sp);
                        }
                    });
                    if (item.user.student_programmes.length > 0) {
                        if (active_sps.length > 0) {
                            $.each(active_sps, function(_, sp) {
                                $div.find(".ua-tagline")
                                    .append($("<span class='ua-note'>")
                                        .text($.usosCore.lang(sp.programme.description))
                                    )
                                    .append(" ");
                            });
                        } else {
                            $div.find(".ua-tagline")
                                .append($("<span class='ua-note'>")
                                    .text($.usosCore.lang(
                                        (item.user.sex == "M") ? "Były student" : "Była studentka",
                                        "Ex-student"
                                    ))
                                )
                                .append(" ");
                        }
                    }
                    $div.usosBadge({
                        entity: 'entity/users/user',
                        user_id: item.user.id
                    });
                    return $div;
                },
                affector: function(user_ids) {
                    $.each(user_ids, function(_, user_id) {
                        $.usosCore.usosapiFetch({
                            method: "services/users/search_history_affect",
                            params: {
                                user_id: user_id
                            }
                        });
                    });
                },
                tagRenderer: function(item) {
                    return $("<span>")
                        .text(item.user.first_name + " " + item.user.last_name)
                        .usosBadge({
                            entity: 'entity/users/user',
                            user_id: item.user.id,
                            position: "top"
                        });
                }
            };
        }
    });

    $.widget('usosWidgets._usosUserBadge', $.usosWidgets._usosBadge, {
        options: {
            user_id: null
        },
        widgetEventPrefix: "usosbadge:",
        _getEntityKey: function() { return ['user_id']; },
        _cssClass: function() { return 'ua-badge-user'; },

        _fetchData2: function() {

            var widget = this;

            /* Determine which fields need to be fetched. Was jQuery-USOS initialized with
             * custom user profile URLs? If not, we need to fetch USOS API's profile URLs
             * instead. */

            var local_profile_url = $.usosEntity.url("entity/users/user", widget.options.user_id);
            var fields = (
                "id|first_name|last_name|photo_urls[100x100]|sex|" +
                "employment_functions[function|faculty|is_official]|" +
                "employment_positions|student_programmes[programme|status]|student_number"
            );
            if (!local_profile_url) {
                fields += "|profile_url";
            }

            /* Fetch the data. */

            return $.usosCore.usosapiFetch({
                method: "services/users/user",
                params: {
                    user_id: widget.options.user_id,
                    fields: fields
                }
            }).then(function(user) {

                /* If needed, replace the profile URL with local version. */

                if (local_profile_url) {
                    user.profile_url = local_profile_url;
                }
                return user;
            });
        },

        _createBadge: function(user) {

            var widget = this;

            /* Structure */

            var badge = $(
                "<div><table class='ua-container'><tr><td class='ua-td1'>" +
                "<a class='ua-photo-link'><img class='ua-photo' alt=''/></a>" +
                "</td><td class='ua-td2'>" +
                "<div class='ua-td2top'><div class='ua-id-icon'>id</div>" +
                "<div class='ua-name'></div><ul class='ua-functions'></ul></div>" +
                "</td></tr></table></div>"
            );

            /* Photo */

            badge.find('.ua-photo').attr("src", user.photo_urls['100x100']);

            /* Name and profile link */

            badge.find('.ua-name').html($("<a>")
                .attr("href", user.profile_url)
                .text(user.first_name + " " + user.last_name)
            );
            if (user.student_number) {
                badge.find('.ua-name').append($("<span class='ua-student-number'>")
                    .text(user.student_number)
                    .css("cursor", "default")
                    .usosTip({
                        type: "tool",
                        position: "top",
                        content: {
                            pl: "Numer albumu",
                            en: "Student number"
                        }
                    })
                );
            }

            badge.find('.ua-photo-link').attr('href', user.profile_url);

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

            /* Employment functions and positions (grouped by faculty) */

            var groups = {};
            $.each(user.employment_functions, function(_, emp) {
                if (!emp.is_official) {
                    return;
                }
                if (!groups.hasOwnProperty(emp.faculty.id)) {
                    groups[emp.faculty.id] = {
                        faculty: emp.faculty,
                        names: []
                    };
                }
                groups[emp.faculty.id].names.push(emp['function']);
            });
            $.each(user.employment_positions, function(_, emp) {
                if (!groups.hasOwnProperty(emp.faculty.id)) {
                    groups[emp.faculty.id] = {
                        faculty: emp.faculty,
                        names: []
                    };
                }
                groups[emp.faculty.id].names.push(emp['position'].name);
            });
            $.each(groups, function(_, group) {

                /* If the words in those two lines http://i.imgur.com/hlVKJqq.png
                 * are very short, then compress them into one line:
                 * http://i.imgur.com/1Tby2DK.png */

                var li;
                var facLink = $.usosEntity.link("entity/fac/faculty", group.faculty);
                if (
                    group.names.length == 1 &&
                    facLink.text().length + $.usosCore.lang(group.names[0]).length < 45
                ) {
                    li = $("<li>").append(makeLine($("<div>")
                        .append(facLink)
                        .append(" - ")
                        .append($("<span class='ua-func'>").text($.usosCore.lang(group.names[0])))
                    ));
                } else {
                    li = $("<li>").append(makeLine(facLink));
                    group.names.sort(function(a, b) { return a.length > b.length ? -1 : 1; });
                    $.each(group.names, function(i, name) {
                        li.append(makeLine($("<span class='ua-func'>").text($.usosCore.lang(name))));
                    });
                }
                badge.find(".ua-functions").append(li);
            });

            /* Study programmes. We want active programmes displayed separately. */

            var sp_active = [];
            var sp_inactive = [];
            $.each(user.student_programmes, function(_, sp) {
                if (sp.status == "active" || sp.status == "graduated_before_diploma") {
                    sp_active.push(sp);
                } else {
                    sp_inactive.push(sp);
                }
            });

            var compressedHelper = function(sps, li) {
                var tipContent = $("<div>");
                var uniqueCount = 0;
                var usedIds = {};
                $.each(sps, function(i, sp) {
                    var id = sp.programme.id;
                    if (!usedIds.hasOwnProperty(id)) {
                        usedIds[id] = true;
                        uniqueCount++;
                        tipContent.append(makeLine(
                            $.usosEntity.label("entity/progs/programme", sp.programme)
                        ));
                    }
                });
                li.append($.usosCore.lang(" (na ", " (on "));
                var link = $("<span class='ua-link ua-no-underline'>");
                li.append(link);
                link
                    .append(uniqueCount + " ")
                    .append($.usosCore.lang("programach", "programmes"))
                    .usosTip({
                        content: tipContent,
                        position: "bottom",
                        type: "tool",
                        _autoWidth: false
                    });
                li.append(")");
            };

            if (sp_active.length > 0) {
                var li = $("<li>").append($.usosCore.lang(
                    user.sex == 'M' ? "Student" : "Studentka",
                    "Student"
                ));
                if (sp_active.length > 3) {
                    /* Compressed view. */
                    compressedHelper(sp_active, li);
                } else {
                    /* Expanded view. */
                    $.each(sp_active, function(_, sp) {
                        li.append(makeLine(
                            $.usosEntity.link("entity/progs/programme", sp.programme)
                        ));
                    });
                }
                badge.find(".ua-functions").append(li);
            }

            if (sp_inactive.length > 0) {
                var li = $("<li>").append($.usosCore.lang(
                    user.sex == 'M' ? "Były student" : "Była studentka",
                    "Ex-student"
                ));
                if (sp_inactive.length > 1) {
                    /* Compressed view. */
                    compressedHelper(sp_inactive, li);
                } else {
                    /* Expanded view. */
                    $.each(sp_inactive, function(_, sp) {
                        li.append(makeLine(
                            $.usosEntity.link("entity/progs/programme", sp.programme)
                        ));
                    });
                }
                badge.find(".ua-functions").append(li);
            }

            /* Photo privacy reminder */

            if (user.id == $.usosCore._getSettings().usosAPIs['default'].user_id) {
                badge.find(".ua-td2").append($("<div class='ua-privacy-note'>")
                    .append($("<span>")
                        .append(":: ")
                        .append($("<span class='ua-link ua-no-underline'>")
                            .text($.usosCore.lang(
                                "Kto może oglądać moje zdjęcie?",
                                "Who can see my photo?"
                            ))
                            .usosTip({
                                content: function() {
                                    return $.usosCore.usosapiFetch({
                                        method: "services/photos/my_photo_visibility"
                                    }).then(function(data) {
                                        var message = $("<div>").css("max-width", "200px");
                                        message.append($("<p>").text($.usosCore.lang(data.desc_for_user)));
                                        message.append($("<p>").text($.usosCore.lang(
                                            "Widoczność zdjęcia możesz zmienić na stronie preferencji " +
                                            "w USOSweb.",

                                            "You can change this visibility in your USOSweb " +
                                            "preferences page."
                                        )));
                                        return message;
                                    });
                                },
                                position: "bottom",
                                type: "tool",
                                _autoWidth: false
                            })
                        )
                    )
                );
            }

            /* ID icon */

            var getTablePromise = function() {
                var promise = null;
                return function() {
                    if (promise != null) {
                        return promise;
                    }
                    promise = $.usosCore.usosapiFetch({
                        method: "services/users/user",
                        params: {
                            user_id: user.id,
                            fields: (
                                "id|first_name|middle_names|last_name|sex|email|" +
                                "phone_numbers|mobile_numbers|student_number|pesel"
                            )
                        }
                    }).then(function(data) {
                        var table = $("<table cellspacing='0' style='width: 100%'>");
                        var add = function(header, value) {
                            var formatted;
                            if (value === null) {
                                return;
                            }
                            if ($.isArray(value)) {
                                if (value.length == 0) {
                                    return;
                                }
                                formatted = $("<div>");
                                $.each(value, function(_, v) { formatted.append($("<div>").text(v)); });
                            } else if ((typeof value === "string") || (typeof value === "number")) {
                                formatted = $("<div>").text(value);
                            } else {
                                $.usosCore._console.error("Unknown value type", value);
                                return;
                            }
                            table.append($("<tr>")
                                .append($("<td style='padding: 0 4px 0 0; white-space: nowrap; font-weight: bold; text-align: right; vertical-align: top'>").text(header + ":"))
                                .append($("<td style='padding: 0 0 0 0; white-space: nowrap; vertical-align: top'>").append(formatted))
                            );
                        };
                        add($.usosCore.lang("Numer PESEL", "PESEL number"), data.pesel);
                        add($.usosCore.lang("Numer albumu", "Student number"), data.student_number);
                        add($.usosCore.lang("Imię", "First name"), data.first_name);
                        add($.usosCore.lang("Drugie imię", "Middle names"), data.middle_names);
                        add($.usosCore.lang("Nazwisko", "Last name"), data.last_name);
                        add($.usosCore.lang("Adres e-mail", "Email address"), data.email);
                        add("USOS ID", data.id);
                        add($.usosCore.lang("Płeć", "Sex"), data.sex == "M"
                            ? $.usosCore.lang("mężczyzna", "male")
                            : $.usosCore.lang("kobieta", "female")
                        );
                        add($.usosCore.lang("Numery telefonów", "Phone numbers"), data.phone_numbers);
                        add($.usosCore.lang("Numery prywatne", "Private mobile numbers"), data.mobile_numbers);
                        return table;
                    });
                    return promise;
                };
            }();

            badge.find(".ua-id-icon").usosTip({
                type: "tool",
                position: "right",
                _autoWidth: false,
                content: getTablePromise
            }).on("click", function() {
                getTablePromise().done(function(table) {
                    widget.element.tooltipster("hide");
                    var div = $("<div class='ua-paragraphs'>");
                    div.append(table);
                    div.append($("<p style='text-align: center'>").append($("<a class='ua-link'>").text($.usosCore.lang(
                        "Zamknij", "Close"
                    ))));
                    //$("body").addClass("ua-stop-scrolling");
                    div.dialog({
                        dialogClass: "ua-panic-dialog ua-scrollable ua-selector-popup",
                        resizable: false,
                        modal: true,
                        width: "auto",
                        height: "auto",
                        closeText: $.usosCore.lang("Zamknij", "Close"),
                        close: function() {
                            //$("body").removeClass("ua-stop-scrolling");
                            try {
                                div.usosProgressOverlay('destroy');
                            } catch(err) {}
                        },
                        show: {
                            effect: 'fade',
                            duration: 300
                        },
                        hide: {
                            effect: 'fade',
                            duration: 100
                        }
                    });
                    div.find("a").on("click", function() {
                        div.dialog("close")
                    });
                });
            });;

            return badge;
        }
    });

})(jQuery);
