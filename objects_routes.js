var router = require('express').Router();

// The database is accessible through req.db, which was pre-seeded in server.js

// Get a list of uids for all objects
router.get('/', function(req, res, next) {
    var objs = req.db.get('objs');

    objs.find({}, function(err, docs) {
        if (err) {
            var e = new Error('Database error');
            next(e);
            return;
        }
        console.log(req.baseUrl);

        var results = docs.map(function(doc) {
            return { url: req.baseUrl + '/' + doc._id };
        });
        res.send(results);
    });
});

// Get a particular object
router.get('/:uid', function(req, res, next) {
    var objs = req.db.get('objs');

    objs.findById(req.params.uid, function(err, doc) {
        if (err) {
            var e = new Error('Database error');
            next(e);
            return;
        }
        if (!doc) {
            // treat no result as Not Found, so forward to the next handler
            next();
            return;
        }

        // Change the name of the unique identifier to match the spec
        doc.uid = doc._id;
        delete doc._id;

        res.send(doc);
    });
});

module.exports = router;
