$(document).ready(function () {
    $(".hoverover").on("mouseenter", function (evt) {
        const src = this;
        const left = $(window).width() / 3;
        const hoverimagesel = $("#hoverimage");
        const previewUrl = hoverimagesel.attr("data-base");

        hoverimagesel
            .html(
                '<img style="position:fixed; top:10px" width="' +
                    $(window).width() * 0.5 +
                    'px" src="' +
                    previewUrl +
                    src.id +
                    '.0.thumb.png" />'
            )
            .css({ left: left, top: 100 })
            .show();
        $(this).on("mouseleave", function () {
            hoverimagesel.hide();
        });
    });
});
