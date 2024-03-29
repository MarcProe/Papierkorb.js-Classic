const express = require("express");
const router = express.Router();

const conf = require("config").get("conf");
const moment = require("moment");
const Jimp = require("jimp");
const fs = require("fs");
const san = require("sanitize-filename");

const inspect = require("eyes").inspector({ maxLength: 20000 });

router.get("/:version/:func/:docid?/:genid?", function (req, res, next) {
    switch (req.params.func) {
        case "end":
            res.writeHead(200, {
                message: "process about to end",
            });
            res.end();
            process.exit(1);
        case "partners":
            handleGet(req, res, next, getpartners);
            break;
        case "user":
            handleGet(req, res, next, getuser);
            break;
        case "tags":
            handleGet(req, res, next, gettags);
            break;
        case "doc":
            handleGet(req, res, next, getdoc);
            break;
        case "docs":
            handleGet(req, res, next, getdocs);
            break;
        case "preview":
            getpreview(req, res, next);
            break;
        case "download":
            download(req, res, next);
            break;
        case "rotate":
            rotate(req, res, next);
            break;
        default:
            return res
                .status(404)
                .send({ message: `endpoint unknown: ${req.params.func}` });
    }
});

router.post("/:version/:func/:docid?/", function (req, res, next) {
    switch (req.params.func) {
        case "ocr":
            try {
                req.app.locals.db
                    .collection(conf.db.c_doc)
                    .updateOne(
                        { _id: req.params.docid },
                        { $set: req.body },
                        { upsert: false },
                        function (err, result) {
                            if (err) {
                                throw err;
                            } else {
                                res.send({ message: result });
                                res.end();
                            }
                        }
                    );
            } catch (err) {
                res.writeHead(500, {
                    message: err,
                });
                res.end();
            }
            break;
        case "doc":
            savedoc(req, res, next);
            break;
        default: //TODO: check if this works
            res.writeHead(404, {
                message: "method not found",
            });
            res.end();
            break;
    }
});

router.put("/:version/:func/:docid?/", function (req, res, next) {
    switch (req.params.func) {
        case "doc": {
            console.log("putting");
            inspect(req.body);
            console.log(moment.utc(req.body.docdate));
            res.end();
            break;
        } //TODO: add default
    }
});

function handleGet(req, res, next, func) {
    func(req, res, next)
        .then(function (result) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(result));
        })
        .catch(function (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify(err));
        });
}

function getpartners(req, res, next) {
    return new Promise(function (resolve, reject) {
        if (req.session.partnerlist) {
            resolve(req.session.partnerlist);
        } else {
            req.app.locals.db
                .collection(conf.db.c_partner)
                .find({})
                .toArray(function (err, partnerlistres) {
                    if (err) {
                        reject(err);
                    } else {
                        req.session.partnerlist = partnerlistres;
                        resolve(partnerlistres);
                    }
                });
        }
    });
}

function gettags(req, res, next) {
    return new Promise(function (resolve, reject) {
        if (req.session.taglist) {
            resolve(req.session.taglist);
        } else {
            req.app.locals.db
                .collection(conf.db.c_tag)
                .find({})
                .sort({ _id: 1 })
                .toArray(function (err, taglistres) {
                    if (err) {
                        reject(err);
                    } else {
                        req.session.taglist = taglistres;
                        resolve(taglistres);
                    }
                });
        }
    });
}

function getuser(req, res, next) {
    return new Promise(function (resolve, reject) {
        if (req.session.userlist) {
            resolve(req.session.userlist);
        } else {
            req.app.locals.db
                .collection(conf.db.c_user)
                .find({})
                .toArray(function (err, userlistres) {
                    if (err) {
                        reject(err);
                    } else {
                        req.session.userlist = userlistres;
                        resolve(userlistres);
                    }
                });
        }
    });
}

function getdoc(req, res, next) {
    return new Promise(function (resolve, reject) {
        let query = { _id: req.params.docid };

        req.app.locals.db
            .collection(conf.db.c_doc)
            .find(query)
            .toArray(function (err, doc) {
                if (err) {
                    reject(err);
                } else {
                    if (doc[0]) {
                        resolve(doc[0]);
                    } else {
                        reject({ message: "no result" });
                    }
                }
            });
    });
}

