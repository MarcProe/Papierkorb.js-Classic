//init a lot of stuff
$(document).ready(function () {
    function redsave() {
        $("#save").removeClass("blue").removeClass("red").addClass("red");
    }

    let idregex = /.*(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.\d{3}Z\.pdf).*/g;
    let docid = idregex.exec(window.location.href)[1];

    $(".tooltipped").tooltip();
    $(".fixed-action-btn").floatingActionButton({
        direction: "bottom",
        hoverEnabled: false,
    });

    //TODO subject autocomplete
    $("#subject").on("input", function () {
        redsave();
    });

    $.getJSON("/api/v1/doc/" + docid, function (docdata) {
        console.log(docdata);
        let date = new Date(docdata.docdate);
        $(".docdate").datepicker({
            // specify options here
            defaultDate: date, // TODO: founddate
            setDefaultDate: true,
            format: "dd.mm.yyyy",
            firstDay: 1,
            showClearBtn: false,
            i18n: {
                cancel: "Abbrechen",
                clear: "L&ouml;schen",
                done: "Ok",
                months: [
                    "Januar",
                    "Februar",
                    "März",
                    "April",
                    "Mai",
                    "Juni",
                    "Juli",
                    "August",
                    "September",
                    "Oktober",
                    "November",
                    "Dezember",
                ],
                monthsShort: [
                    "Jan",
                    "Feb",
                    "Mär",
                    "Apr",
                    "Mai",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Okt",
                    "Nov",
                    "Dez",
                ],
                weekdays: [
                    "Sonntag",
                    "Montag",
                    "Dienstag",
                    "Mittwoch",
                    "Donnerstag",
                    "Freitag",
                    "Samstag",
                ],
                weekdaysShort: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
                weekdaysAbbrev: ["S", "M", "D", "M", "D", "F", "S"],
            },
            onOpen: function () {
                $("#docdate").removeClass("red-text");
                redsave();
            },
        });

        //User
        $(".jqusers").on("click", function () {
            redsave();
        });

        //Initialize Partner Autocomplete
        $.getJSON("/api/v1/partners", function (partnerlist) {
            let plist = {};
            for (index = 0; index < partnerlist.length; ++index) {
                plist[partnerlist[index].name] = partnerlist[index].logo;
            }

            let partnersel = $("#partner");
            partnersel.autocomplete({
                // specify options here
                data: plist,
                onAutocomplete: function () {
                    redsave();
                },
                minLength: 1,
            });

            partnersel.on("click", function () {
                $(this).val("");
                $(this).removeClass("red-text");
                redsave();
            });
        });

        $("#partner").on("input", function () {
            redsave();
        });

        //Initialize modal delete dialogue
        let modaldeletesel = $("#modaldelete");
        modaldeletesel.modal();
        $("#canceldelete").on("click", function () {
            modaldeletesel.modal("close");
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

        //tag chips
        $.getJSON("/api/v1/tags", function (taglist) {
            taglist = taglist.sort(function (a, b) {
                return a._id > b._id ? 1 : b._id > a._id ? -1 : 0;
            });

            let seltags = [];
            if (docdata.tags) {
                docdata.tags.forEach(function (tag) {
                    seltags.push({ tag: tag });
                });
            }

            let tags = {};
            let tagtooltip = "";
            if (taglist) {
                taglist.forEach(function (tag) {
                    tags[tag._id] = null;
                    tagtooltip += tag._id + ", ";
                });
            }

            let tagstooltipsel = $("#tagstooltip");
            tagstooltipsel.attr(
                "data-tooltip",
                '<div class="flow-text">' + tagtooltip + "</div>"
            );
            tagstooltipsel.tooltip({ delay: 50 });

            let chipsautocompletesel = $(".chips-autocomplete");
            let hiddentagssel = $("#hidden_tags");

            const chipchange = () => {
                const instance = M.Chips.getInstance(chipsautocompletesel);
                const djson = JSON.stringify(instance.chipsData);
                hiddentagssel.val(djson);
                redsave();
            };

            chipsautocompletesel.chips({
                placeholder: "Tags eingeben",
                secondaryPlaceholder: "Mehr Tags",
                autocompleteOptions: {
                    data: tags,
                    limit: Infinity,
                    minLength: 1,
                },
                data: seltags,
                onChipAdd: () => {
                    chipchange();
                },
                onChipDelete: () => {
                    chipchange();
                },
            });

            hiddentagssel.val(JSON.stringify(seltags)); //store initial array
        });

        $("#ocr1").on("click", function () {
            ocr(0, docdata);
        });

        setTimeout(function () {
            $(".previewcontainer").css("min-height", "0px");
        }, 600);

        //reloadpreview button
        $("#reloadpreview").on("click", function () {
            renderPage(1);
        });

        //rotateleft button
        $("#rotateleft").on("click", function () {
            renderPage(1, true);

            const c = $("#pdf-parent");
            c.css({
                "-webkit-transform": `rotate(-90deg)`,
                "-moz-transform": `rotate(-90deg)`,
                transform: "rotate(-90deg)" /* For modern browsers(CSS3)  */,
                "transform-origin": "center center",
                "z-index": -1,
            });
        });

        //rotateright button
        $("#rotateright").on("click", function () {
            renderPage(1, true);

            const c = $("#pdf-parent");
            c.css({
                "-webkit-transform": `rotate(90deg)`,
                "-moz-transform": `rotate(90deg)`,
                transform: "rotate(90deg)" /* For modern browsers(CSS3)  */,
                "transform-origin": "center center",
                "z-index": -1,
            });
        });

        //rotate180 button
        $("#rotate180").on("click", function () {
            renderPage(1, false);

            let c = $("#pdf-parent");
            c.css({
                "-webkit-transform": "rotate(180deg)",
                "-moz-transform": "rotate(180deg)",
                transform: "rotate(180deg)" /* For modern browsers(CSS3)  */,
                "transform-origin": "center center",
                "z-index": -1,
            });
        });

        //rotateback button
        $("#rotateback").on("click", function () {
            renderPage(1, false);

            let c = $("#pdf-parent");
            c.css({
                "-webkit-transform": "rotate(0deg)",
                "-moz-transform": "rotate(0deg)",
                transform: "rotate(0deg)" /* For modern browsers(CSS3)  */,
                "transform-origin": "center center",
                "z-index": -1,
            });
        });

        if ($(".doctext").val() === "") {
            //ocr(0, docdata);
        }
    });

    $("#save").on("click", function () {
        let docdata = {};

        docdata.subject = $("#subject").val().trim();
        docdata.partner = $("#partner").val().trim();
        docdata.docdate = M.Datepicker.getInstance($("#docdate")).toString();
        let tags = $("#hidden_tags").val();
        docdata.tags = [];
        $.each(JSON.parse(tags), function (key, value) {
            if (value.tag && value.tag !== "") {
                docdata.tags.push(value.tag);
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
        docdata.previews = parseInt($("#pdf-num-pages").text().trim());

        $.post(
            "/api/v1/doc/" + docid + "/",
            $.param(docdata, true),
            function (data, status) {
                if (status === "success") {
                    $("#save")
                        .removeClass("red")
                        .removeClass("blue")
                        .addClass("blue");
                    $("#saveicon").text("done");
                    M.toast({
                        text: "Gespeichert.",
                        displayLength: 1000,
                        inDuration: 1000,
                        outDuration: 1000,
                    });
                    setTimeout(function () {
                        $("#saveicon").text("save");
                    }, 2000);
                } else {
                    Materialize.toast("Fehler: " + status, 4000);
                }
            },
            "json"
        );
    });
});
