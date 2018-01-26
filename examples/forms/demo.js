$(function() {
    $.usosCore.init();

    /* Create the widgets */

    $("#textbox").usosTextbox({
        name: "name"
    });
    $("#checkbox").usosCheckbox({
        name: "is_visible",
        caption: {
            pl: "Czy widoczny",
            en: "Is visible"
        }
    });
    $("#checkbox").usosRadioboxes({
        name: "capacity",
        width: "300px",
        options: [
            {value: "<10", caption: {pl: "Tyci tyci", en: "Tiny"}},
            {value: "30", caption: {pl: "Ma�a", en: "Small"}},
            {value: "100", caption: {pl: "Spora", en: "Big"}},
            {value: ">500", caption: {
                pl: "Wielgachna",
                en: (
                    "Huge. Note that this can span multiple lines and will " +
                    "remain properly indented. It can also contain <i>HTML</i>."
                )
            }}
        ]
    });
    $("#selectbox").usosSelectbox({
        name: "type",
        options: [
            {value: "A", caption: {pl: "Typ A", en: "A-Type"}},
            {value: "B", caption: {pl: "Typ B", en: "B-Type"}}
        ]
    });
    $("#save").button();
    var myWidgets = $("#myForm").usosForms("findValueWidgets");

    /* Define progress helpers. */

    function showProgress() {
        /* Disable all the inputs and buttons so that they won't
         * get changed or clicked while loading or saving. */
        $("#save").button("disable");
        myWidgets.usosValue("disable");
        $("#myForm").usosProgressOverlay();
    }

    function hideProgress() {
        $("#myForm").usosProgressOverlay('destroy');
        myWidgets.usosValue("enable");
        $("#save").button("enable");
    }

    /* Fake USOS API AJAX requests. Change them to test how things work. */

    function loadObject(id) {
        var deferred = $.Deferred();
        setTimeout(function() {
            deferred.resolve({
                id: id,
                name: "Name",
                is_visible: true,
                type: "B",
                capacity: "100"
            });
        }, 2000);
        return deferred;
    }

    function updateObject(id, fields) {
        var deferred = $.Deferred();
        setTimeout(function() {
            deferred.reject({
                message: "Fake error.",
                user_messages: {
                    fields: {
                        /* */
                        name: {
                            pl: "Ta nazwa nie jest wystarczaj�co �adna.",
                            en: "This name is not pretty enough."
                        }
                        /* Also check this alternative */ /*
                        id: {
                            pl: "Nie masz uprawnie� do edycji tego przedmiotu.",
                            en: "You have no permissions to edit this course."
                        }
                        /* */
                    }
                }
            });
        }, 2000);
        return deferred;
    }

    /* Load the current values and display them in the form. */

    showProgress();
    loadObject("some_id")
    .always(hideProgress)
    .done(function(data) {
        myWidgets.usosForms("values", data);
        $(".ua-usosvalue[data-name=name]").usosValue("focus");
    })
    .fail($.usosCore.panic);

    /* Handle the save button. */

    $("#save").click(function() {
        showProgress();
        updateObject("some_id", myWidgets.usosForms("flatValues"))
        .always(hideProgress)
        .done(function() { alert("Saved!"); })
        .fail(function(response) {
            myWidgets.usosForms('showErrors', response);
        });
    });
});