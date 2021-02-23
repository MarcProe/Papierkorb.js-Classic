const express = require("express");
const router = express.Router();

const render = require("../modules/render.js");

const config = require("config");
const conf = config.get("conf");

router.get("/", function (req, res, next) {
    if (req.query.bootstrap === "1") {
        req.session.bootstrap = true;
    } else {
        req.session.bootstrap = false;
    }
    const title = "Willkommen im Papierkorb";
    render.rendercallback(null, req, res, "index", {}, conf, title);
});

module.exports = router;
