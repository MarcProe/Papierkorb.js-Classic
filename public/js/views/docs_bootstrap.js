$(document).ready(function () {
    $(".hoverover").on("mouseenter", function (evt) {
        const src = this;

        const left = $(window).width() / 3;
        const width = $(window).width() * 0.5;
        const top = $("#navbar").height();

        const hoverimgctn = $("#hoverimage");
        const hoverimg = $("#hoverimg");
        const previewUrl = hoverimgctn.attr("data-base");

        hoverimg
            .css({ position: "fixed", top: `${top}px` })
            .attr("width", `${width}px`)
            .attr("src", `${previewUrl}${src.id}.0.thumb.png`);

        hoverimgctn.css({ left: left, top: 100 }).show();

        $(this).on("mouseleave", function () {
            hoverimgctn.hide();
        });
    });
});
