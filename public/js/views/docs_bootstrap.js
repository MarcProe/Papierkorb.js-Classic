$(document).ready(function () {
    $(".hoverover").on("mouseenter", function (evt) {
        const src = this;
        const left = $(window).width() / 3;
        const hoverimagecontainer = $("#hoverimage");
        const hoverimg = $("#hoverimg");
        const previewUrl = hoverimagecontainer.attr("data-base");

        hoverimg
            .css({ position: "fixed", top: "10px" })
            .attr("width", $(window).width() * 0.5 + "px")
            .attr("src", `${previewUrl}${src.id}.0.thumb.png`);

        hoverimagecontainer.css({ left: left, top: 100 }).show();

        $(this).on("mouseleave", function () {
            hoverimagecontainer.hide();
        });
    });
});
