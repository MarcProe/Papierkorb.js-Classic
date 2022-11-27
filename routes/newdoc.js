const express = require("express");
const router = express.Router();

const glob = require("glob");
const moment = require("moment");

const config = require("config");
const conf = config.get("conf");

const render = require("../modules/render.js");

const fs = require("fs");
const fse = require("fs-extra");
const san = require("sanitize-filename");

const inspect = require("eyes").inspector({ maxLength: 20000 });

router.get("/:filename?/:func?", async function (req, res, next) {
    await handle(req, res, next);
});

router.post("/:filename?/:func?", async function (req, res, next) {
    await handle(req, res, next);
});

async function handle(req, res, next) {
    switch (req.params.func) {
        case "create":
            create(req, res, next);
            break;

        case "upload":
            await upload(req, res, next);
            break;

        case "remove":
            remove(req, res, next);
            break;

        default:
            glob(
                "*.pdf",
                { cwd: conf.doc.newpath, nocase: true },
                function (err, files) {
                    let filearr = [];

                    files.forEach(function (entry) {
                        let fileobj = {};
                        const stats = fs.statSync(
                            conf.doc.newpath + san(entry)
                        );

                        fileobj.file = entry;
                        fileobj.size = Math.round(stats.size / 1024.0);
                        fileobj.mtime = stats.mtime;
                        filearr.push(fileobj);
                    });
                    //console.log(filearr);
                    render.rendercallback(
                        err,
                        req,
                        res,
                        "newdoc",
                        filearr,
                        conf,
                        "Neue Dokumente"
                    );
                }
            );
            break;
    }
}

function remove(req, res, next) {
    let filepath = conf.doc.newpath + san(req.params.filename);
    console.log(filepath);
    fse.remove(filepath)
        .then(function () {
            //noop
        })
        .catch(function (err) {
            console.log("Error deleting file" + err);
        });
    res.redirect("/new/");
}

async function upload(req, res, next) {
    console.log("upload calling!");
    console.log(req.files);
    let targetfile = san(req.files.file.name);
    console.log(targetfile);

    try {
        fs.writeFileSync(conf.doc.newpath + targetfile, req.files.file.data);
    } catch (e) {
        console.log(e); //TODO  Error Rendering
    }

    res.redirect("/new/");
}

function create(req, res, next) {
    let targetfile = moment().utc().toISOString().replace(/:/g, "-") + ".pdf";
    let src = conf.doc.newpath + san(req.params.filename);
    let target = conf.doc.basepath + targetfile;

    //move doc from new to doc
    fse.moveSync(src, target);
    //create doc
    req.app.locals.db
        .collection(conf.db.c_doc)
        .updateOne(
            { _id: targetfile },
            { $set: { previews: 0 } },
            { upsert: true }
        );
    redirect(res, targetfile); //redirect to the doc
}

function redirect(res, targetfile) {
    res.writeHead(302, {
        Location: "/doc/" + targetfile + "/",
    });
    res.end();
}

module.exports = router;
