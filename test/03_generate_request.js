let expect = require("chai").expect;
let request = require("request");
let sleep = require("asleep");
let mongo = require("mongodb").MongoClient;
let conf = require("config").get("conf");

describe("Document Creation", function () {
    describe("request /new/test.nld.pdf/create/", function () {
        this.slow(0);
        let url = "http://localhost:3000/new/test.nld.pdf/create/";

        it("should return status 200", function (done) {
            request(url, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                done();
            });
        }).timeout(20000);
    }),
        describe("wait for 60 seconds", function () {
            this.slow(99999);
            const w = 30000;
            it("should wait " + w + " seconds", function (done) {
                sleep(w).then(function () {
                    expect(true).to.equal(true);
                    done();
                });
            }).timeout(80000);
        }),
        describe("read document from database", function () {
            this.slow(0);
            it("should be in the database", function (done) {
                let dburl = conf.db.constring + conf.db.db;
                mongo.connect(dburl, function (err, db) {
                    db.db(conf.db.db)
                        .collection(conf.db.c_doc)
                        .findOne({}, function (err, result) {
                            expect(result._id).to.match(
                                /\d{4}\-\d{2}\-\d{2}T\d{2}\-\d{2}\-\d{2}\.\d{3}Z\.pdf/
                            );
                            db.close();
                            done();
                        });
                });
            });
        }),
        describe("check the previews", function () {
            this.slow(0);
            it("there should be 5 previews", function (done) {
                let dburl = conf.db.constring + conf.db.db;
                mongo.connect(dburl, function (err, db) {
                    db.db(conf.db.db)
                        .collection(conf.db.c_doc)
                        .findOne({}, function (err, result) {
                            expect(result.previews).to.equal(5);
                            db.close();
                            done();
                        });
                });
            });
            it("should return status 200 for the first preview", function (done) {
                let dburl = conf.db.constring + conf.db.db;
                mongo.connect(dburl, function (err, db) {
                    db.db(conf.db.db)
                        .collection(conf.db.c_doc)
                        .findOne({}, function (err, result) {
                            let url =
                                "http://localhost:3000/preview/" +
                                result._id +
                                ".0.png";
                            request(url, function (error, response, body) {
                                expect(response.statusCode).to.equal(200);
                                db.close();
                                done();
                            });
                        });
                });
            });
            it("should return content-type image/png for the first preview", function (done) {
                let dburl = conf.db.constring + conf.db.db;
                mongo.connect(dburl, function (err, db) {
                    db.db(conf.db.db)
                        .collection(conf.db.c_doc)
                        .findOne({}, function (err, result) {
                            let url =
                                "http://localhost:3000/preview/" +
                                result._id +
                                ".0.png";
                            request(url, function (error, response, body) {
                                expect(
                                    response.headers["content-type"]
                                ).to.equal("image/png");
                                db.close();
                                done();
                            });
                        });
                });
            });
            it("should return status 200 for the first thumb", function (done) {
                let dburl = conf.db.constring + conf.db.db;
                mongo.connect(dburl, function (err, db) {
                    db.db(conf.db.db)
                        .collection(conf.db.c_doc)
                        .findOne({}, function (err, result) {
                            let url =
                                "http://localhost:3000/preview/" +
                                result._id +
                                ".0.thumb.png";
                            request(url, function (error, response, body) {
                                expect(response.statusCode).to.equal(200);
                                db.close();
                                done();
                            });
                        });
                });
            });
            it("should return content-type image/png for the first thumb", function (done) {
                let dburl = conf.db.constring + conf.db.db;
                mongo.connect(dburl, function (err, db) {
                    db.db(conf.db.db)
                        .collection(conf.db.c_doc)
                        .findOne({}, function (err, result) {
                            let url =
                                "http://localhost:3000/preview/" +
                                result._id +
                                ".0.thumb.png";
                            request(url, function (error, response, body) {
                                expect(
                                    response.headers["content-type"]
                                ).to.equal("image/png");
                                db.close();
                                done();
                            });
                        });
                });
            });
            it("should return status 200 for the second preview", function (done) {
                let dburl = conf.db.constring + conf.db.db;
                mongo.connect(dburl, function (err, db) {
                    db.db(conf.db.db)
                        .collection(conf.db.c_doc)
                        .findOne({}, function (err, result) {
                            let url =
                                "http://localhost:3000/preview/" +
                                result._id +
                                ".1.png";
                            request(url, function (error, response, body) {
                                expect(response.statusCode).to.equal(200);
                                db.close();
                                done();
                            });
                        });
                });
            });
            it("should return content-type image/png for the second preview", function (done) {
                let dburl = conf.db.constring + conf.db.db;
                mongo.connect(dburl, function (err, db) {
                    db.db(conf.db.db)
                        .collection(conf.db.c_doc)
                        .findOne({}, function (err, result) {
                            let url =
                                "http://localhost:3000/preview/" +
                                result._id +
                                ".1.png";
                            request(url, function (error, response, body) {
                                expect(
                                    response.headers["content-type"]
                                ).to.equal("image/png");
                                db.close();
                                done();
                            });
                        });
                });
            });
            it("should return status 200 for the second thumb", function (done) {
                let dburl = conf.db.constring + conf.db.db;
                mongo.connect(dburl, function (err, db) {
                    db.db(conf.db.db)
                        .collection(conf.db.c_doc)
                        .findOne({}, function (err, result) {
                            let url =
                                "http://localhost:3000/preview/" +
                                result._id +
                                ".1.thumb.png";
                            request(url, function (error, response, body) {
                                expect(response.statusCode).to.equal(200);
                                db.close();
                                done();
                            });
                        });
                });
            });
            it("should return content-type image/png for the second thumb", function (done) {
                let dburl = conf.db.constring + conf.db.db;
                mongo.connect(dburl, function (err, db) {
                    db.db(conf.db.db)
                        .collection(conf.db.c_doc)
                        .findOne({}, function (err, result) {
                            let url =
                                "http://localhost:3000/preview/" +
                                result._id +
                                ".1.thumb.png";
                            request(url, function (error, response, body) {
                                expect(
                                    response.headers["content-type"]
                                ).to.equal("image/png");
                                db.close();
                                done();
                            });
                        });
                });
            });
        }),
        describe("check the document", function () {
            this.slow(0);
            it("should return the doc update page", function (done) {
                let dburl = conf.db.constring + conf.db.db;
                mongo.connect(dburl, function (err, db) {
                    db.db(conf.db.db)
                        .collection(conf.db.c_doc)
                        .findOne({}, function (err, result) {
                            let url =
                                "http://localhost:3000/doc/" +
                                result._id +
                                "/update/";
                            request(url, function (error, response, body) {
                                expect(response.statusCode).to.equal(200);
                                db.close();
                                done();
                            });
                        });
                });
            });
        });
});
