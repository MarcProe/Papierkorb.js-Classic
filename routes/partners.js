const express = require("express");
const router = express.Router();

const config = require("config");
const conf = config.get("conf");

const render = require("../modules/render.js");

router.get("/:filename?/:func?", function (req, res, next) {
    handle(req, res, next);
});

router.post("/:filename?/:func?", function (req, res, next) {
    handle(req, res, next);
});

function handle(req, res, next) {
    switch (req.params.func) {
        default:
            let uq = req.session.users;
            if (!uq) {
                uq = { $exists: true }; //match any user
            }
            const query = [
                {
                    $match: {
                        users: uq,
                    },
                },
                {
                    $group: {
                        _id: "$partner",
                        count: { $sum: 1 },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        count: 1,
                        lcid: { $toLower: "$_id" },
                    },
                },
                { $sort: { lcid: 1 } },
                { $limit: 1000 },
            ];

            req.app.locals.db
                .collection(conf.db.c_doc)
                .aggregate(query)
                .toArray(function (err, result) {
                    if (err) {
                        render.rendercallback(
                            err,
                            req,
                            res,
                            "error",
                            err,
                            conf,
                            "Fehler"
                        );
                    }
                    render.rendercallback(
                        err,
                        req,
                        res,
                        "partners",
                        result,
                        conf,
                        "Partner"
                    );
                });
            break;
    }
}

module.exports = router;