function getdocs(req, res, next) {
    return new Promise(function (resolve, reject) {
        let query = {};
        let proj = { plaintext: 0 };

        req.app.locals.db
            .collection(conf.db.c_doc)
            .find(query)
            .project(proj)
            .toArray(function (err, docs) {
                if (err) {
                    reject(err);
                } else {
                    if (docs) {
                        resolve(docs);
                    } else {
                        reject({ message: "no result" });
                    }
                }
            });
    });
}

function savedoc(req, res, next) {
    console.log(req.body);
    //now, what?

    //prepare data
    let isodate = moment.utc(req.body.docdate, "DD.MM.YYYY").toISOString();

    let users = [];
    if (req.body.users) {
        if (req.body.users.constructor === Array) {
            //If only one element is given, the type is string, which is bad
            users = req.body.users;
        } else {
            users = [req.body.users];
        }
    }

    let tags = [];
    if (req.body.tags) {
        if (req.body.tags.constructor === Array) {
            //If only one element is given, the type is string, which is bad
            tags = req.body.tags;
        } else {
            tags = [req.body.tags];
        }
    }

    let savetags = [];

    //create new tags
    tags.forEach(function (tag) {
        let dbtag = {};
        dbtag._id = tag;

        let foundtag = req.session.taglist.some(function (el) {
            return el._id === dbtag._id;
        });
        if (!foundtag) {
            req.session.taglist.push(dbtag); //all tags
            savetags.push(dbtag); //only new tags
        }
    });

    if (savetags && savetags[0]) {
        req.app.locals.db
            .collection(conf.db.c_tag)
            .insertMany(savetags, { ordered: false }, function (err, res) {
                if (err) {
                    console.error(err);
                }
            });
    }

    //create new partner
    if (req.body.partner) {
        let foundpartner = req.session.partnerlist.some(function (element) {
            return element._id === req.body.partner;
        });

        if (!foundpartner) {
            let dbpartner = {
                _id: req.body.partner,
                name: req.body.partner,
            };
            req.session.partnerlist.push(dbpartner);

            req.app.locals.db
                .collection(conf.db.c_partner)
                .insertOne(dbpartner, function (err, res) {
                    if (err) {
                        console.error(err);
                    }
                });
        }
    }

    //update document
    let docdata = {
        $set: {
            subject: req.body.subject,
            users: users ? users : [],
            docdate: isodate ? isodate : "",
            partner: req.body.partner,
            tags: tags ? tags : [],
            previews: req.body.previews ? req.body.previews : 0,
        },
    };
    console.log(docdata);
    req.app.locals.db
        .collection(conf.db.c_doc)
        .updateOne(
            { _id: req.params.docid },
            docdata,
            { upsert: true },
            function (err, result) {
                if (err) {
                    res.send({ message: err });
                    res.end();
                } else {
                    res.send({ message: "ok" });
                    res.end();
                }
            }
        );
}

function getpreview(req, res, next, thumb) {
    //TODO check thumb param, it is not given to the function
    let thumbname = "";
    if (thumb) {
        thumbname = ".thumb";
    }

    let id = req.params.genid ? req.params.genid : 0;
    let imagepath =
        conf.doc.imagepath +
        san(req.params.docid) +
        "." +
        san(id + thumbname) +
        ".png";

    img = fs.readFileSync(imagepath);
    res.writeHead(200, { "Content-Type": Jimp.MIME_PNG });
    res.end(img, "binary");
}

function download(req, res, next) {
    let file = fs.readFileSync(conf.doc.basepath + san(req.params.docid));
    res.writeHead(200, { "Content-Type": "application/pdf" });
    res.end(file, "binary");
}

function rotate(req, res, next) {
    const docid = san(req.params.docid);
    const id = req.params.genid ? san(req.params.genid) : 0;
    const rot = parseInt(req.query.rot);
    const thumbname = ".thumb";

    const imagepath = conf.doc.imagepath + docid + "." + id + ".png";
    const thumbpath = conf.doc.imagepath + docid + "." + id + ".thumb.png";

    Jimp.read(imagepath)
        .then((image) => {
            image.rotate(rot).write(imagepath, (info) => {
                Jimp.read(thumbpath)
                    .then((image) => {
                        image.rotate(rot).write(thumbpath, (info) => {
                            res.send({ ret: "ok", info: info });
                            res.end();
                        });
                    })
                    .catch((err) => {
                        res.send({ ret: "err", path: thumbpath, err: err });
                        res.end();
                    });
            });
        })
        .catch((err) => {
            res.send({ ret: "err", path: imagepath, err: err });
            res.end();
        });
}

module.exports = router;
