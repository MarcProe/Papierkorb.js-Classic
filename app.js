let express = require("express");
let path = require("path");
let favicon = require("serve-favicon");
let logger = require("morgan");
let cookieParser = require("cookie-parser");
let bodyParser = require("body-parser");
let session = require("express-session");
let MemoryStore = require("memorystore")(session);
let errorHandler = require("errorhandler");
let csrf = require("csurf");

let inspect = require("eyes").inspector({
    maxLength: 20000,
    hideFunctions: true,
});

let index = require("./routes/index");
let docs = require("./routes/docs");
let doc = require("./routes/doc");
let newdoc = require("./routes/newdoc");
let remove = require("./routes/remove");
let partners = require("./routes/partners");
let api = require("./routes/api");

let mongo = require("mongodb").MongoClient;
let config = require("config");

const fileUpload = require("express-fileupload");
const cookiehandler = require("./modules/cookiehandler");

let conf = config.get("conf");

let app = express();

app.locals.moment = require("moment");

let url = conf.db.constring + conf.db.db;

inspect(conf.doc, "Storage config");

process.on("unhandledRejection", (reason, p) => {
    console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
    // application specific logging, throwing an error, or other logic here
});

process.on("uncaughtException", function (exception) {
    console.log(exception); // to see your exception details in the console
    // if you are on production, maybe you can send the exception details to your
    // email as well ?
});

mongo.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;

    console.log("Database connected. (" + conf.db.constring + ")");
    let dbase = db.db(conf.db.db);

    app.locals.db = dbase;

    createcol(dbase, conf.db.c_user)
        .then(function () {
            console.log("Collection " + conf.db.c_user + " created");
            return createcol(dbase, conf.db.c_doc);
        })
        .then(function () {
            console.log("Collection " + conf.db.c_doc + " created");
            return createcol(dbase, conf.db.c_tag);
        })
        .then(function () {
            console.log("Collection " + conf.db.c_tag + " created");
            return createcol(dbase, conf.db.c_partner);
        })
        .then(function () {
            console.log("Collection " + conf.db.c_partner + " created");
        })
        .catch(function (err) {
            if (err.code === 48) {
                console.log(
                    "Collections already exists. " + JSON.stringify(err)
                );
            } else {
                console.log("Error creating collections.");
                console.log(err);
            }
        });
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(errorHandler({ dumpExceptions: true, showStack: true }));
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(fileUpload());
app.use(
    session({
        secret: "fgdg345DFG4324ftr$§fqa3f43fq$Q§",
        resave: false,
        saveUninitialized: true,
        store: new MemoryStore({
            checkPeriod: 86400000, // prune expired entries every 24h
        }),
    })
);
//app.use(csrf({ cookie: true }));
app.use((req, res, next) => {
    cookiehandler.handle(req, res, next);
});

app.use("/", index);
app.use("/doc/", docs);
app.use("/doc", doc);
app.use("/new", newdoc);
app.use("/remove", remove);
app.use("/partners", partners);
app.use("/api", api);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

function createcol(db, name) {
    return db.createCollection(name);
}

module.exports = app;
