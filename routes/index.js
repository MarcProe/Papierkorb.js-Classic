const express = require("express");
const router = express.Router();

const render = require("../modules/render.js");

const config = require("config");
const conf = config.get("conf");

router.get("/", function (req, res, next) {
    if (req.query.bootstrap === "1") {
        req.session.bootstrap = true;
        res.cookie("bootstrap", true, {
            maxAge: 900000,
            httpOnly: true,
        });
    } else if (req.query.bootstrap === "0") {
        req.session.bootstrap = false;
        res.cookie("bootstrap", false, {
            maxAge: 900000,
            httpOnly: true,
        });
    } else {
        req.session.bootstrap = req.cookies.bootstrap === "true";
    }

    const title = "Willkommen im Papierkorb";
    render.rendercallback(null, req, res, "index", {}, conf, title);
});

module.exports = router;
