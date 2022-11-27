const express = require("express");
const router = express.Router();

const render = require("../modules/render.js");

const config = require("config");
const conf = config.get("conf");

router.get("/", function (req, res, next) {
    const title = "Willkommen im Papierkorb";
    render.rendercallback(null, req, res, "index", {}, conf, title);
});

module.exports = router;
