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

    let idregex = /.*(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.\d{3}Z\.pdf).*/g;
    let docid = idregex.exec(window.location.href)[1];

    $.getJSON("/api/v1/doc/" + docid, function (docdata) {
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

            plugins: ["restore_on_backspace"],

            onChange: (value) => {
                redsave();
            },
        };

        new TomSelect("#subjectselect", config);

        //Initialize Datepicker
        $(".datepicker")
            .datepicker({
                format: "dd.mm.yyyy",
                todayBtn: "linked",
                orientation: "bottom left",
                calendarWeeks: true,
                autoclose: true,
                todayHighlight: true,
                weekStart: 1,
                language: "de-DE",
            })
            .on("show", (e) => {
                //let dateinbox = moment
                //    .utc($("#docdate").val(), "DD.MM.YYYY")
                //    .valueOf();

                //this.setUTCDate(dateinbox);

                $("#docdate").removeClass("red-text");
                redsave();
            });

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
            };
            /*
            $("#partnerselect").selectize(config);
            */

            new TomSelect("#partnerselect", config);

            //TODO REMOVE
            /*
            let partnersel = $("#partner");
            partnersel.autocomplete({
                data: plist,
                limit: 20,
                onAutocomplete: function (val) {
                    redsave();
                },
                minLength: 1,
            });

            partnersel.on("click", function () {
                $(this).val("");
                $(this).removeClass("red-text");
                redsave();
            });
            */
        });

        //Fix page header column height
        $("#editcol").css({
            height: +$("#pageheadercol").height(),
        });

        //delete preview "are you sure"
        $(".deletepreview").on("click", function () {
            let page = this.id.split("_").pop();
            Materialize.Toast.removeAll();
            let $toastContent = $(
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
            };
            //$("#tagselect").selectize(config);
            new TomSelect("#tagselect", config);
            //TODO REMOVE
            /*
            let tagstooltipsel = $("#tagstooltip");
            tagstooltipsel.attr(
                "data-tooltip",
                '<div class="flow-text">' + tagtooltip + "</div>"
            );
            tagstooltipsel.tooltip({ delay: 50 });

            let chipssel = $(".chips");
            let chipsautocompletesel = $(".chips-autocomplete");
            chipssel.material_chip();

            chipsautocompletesel.material_chip({
                placeholder: "Tags eingeben",
                secondaryPlaceholder: "Mehr Tags",
                autocompleteOptions: {
                    data: tags,
                    limit: Infinity,
                    minLength: 1,
                },
                data: seltags,
            });

            let hiddentagssel = $("#hidden_tags");
            hiddentagssel.val(JSON.stringify(seltags)); //store array
            chipssel.on("chip.add", function (e, chip) {
                hiddentagssel.val(
                    JSON.stringify(chipsautocompletesel.material_chip("data"))
                );
            });

            chipssel.on("chip.delete", function (e, chip) {
                hiddentagssel.val(
                    JSON.stringify(chipsautocompletesel.material_chip("data"))
                );
            });
            */
        });

        $("#ocr1").on("click", function () {
            ocr(0, docdata);
        });

        setTimeout(function () {
            $(".previewcontainer").css("min-height", "0px");
        }, 600);

        //load a placeholder if preview image is not (yet) created
        /*
        imgsel.on("error", function () {
            $(this).unbind("error");
            $(this).attr("src", "/images/papierkorb-logo.png");
        });
        */

        //reloadpreview button
        $(".reloadpreview").on("click", function () {
            let image = $(this).attr("data-id");
            let numimagesel = $("#" + image);
            let src = numimagesel.attr("data-src");
            numimagesel.attr("src", src + "?timestamp=" + new Date().getTime());
        });

        //rotateleft button
        $(".rotateleft").on("click", function () {
            let image = $(this).attr("data-id");
            $("#" + image).css({
                "-webkit-transform": "rotate(-90deg)",
                "-moz-transform": "rotate(-90deg)",
                transform: "rotate(-90deg)" /* For modern browsers(CSS3)  */,
            });
        });

        //rotateright button
        $(".rotateright").on("click", function () {
            let image = $(this).attr("data-id");
            $("#" + image).css({
                "-webkit-transform": "rotate(90deg)",
                "-moz-transform": "rotate(90deg)",
                transform: "rotate(90deg)" /* For modern browsers(CSS3)  */,
            });
        });

        //rotate180 button
        $(".rotate180").on("click", function () {
            let image = $(this).attr("data-id");
            $("#" + image).css({
                "-webkit-transform": "rotate(180deg)",
                "-moz-transform": "rotate(180deg)",
                transform: "rotate(180deg)" /* For modern browsers(CSS3)  */,
            });
        });

        //rotateback button
        $(".rotateback").on("click", function () {
            let image = $(this).attr("data-id");
            $("#" + image).css({
                "-webkit-transform": "rotate(0deg)",
                "-moz-transform": "rotate(0deg)",
                transform: "rotate(0deg)" /* For modern browsers(CSS3)  */,
            });
        });

        if ($(".doctext").val() === "") {
            //ocr(0, docdata);
        }
    });

    $("#save").on("click", function () {
        const docdata = {};

        docdata.subject = _.get(
            $("#subjectselect")[0],
            "tomselect.lastValue",
            ""
        ).trim();
        docdata.partner = _.get(
            $("#partnerselect")[0],
            "tomselect.items[0]",
            ""
        ).trim();

        docdata.docdate = $("#docdate").val();

        const tags = _.get($("#tagselect")[0], "tomselect.items", []);
        docdata.tags = [];
        tags.forEach((value) => {
            if (value && value !== "") {
                docdata.tags.push(value);
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

        console.log(docdata);

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
