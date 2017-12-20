(function($) {

    "use strict";

    var defaultTipOptions = {
        type: "tool",
        position: "right",
        content: {
            pl: "Zgłoś niepoprawne dane",
            en: "Report invalid data"
        },
        delayed: true
    };

    var checkIfEnabled = function() {

        var deferred = $.Deferred();
        var checkingInProgress = false;
        var key = 'ua-feedback-enabled';

        return function() {
            if (typeof(Storage) == "undefined") {
                /* No storage support. Disable all feedback widgets. */
                return false;
            }
            if (typeof(sessionStorage[key]) === "undefined") {
                if (checkingInProgress) {
                    return deferred.promise();
                }
                checkingInProgress = true;
                $.usosCore.usosapiFetch({
                    method: "services/feedback/status"
                }).done(function(data) {
                    sessionStorage[key] = data.enabled ? "1" : "0";
                }).fail(function() {
                    sessionStorage[key] = "0";
                }).always(function() {
                    deferred.resolve(sessionStorage[key] == "1");
                });
            } else {
                deferred.resolve(sessionStorage[key] == "1");
            }
            return deferred.promise();
        };
    }();

    $.widget('usosWidgets._usosFeedback', {
        options: {
            form: [
                {
                    pl: "Co jest nie tak? Czy pole ma niepoprawną lub nieaktualną wartość?",
                    en: "What is wrong? Is the value of the field invalid, or outdated?"
                }
            ],
            meta: null,
            tip: true,
            tipOptions: {},
        },

        widgetEventPrefix: "usosfeedback:",
        defaultElement: "<span>",
        dialogTitle: null,
        dialogDiv: null,

        _create: function() {
            var widget = this;

            var tipOptions = $.extend({}, defaultTipOptions, widget.tipOptions);
            if (widget.options.tip) {
                widget.element.usosTip(tipOptions);
            }
            widget.dialogTitle = tipOptions.content;

            widget._on({
                click: function() {
                    widget.open();
                }
            });
        },

        open: function() {
            var widget = this;

            var div = $("<div>");
            widget.dialogDiv = div;

            /* Dialog title */

            div.append($("<div class='ua-h1'>").text($.usosCore.lang(widget.dialogTitle)));

            /* Form inputs. */

            $.each(widget.options.form, function(i, title) {
                div.append($("<div class='ua-input-with-header'>")
                    .append($("<div class='ua-h'>").html($.usosCore.lang(title)))
                    .append($("<div>").usosTextbox({
                        multiline: true
                    }))
                );
            });

            div.append($("<div class='ua-footnote'><table><tr><td class='ua-1'></td><td class='ua-2'></td></tr></table></div>"));
            div.find('.ua-1').append("<span class='ua-icon ua-icon-32 ua-icon-checkmark-circle'>");
            div.find('.ua-2').append($("<span>").html($.usosCore.lang(
                "Postaramy się przekazać zgłoszenie odpowiedniej osobie. " +
                "Nie możemy jednak obiecać, że dane zostaną poprawione. " +
                "Zgłoszenia od osób zalogowanych otrzymują wyższy " +
                "priorytet niż zgłoszenia anonimowe.",

                "We will try to forward your report to the appropriate person. " +
                "However, we cannot guarantee that the data will be amended. " +
                "Reports from signed-in users are given higher priority than " +
                "anonymous reports."
            )));

            div.dialog({
                title: $.usosCore.lang(widget.dialogTitle),
                dialogClass: "ua-feedback-dialog",
                resizable: false,
                modal: true,
                width: 480,
                height: "auto",
                closeText: $.usosCore.lang("Anuluj", "Cancel"),
                buttons: [
                    {
                        id: 'ua-bsave',
                        text: $.usosCore.lang("Wyślij zgłoszenie", "Send feedback"),
                        click: function() {
                            widget._saveClicked();
                        },
                        icons: {
                            primary: "ui-icon-check"
                        }
                    },
                    {
                        text: $.usosCore.lang("Anuluj", "Cancel"),
                        click: function() {
                            $(this).dialog("close");
                        }
                    }
                ],
                show: {
                    effect: "fade",
                    duration: 200
                },
                hide: {
                    effect: "fade",
                    duration: 200
                },
                close: function() {
                    widget.element.trigger('blur');
                    div.dialog("destroy");
                }
            });
        },

        _saveClicked: function() {
            var widget = this;

            var form = widget.dialogDiv;

            $("#ua-bsave").button("disable");
            form.usosForms("findValueWidgets").usosValue("disable");

            var loading = $("<span class='ua-loading'>").text("Wysyłanie...", "Sending...").hide();
            form.closest(".ui-dialog").find(".ui-dialog-buttonset").prepend(loading);
            loading.delay(200).fadeIn(200);

            var formValues = [];
            form.find(".ua-input-with-header").each(function() {
                formValues.push({
                    title: $(this).find("div:first-child").text(),
                    value: $(this).find("div:last-child").usosValue("value")
                });
            });

            $.usosCore.usosapiFetch({
                method: "services/feedback/report_db",
                params: {
                    user_form: JSON.stringify(formValues),
                    meta: JSON.stringify($.extend({}, widget.options.meta, {
                        "jquery-usos": {
                            url: document.location.href,
                            lang: $.usosCore.lang()
                        }
                    }))
                }
            }).done(function() {
                widget.dialogDiv.dialog("close");
                widget.element._usosFeedback("destroy");
                if (widget.element.hasClass("ua-icon-warning")) {
                    widget.element
                        .removeClass("ua-icon-warning")
                        .addClass("ua-icon-checkmark-circle")
                        .addClass("ua-feedback-complete")
                        .usosTip($.extend({}, defaultTipOptions, widget.options.tipOptions, {
                            delayed: false,
                            content: $.usosCore.lang("Dziękujemy!", "Thank you!")
                        }))
                        .hide()
                        .fadeIn(500);
                }
            }).fail(function(response) {
                $.usosCore.panic(response).done(function() {
                    $("#ua-bsave").button("enable");
                    form.usosForms("findValueWidgets").usosValue("enable");
                    loading.remove();
                });
            });
        },

        _destroy: function() {
            var widget = this;
            widget.element.usosTip("destroy");
        }
    });

    var create = function(options) {
        var icon = $("<span class='ua-feedback-icon ua-icon ua-icon-16 ua-icon-warning'>").hide();
        checkIfEnabled().done(function(enabled) {
            if (enabled) {
                icon.show();
                icon._usosFeedback(options);
            }
        });
        return icon;
    };
    $.usosWidgets._usosFeedback.create = create;

})(jQuery);
