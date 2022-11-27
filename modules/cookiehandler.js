let cookiehandler = {
    handle: function (req, res, next) {
        next();
    },
};

module.exports = cookiehandler;
