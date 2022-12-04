const idregex = /.*(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.\d{3}Z\.pdf).*/g;
const docid = idregex.exec(window.location.href)[1];
const url = `/download/${docid}`;

var pdfDoc = null;
var pageNum = 1;
var pageRendering = false;
var pageNumPending = null;
const canvas = document.getElementById("pdf-canvas");
const ctx = canvas.getContext("2d");

function renderPage(num, rot = false) {
    console.log("rendering pdf page " + num);
    pageRendering = true;
    pdfDoc.getPage(num).then(function (page) {
        const maincont = document.getElementById("pdf-main-container");
        let scale = 0;

        if (rot) {
            scale =
                maincont.getBoundingClientRect().width /
                page.getViewport({ scale: 1.0 }).height;
        } else {
            scale =
                maincont.getBoundingClientRect().width /
                page.getViewport({ scale: 1.0 }).width;
        }

        const viewport = page.getViewport({ scale: scale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport,
        };
        const renderTask = page.render(renderContext);

        renderTask.promise.then(function () {
            pageRendering = false;
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });

    document.getElementById("pdf-current-page").textContent = num;
}

function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

function onPrevPage() {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}
document.getElementById("pdf-prev").addEventListener("click", onPrevPage);

function onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}
document.getElementById("pdf-next").addEventListener("click", onNextPage);

function onGotoPage(event) {
    pageNum = parseInt(event.target.id.substring(10));
    queueRenderPage(pageNum);
}
const renderpages = document.getElementsByClassName("renderpage");
for (let i = 0; i < renderpages.length; i++) {
    renderpages[i].addEventListener("click", onGotoPage);
}

// Start Rendering
function loadPdf() {
    pdfjsLib.getDocument(url).promise.then(function (pdfDoc_) {
        pdfDoc = pdfDoc_;
        document.getElementById("pdf-num-pages").textContent = pdfDoc.numPages;

        renderPage(pageNum);
    });
}
$(document).ready(function () {
    loadPdf();
});
