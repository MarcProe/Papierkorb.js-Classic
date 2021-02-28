let cookiehandler = {
    handle: function (req, res, next) {
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
        next();
    },
};

module.exports = cookiehandler;
