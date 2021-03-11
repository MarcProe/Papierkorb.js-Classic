//init a lot of stuff
$(document).ready(function () {
    function redsave() {
        $("#saveicon")
            .removeClass("ppknavicon")
            .removeClass("redsave")
            .addClass("redsave");
    }

    function bluesave() {
        $("#saveicon")
            .removeClass("redsave")
            .removeClass("ppknavicon")
            .addClass("ppknavicon");
    }

    const sokObj = new bootstrap.Toast($("#saveoktoast")[0], {
        autohide: true,
        delay: 1500,
    });
    const snoObj = new bootstrap.Toast($("#savenotoast")[0], {
        autohide: true,
        delay: 1500,
    });

    const idregex = /.*(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.\d{3}Z\.pdf).*/g;
    const docid = idregex.exec(window.location.href)[1];
    const scriptPath = $("#docjs").attr("data-public") + "js/views/";

    //Initialize Datepicker
    $.getJSON(
        `${scriptPath}doc_bootstrap.datepicker_config.json`,
        (dpconfig) => {
            //override JQuery Datepicker function to actually pick "today" on pressing "today"
            var old_goToToday = $.datepicker._gotoToday;
            $.datepicker._gotoToday = function (id) {
                old_goToToday.call(this, id);
                this._selectDate(id);
            };
            $("#docdate")
                .datepicker(dpconfig)
                .change(() => {
                    redsave();
                });
        }
    );

    $.getJSON(`/api/v1/doc/${docid}`, function (docdata) {
        console.log(docdata);
        const config = {
            items: [docdata.subject], //current subject (from document)
            options: [{ _id: docdata.subject }], //available subjects (from document)

            create: true,
            labelField: "_id",
            persist: false,
            openOnFocus: true,
            searchField: "_id",
            sortField: "_id",
            valueField: "_id",
            maxItems: 1,

            plugins: ["restore_on_backspace"],

            onChange: (value) => {
                redsave();
            },
        };

        new TomSelect("#subjectselect", config);

        //Initialize Partner Autocomplete
        $.getJSON("/api/v1/partners", function (partnerlist) {
            const config = {
                items: [docdata.partner], //currently selected partner (from document)
                options: partnerlist, //available partners (from api)

                labelField: "_id",
                persist: false,
                openOnFocus: true,
                searchField: "_id",
                sortField: "_id",
                valueField: "_id",

                onChange: (value) => {
                    redsave();
                },
            };

            new TomSelect("#partnerselect", config);
        });

        //Fix page header column height
        $("#editcol").css({
            height: +$("#pageheadercol").height(),
        });

        //delete preview "are you sure"
        //TODO BOOTSTAP THIS
        $(".deletepreview").on("click", function () {
            const page = this.id.split("_").pop();
            Materialize.Toast.removeAll();
            const $toastContent = $(
                '<i class="material-icons medium white-text">delete_forever</i>'
            ).add(
                $(
                    '<a href="/doc/' +
                        docdata._id +
                        "/delete/" +
                        page +
                        "?previews=" +
                        docdata.previews +
                        '" class="btn-flat toast-action">Sicher?</button>'
                )
            );
            Materialize.toast($toastContent, 10000, "rounded");
        });

        //tags
        $.getJSON("/api/v1/tags", function (taglist) {
            const config = {
                items: docdata.tags, //currently selected tags (from document)
                options: taglist, //available tags (from api)

                labelField: "_id",
                persist: false,
                openOnFocus: true,
                searchField: "_id",
                sortField: "_id",
                valueField: "_id",

                plugins: ["remove_button"],

                onChange: (value) => {
                    redsave();
                },
            };
            new TomSelect("#tagselect", config);
        });

        $("#ocr1").on("click", function () {
            ocr(0, docdata);
        });

        //setTimeout(function () {
        //    $(".previewcontainer").css("min-height", "0px");
        //}, 600);

        //load a placeholder if preview image is not (yet) created
        /*
        imgsel.on("error", function () {
            $(this).unbind("error");
            $(this).attr("src", "/images/papierkorb-logo.png");
        });
        */
        $(".ppkprevimage").resizable({
            containment: ".preparent",
        });

        //reloadpreview button
        $(".reloadpreview").on("click", function () {
            const image = $(this).attr("data-id");
            const numimagesel = $("#" + image);
            const dstsrc = numimagesel.attr("data-src");
            numimagesel.attr("src", dstsrc + "?ts=" + new Date().getTime());
        });

        function rotateCSS(t, deg) {
            const i = $("#" + $(t).attr("data-id"));
            const ip = i.parent();

            i.css({
                transform: "rotate(" + deg + "deg)",
            });

            i.attr("data-rotation", deg);

            if (deg === 0 || deg === 180) {
                i.width(ip.width());
                i.height(ip.height());
            } else {
                if (i.width() > ip.height()) {
                    i.width(ip.height());
                }

                if (i.height() > ip.width()) {
                    i.height(ip.width());
                }
            }
        }

        //rotateleft button
        $(".rotateleft").on("click", function () {
            rotateCSS(this, 270);
        });

        //rotateright button
        $(".rotateright").on("click", function () {
            rotateCSS(this, 90);
        });

        //rotate180 button
        $(".rotate180").on("click", function () {
            rotateCSS(this, 180);
        });

        //rotateback button
        $(".rotateback").on("click", function () {
            rotateCSS(this, 0);
        });

        $(".rotatesave").on("click", function () {
            $(this).css({
                "pointer-events": "none",
            });

            const i = $("#" + $(this).attr("data-id"));

            i.css({ cursor: "progress" });

            let rot = i.attr("data-rotation")
                ? parseInt(i.attr("data-rotation"))
                : 0;

            if (rot === 90 || rot === 270) {
                rot -= 180; //not sure why, though.
            }

            const preview = parseInt($(this).attr("data-id").split("_")[1]);

            const url = `/api/v1/rotate/${docid}/${preview}?rot=${rot}`;

            if (rot !== 0) {
                $.getJSON(url, (data) => {
                    console.log(data);

                    const src = i.attr("src");
                    i.attr("src", src + "?timestamp=" + new Date().getTime())
                        .css({
                            transform: "rotate(0deg)",
                        })
                        .attr("data-rotation", 0);
                    i.width("100%").height("100%");

                    $(this).css({
                        "pointer-events": "auto",
                    });
                    i.css({ cursor: "auto" });
                });
            } else {
                $(this).css({
                    "pointer-events": "auto",
                });
                i.css({ cursor: "auto" });
            }
        });

        if ($(".doctext").val() === "") {
            //ocr(0, docdata);
        }
    });

    $("#save").on("click", function () {
        const docdata = {};

        docdata.subject = $("#subjectselect")[0].tomselect.getValue().trim();
        docdata.partner = $("#partnerselect")[0].tomselect.getValue().trim();
        docdata.docdate = $("#docdate").val().trim();

        const tags = $("#tagselect")[0].tomselect.getValue();

        docdata.tags = [];
        tags.forEach((value) => {
            if (value && value !== "") {
                docdata.tags.push(value.trim());
            }
        });
        if (docdata.tags.length === 0) {
            delete docdata.tags;
        }

        docdata.users = [];
        $('input:checked[name="users"]').each(function () {
            if ($(this).val() && $(this).val() !== "") {
                docdata.users.push($(this).val());
            }
        });
        if (docdata.users.length === 0) {
            delete docdata.users;
        }

        $.post(
            "/api/v1/doc/" + docid + "/",
            $.param(docdata, true),
            function (data, status) {
                if (status === "success") {
                    bluesave();
                    sokObj.show();
                } else {
                    snoObj.show();
                }
            },
            "json"
        );
    });
});
