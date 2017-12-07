/* WARNING: This "interface" is neither public nor backward-compatible! */

(function($) {

    var MYCODE = "entity/courses/course";

    $.usosEntity._register({

        entityCode: MYCODE,
        primaryKeyFields: ["course_id"],

        getLabel: function(course) {
            var e = $.usosUtils.requireFields(faculty, "id|name");
            return $("<span>").text($.usosCore.lang(e.name));
        },

        initBadge: function(options) {
            return false;
        },

        getSelectorSetup: function() {
            return {
                prompt: $.usosCore.lang("Wpisz nazwę przedmiotu", "Enter a course name"),
                search: {
                    method: 'services/courses/search',
                    paramsProvider: function(query) {
                        return {
                            'lang': $.usosCore.lang(),
                            'name': query
                        };
                    },
                    itemsExtractor: function(data) {
                        return data.items;
                    }
                },
                get: {
                    method: 'services/courses/courses',
                    paramsProvider: function(ids) {
                        return {
                            'course_ids': ids.join("|"),
                            'fields': 'id|name'
                        };
                    },
                    itemsExtractor: function(data) {

                        /* The 'courses' method returns an unordered dictionary of the {course_id: course} form. */

                        var items = [];
                        $.each(data, function(course_id, course) {
                            if (course === null) {
                                $.usosCore._console.warn("Course " + course_id + " not found! Will be skipped!");
                                return true; // continue
                            }
                            items.push(course);
                        });
                        return items;
                    }
                },
                idExtractor: function(item) {
                    /* 'search' method returns course_ids, 'courses' method returns ids. */
                    return item.course_id || item.id;
                },
                suggestionRenderer: function(item) {
                    return item.match;
                },
                tagRenderer: function(item) {

                    /* 'search' method returns 'match', 'users' method returns 'name'. Exact
                     * value of 'match' is undocumented, so we use some heuristics here... */

                    var name;
                    if (item.match) {
                        name = $("<span>").html(item.match).text();
                        // Remove the " (course code)" part, if present.
                        var i = name.indexOf(" (" + item.course_id + ")");
                        if (i > 0) {
                            name = name.substring(0, i);
                        }
                    } else {
                        name = $.usosCore.lang(item.name);
                    }

                    /* Return in a block with decent max-width applied. */

                    return $('<span>').text(name);
                }
            };
        }

    });

})(jQuery);
