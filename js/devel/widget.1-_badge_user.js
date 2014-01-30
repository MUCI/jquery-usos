(function($) {

    "use strict";

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
            var fields = "id|first_name|last_name|photo_urls[100x100]|sex|student_programmes|employment_functions|employment_positions";
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
                "<a class='ua-photo-link'><img class='ua-photo'/></a>" +
                "</td><td class='ua-td2'>" +
                "<div class='ua-td2top'><div class='ua-name'></div><ul class='ua-functions'></ul></div>" +
                "</td></tr></table></div>"
            );

            /* Photo */

            badge.find('.ua-photo').attr("src", user.photo_urls['100x100']);

            /* Name and profile link */

            badge.find('.ua-name').html($("<a>")
                .attr("href", user.profile_url)
                .text(user.first_name + " " + user.last_name)
            );
            badge.find('.ua-photo-link').attr('href', user.profile_url);

            /* Employment functions and positions (grouped by faculty) */

            var groups = {};
            $.each(user.employment_functions, function(_, emp) {
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
                var li = $("<li>")
                    .append($.usosEntity.link("entity/fac/faculty", group.faculty))
                    .append($("<br>"));
                group.names.sort(function(a, b) { return a.length > b.length ? -1 : 1; });
                $.each(group.names, function(i, name) {
                    if (i > 0) {
                        li.append($("<br>"));
                    }
                    li.append($("<span class='ua-func'>").text($.usosCore.lang(name)));
                });
                badge.find(".ua-functions").append(li);
            });

            /* Study programmes */

            if (user.student_programmes.length > 0) {
                var li = $("<li>").append($.usosCore.lang(
                    user.sex == 'M' ? "Student" : "Studentka",
                    "Student"
                ));
                $.each(user.student_programmes, function(_, sp) {
                    li.append($("<br>"));
                    li.append($.usosEntity.link("entity/progs/programme", sp.programme));
                });
                badge.find(".ua-functions").append(li);
            }

            /* Photo privacy reminder */

            if (user.id == $.usosCore._getSettings().usosAPIs['default'].user_id) {
                badge.find(".ua-td2").append($("<div class='ua-privacy-note'>")
                    .append($("<span>")
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
                );
            }

            return badge;
        }
    });

})(jQuery);
