(function($) {

    "use strict";

    var NS = "usosCore";

    var mydata = {
        settings: null,
        preloaderElement: null,
        unloading: false
    };

    var init = function(options) {

        /* Check if previously initialized. */

        if (mydata.settings !== null) {
            $.usosCore._console.error("jQuery.usosCore is already initialized! Subsequent calls to init will be ingored!");
            return;
        }

        /* Load settings, override with options. */

        var defaultSettings = {
            debug: false,
            langpref: "en",
            usosAPIs: {
                "default": {
                    methodUrl: null,  // e.g. "https://usosapps.usos.edu.pl/%s"
                    extraParams: {},
                    user_id: null
                }
            },
            entityURLs: {
                /* "entityCode": value, etc. */
            },
            _requestDelay: 0
        };
        mydata.settings = $.extend(true, {}, defaultSettings, options);
        mydata.preloaderElement = $("<div style='display: none'>");
        $(function() {
            $(document.body).append(mydata.preloaderElement);
            $(window).on("beforeunload", function() {
                mydata.unloading = true;
            });
        });
    };

    /**
     * Convert method parameters given by the user to the "final" parameters
     * used in the AJAX call. This method MAY return (1) a dictionary, or
     * (2) a FormData object.
     */
    var _prepareApiParams = function(params) {

        /* Make a "flat" copy of the parameters. Determine if any of the
         * parameters is a file object. */

        var copy = {};
        var useFormData = false;
        $.each(params, function(key, value) {
            if ($.isArray(value)) {
                value = value.join("|");
            } else if (typeof value !== "string") {
                if (File && File.prototype.isPrototypeOf(value)) {
                    useFormData = true;
                } else {
                    value = "" + value;
                }
            }
            copy[key] = value;
        });
        if (!useFormData) {

            /* None of the parameters are file objects. */

            return copy;
        }

        /* Some of the parameters are file objects. We will transform the object
         * into a FormData object. (We could do that in either case, but not all browsers
         * support file and FormData objects.) */

        var formData = new FormData();
        $.each(copy, function(key, value) {
            formData.append(key, value);
        });
        return formData;
    };

    var usosapiFetch = function(opts) {

        var defaultOptions = {
            source_id: "default",
            method: "method_name",
            params: {},
            syncMode: "noSync",  // "noSync", "receiveIncrementalFast", "receiveLast"
            syncObject: null,
            success: null,
            error: null,
            errorOnUnload: false
        };
        var options = $.extend({}, defaultOptions, opts);

        /* Verify params (especially those prone for spelling errors). */

        if (options.syncMode == "noSync") {
            if (options.syncObject !== null) {
                throw("syncObject must stay null if syncMode is 'noSync'");
            }
        } else if ((options.syncMode == "receiveLast") || (options.syncMode == "receiveIncrementalFast")) {
            if (options.syncObject === null) {
                throw("syncObject must be an object if syncMode is other than 'noSync'. Check out the docs!");
            }
        } else {
            throw("Invalid syncMode: " + options.syncMode);
        }

        /* If the uses a syncObject, then get the new request id. */

        var requestId = null;
        if (options.syncObject !== null) {
            if (typeof options.syncObject.lastIssuedRequestId === "undefined") {

                /* WARNING: This is "internal", but accessed outside od this file,
                 * grep the code before changing this structure. */

                options.syncObject.lastIssuedRequestId = 0;
                options.syncObject.lastReceivedRequestId = 0;
            }
            options.syncObject.lastIssuedRequestId++;
            requestId = options.syncObject.lastIssuedRequestId;
        }

        /* Contruct the method URL for the given source_id and method. */

        var url = mydata.settings.usosAPIs[options.source_id].methodUrl.replace("%s", options.method);

        /* Append extraParams (overwrite existing params!) defined for the given source_id. */

        var params = $.extend(
            {}, options.params,
            mydata.settings.usosAPIs[options.source_id].extraParams
        );

        /* Prepare the callbacks. */

        var deferred = $.Deferred();

        var success = function(data, textStatus, jqXHR) {
            if (options.syncObject !== null) {
                if (options.syncObject.lastReceivedRequestId > requestId) {

                    /* This response is overdue. We already received other response with
                     * greater requestId. We will ignore this response. */

                    return;
                }
                if (
                    (options.syncMode == "receiveLast") &&
                    requestId < options.syncObject.lastIssuedRequestId
                ) {

                    /* This response is obolete. A request with greater requestId was
                     * already issued. We will ignore this response. */

                    return;
                }
                options.syncObject.lastReceivedRequestId = requestId;
            }

            if (options.success !== null) {
                options.success(data);
            }
            deferred.resolve(data);
        };

        var error = function(xhr, errorCode, errorMessage) {
            if (options.syncObject !== null) {
                if (options.syncObject.lastReceivedRequestId > requestId) {
                    /* As above. */
                    return;
                }
                options.syncObject.lastReceivedRequestId = requestId;
            }

            var response;

            try {
                if (xhr && xhr.responseText) {
                    response = $.parseJSON(xhr.responseText);
                } else {
                    throw "Missing responseText";
                }
            } catch (err) {
                response = {"message": "USOS API communication error."};
                if (xhr.status != 0) {
                    $.usosCore._console.error("usosapiFetch: Failed to parse the error response: ", err);
                }
            }

            /* Add the xhr field. */

            response.xhr = xhr;

            if ((xhr.status == 0) && mydata.unloading && (!options.errorOnUnload)) {

                /* This error was most probably triggered by the page being
                 * unloaded. By default, we will stop propagating such errors.
                 * User may still receive such responses if he sets errorOnUnload
                 * option to true. */

            } else {
                if (options.error !== null) {
                    options.error(response);
                }
                deferred.reject(response);
            }
        };

        /* Prepare the request data. This can be either a simple dictionary, or
         * a FormData object. Both cases need to be handled differently. See
         * http://stackoverflow.com/a/5976031/1010931 for the details. */

        var ajaxParams = {
            type: 'POST',
            url: url,
            data: _prepareApiParams(params),
            dataType: 'json',
            success: success,
            error: error
        };
        if (FormData && FormData.prototype.isPrototypeOf(ajaxParams.data)) {
            ajaxParams.contentType = false;
            ajaxParams.processData = false;
        }

        /* Make the call. */

        var xhrOrTimeoutHandle = null;
        if (mydata.settings._requestDelay != 0) {
            xhrOrTimeoutHandle = setTimeout(function() {
                xhrOrTimeoutHandle = $.ajax(ajaxParams);
            }, mydata.settings._requestDelay);
        } else {
            xhrOrTimeoutHandle = $.ajax(ajaxParams);
        }

        /* Return the Promise object only when syncMode is left at the default
         * 'noSync' value. (The Deferred framework is not compatible with all the
         * other syncModes.) */

        if (options.syncMode == 'noSync') {

            /* We want to extend our Promise object with extra "abort" method. */

            return deferred.promise({
                abort: function() {
                    /* Do we have jqXHR or setTimeout handle? */
                    if (xhrOrTimeoutHandle.abort) {
                        /* Abort the request. */
                        xhrOrTimeoutHandle.abort();
                    } else {
                        /* The request was not yet sent. Abort the timer. */
                        clearTimeout(xhrOrTimeoutHandle);
                    }
                }
            });
        }
    };

    var lang = function() {
        if (arguments.length == 1) {
            if (arguments[0] === null) {
                /* lang(null) */
                return lang({
                    langdict: {pl: null, en: null}
                });
            } else if (typeof arguments[0].langdict !== 'undefined') {

                /* Fall out of the if block! */

            } else if (
                (typeof arguments[0].pl !== 'undefined')
                || (typeof arguments[0].en !== 'undefined')
            ) {
                /* lang(langdict) */
                return lang({
                    langdict: arguments[0]
                });
            } else {
                /* lang(string) */
                return lang(arguments[0], arguments[0]);
            }
        } else if (arguments.length == 2) {
            /* lang(pl, en) */
            return lang({
                langdict: {
                    pl: arguments[0],
                    en: arguments[1]
                }
            });
        } else if (arguments.length == 0) {
            /* When called without arguments, returns the current language code. */
            return mydata.settings.langpref;
        } else {
            throw("Invalid arguments");
        }

        var defaultOptions = {
            langdict: null,
            langpref: "inherit",
            wrapper: "simple"
        };
        var options = $.extend({}, defaultOptions, arguments[0]);

        if (options.langpref == "inherit") {
            options.langpref = mydata.settings.langpref;
        }

        var pl, en, ret;

        if (typeof options.langdict !== 'object') {
            pl = options.langdict;
            en = options.langdict;
        } else {
            pl = options.langdict.pl;
            en = options.langdict.en;
        }

        if (options.wrapper == "none") {
            if (options.langpref == 'pl') {
                return pl;
            } else {
                return en;
            }
        } else if (options.wrapper == "simple") {
            if (options.langpref == 'pl') {
                if (pl) {
                    ret = pl;
                } else if (en) {
                    ret = "(po angielsku) " + en;
                } else {
                    ret = "(brak danych)";
                }
            } else {
                if (en) {
                    ret = en;
                } else if (pl) {
                    ret = "(in Polish) " + pl;
                } else {
                    ret = "(unknown)";
                }
            }
            return ret;
        } else if ((options.wrapper == "jQuery.text") || (options.wrapper == "jQuery.html")) {
            var tag, func;
            if (options.wrapper == "jQuery.html") {
                tag = "<div>";
                func = "html";
            } else {
                tag = "<span>";
                func = "text";
            }
            ret = $(tag);
            if (options.langpref == 'pl') {
                if (pl) {
                    ret[func](pl);
                } else if (en) {
                    ret
                        .append($(tag).addClass("ua-note").text("(po angielsku)"))
                        .append(" ")
                        .append($(tag)[func](en));
                } else {
                    ret.append($(tag).addClass("ua-note").text("(brak danych)"));
                }
            } else {
                if (en) {
                    ret[func](en);
                } else if (pl) {
                    ret
                        .append($(tag).addClass("ua-note").text("(in Polish)"))
                        .append(" ")
                        .append($(tag)[func](pl));
                } else {
                    ret.append($(tag).addClass("ua-note").text("(unknown)"));
                }
            }
            return ret;
        } else {
            $.usosCore._console.error("Unknown wrapper " + options.wrapper + ", assuming 'default'.");
            options.wrapper = "default";
            return lang(options);
        }
    };

    var _nlang = function(value, pl1, pl2, pl5, en1, en2) {
        if (mydata.settings.langpref == "pl") {
            if (value == 1) {
                return pl1;
            }
            var d = value % 10;
            var h = value % 100;
            if ((h >= 12) && (h <= 14)) {
                return pl5;
            }
            if ((d >= 2) && (d <= 4)) {
                return pl2;
            }
            return pl5;
        } else {
            if (value == 1) {
                return en1;
            }
            return en2;
        }
    };

    var fixedConsole = function() {

        var _freezeOne = function(arg) {
            if (typeof arg === 'object') {
                return $.extend(true, {}, arg);
            } else {
                return arg;
            }
        };
        var _freezeAll = function(args) {
            var frozen = [];
            for (var i=0; i<args.length; i++) {
                frozen.push(_freezeOne(args[i]));
            }
            return frozen;
        };
        var fixedConsole = {};
        $.each(["log", "warn", "error", "assert"], function(_, funcName) {
            /** Deals with http://stackoverflow.com/questions/4057440/ */
            fixedConsole[funcName] = function() {
                if (mydata.settings.debug && window.console && window.console[funcName]) {

                    /* We want to call the underlying console with frozen arguments (some
                     * consoles are evaluated lazily), hence the need for ".apply". However,
                     * we cannot use window.console.apply directly in IE8, hence the ".call". */

                    Function.prototype.apply.call(
                        window.console[funcName],
                        window.console,
                        _freezeAll(arguments)
                    );
                }
            };
        });
        return fixedConsole;
    }();

    var panic = function(response) {

        var deferred = $.Deferred();

        var showDelay;

        var msg = $("<div class='ua-paragraphs ua-container'>");

        if (typeof response === 'object' && response.user_messages) {

            showDelay = 0;

            var messages = [];
            if (response.user_messages.generic_message) {
                messages.push(response.user_messages.generic_message);
            }
            if (response.user_messages.fields) {
                $.each(response.user_messages.fields, function(key, message) {
                    messages.push(message);
                });
            }
            $.each(messages, function(_, message) {
                msg.append($("<p style='font-size: 120%; line-height: 130%; margin-bottom: 25px'>")
                    .append($("<b>").html($.usosCore.lang(message))
                ));
            });
            msg.append($("<p>").text($.usosCore.lang(
                "Jeśli powyższy komunikat jest niezrozumiały, to zalecamy odświeżyć stronę. " +
                "Być może w trakcie, gdy ją oglądałeś, utraciłeś uprawnienia do wykonania akcji, " +
                "którą chciałeś wykonać.",
                "If the notice displayed above is vague, then we advise you to refresh the page. " +
                "Perhaps you have just lost permissions to perform the action you've been trying to " +
                "perform."
            )));
            var refresh = $("<a class='ua-link'>")
                .html($.usosCore.lang("Odśwież stronę", "Reload the page"))
                .click(function() {
                    window.location.reload(true);
                });
            var close = $("<a class='ua-link'>")
                .html($.usosCore.lang("Zamknij i kontynuuj", "Close and continue"))
                .click(function() {
                    msg.dialog('close');
                });
            msg.append($("<p style='text-align: center; font-size: 120%; margin-top: 20px'>")
                .append(refresh)
                .append(" ")
                .append($("<span class='ua-note'>")
                    .css({
                        'display': 'inline-block',
                        'width': '60px'
                    })
                )
                .append(" ")
                .append(close)
            );
            if (mydata.settings.debug && response.user_messages.fields) {
                $.usosCore._console.warn(
                    "Displaying panic screen based on `user_messages.fields` response. " +
                    "Try to use `yourValueInputs.usosForms('showErrors', response)` if possible."
                );
            }
        } else {

            if (typeof response === 'object' && response.xhr && response.xhr.status >= 400) {

                showDelay = 0;
            } else {

                /**
                 * In this case, there is a chance that the error is caused by the user
                 * navigating away during the execution of the background request. In such
                 * cases, we will delay the showing of the panic screen. (If the user is
                 * indeed navigating away, then he doesn't need to see the error.)
                 */

                showDelay = 2000;
            }

            msg.append($("<p style='font-size: 120%; margin-bottom: 25px'>")
                .append($("<b>")
                    .html($.usosCore.lang({
                        pl: "Wystąpił niespodziewany błąd.",
                        en: "Unexpected error occured."
                    }))
                )
            );
            var ul = $("<ul>");
            msg.append(ul);

            ul.append($("<li>")
                .html($.usosCore.lang(
                    "<p><b>Najpierw spróbuj odświeżyć stronę.</b> Odwieżenie strony często może pomóc, " +
                    "np. jeśli błąd jest spowodowany automatycznym wylogowaniem po dłuższej nieaktywności.</p>" +
                    "<p style='font-size: 120%; margin-bottom: 18px'><a>Kliknij tutaj, aby odświeżyć stronę</a></p>",

                    "<p><b>First, try to refresh the page.</b> Refreshing can often help, particularly " +
                    "if the error occured due to an automatic user sign-out after a prolonged period of " +
                    "inactivity.</p><p style='font-size: 120%; margin-bottom: 18px'><a>Click here to refresh the page</a></p>"
                ))
                .each(function() {
                    $(this).find('a')
                        .addClass('ua-link')
                        .click(function() {
                            window.location.reload(true);
                        });
                })
            );
            ul.append($("<li>").html($.usosCore.lang(
                "Spróbuj ponownie wykonać akcję, która spowodowała wystąpienie błędu. Być może był " +
                "to jednorazowy błąd spowodowany chwilową utratą połączenia z Internetem?",

                "Try to repeat the action which you were doing when the error occured. Perhaps it was " +
                "a one-time network error caused by bad Internet connection?"
            )));
            ul.append($("<li>").html($.usosCore.lang(
                "Upewnij się, czy posiadasz odpowiednie uprawnienia. Czy jesteś zalogowany? " +
                "Być może musisz uzyskać pewne dodatkowe uprawnienia, aby móc wyświetlić stronę " +
                "lub wykonać akcję, którą właśnie próbowałeś wykonać?",

                "Make sure you have proper privileges. Are you signed in? Perhaps, you need to " +
                "acquire some special privileges before you can view this page or perform this action?"
            )));
            ul.append($("<li>").html($.usosCore.lang(
                "Jeśli problem będzie się powtarzał, to skontaktuj się z administratorem. Napisz " +
                "na której stronie i w którym momencie problem wystąpuje, tak aby administrator " +
                "mógł go dokładniej zbadać.",

                "If the problem persists, contact the administrator. Try to include detailed " +
                "descriptions of where and when the error occurs, so that the administrator " +
                "will be able to examine it closely."
            )));
            msg.append($("<p style='text-align: center; font-size: 120%; margin-top: 20px'>")
                    .html($("<a class='ua-link'>")
                        .html($.usosCore.lang("Zamknij i kontynuuj", "Close and continue"))
                        .click(function() {
                            msg.dialog('close');
                        })
                    )
                );
        }

        var showIt = function() {
            msg.dialog({
                dialogClass: "ua-panic-dialog",
                resizable: false,
                modal: true,
                width: "600px",
                height: "auto",
                closeText: $.usosCore.lang("Zamknij", "Close"),
                show: {
                    effect: "fade",
                    duration: 150
                },
                hide: {
                    effect: "fade",
                    duration: 150
                },
                close: function() {
                    deferred.resolve();
                }
            });
        };

        setTimeout(showIt, showDelay);
        return deferred.promise();
    };

    var _methodForwarder = function(dataKey, funcName, type) {
        return function() {
            var widget;
            var myArgs = arguments;

            /* getter */
            if ((type == 'getter') || ((type == 'auto') && (arguments.length == 0))) {
                var ret = undefined;
                this.each(function() {
                    widget = $(this).data(dataKey);
                    ret = widget[funcName].apply(widget, myArgs);
                    return false; // break
                });
                return ret;
            }

            /* setter */

            return this.each(function(i) {
                widget = $(this).data(dataKey);
                widget[funcName].apply(widget, myArgs);
            });
        };
    };

    /**
     * Attach the jQuery element(s) to an invisible element in the DOM.
     * Useful for prefetching images in <a hrefs>.
     */
    var _preload = function(elements) {
        mydata.preloaderElement.append(elements);
    };

    $[NS] = {
        _getSettings: function() { return mydata.settings; },
        _console: fixedConsole,
        _methodForwarder: _methodForwarder,
        _preload: _preload,
        _nlang: _nlang,

        init: init,
        usosapiFetch: usosapiFetch,
        lang: lang,
        panic: panic
    };

})(jQuery);
