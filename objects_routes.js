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

        var results = docs.map(function(doc) {
            return { url: req.baseUrl + '/' + doc._id };
        });
        res.send(results);
    });
});

// Helper function that ensures an object's unique id field is named according
// to the spec
var ensureUid = function(obj) {
    if (obj.hasOwnProperty('uid')) return obj;
    if (!obj.hasOwnProperty('_id')) {
        throw new Error('No valid id field');
    }
    obj.uid = obj._id;
    delete obj._id;
    return obj;
};

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
            // treat no result as Not Found, so forward to the next handler without
            // specifying a different error
            next();
            return;
        }

        // Change the name of the unique identifier to match the spec
        res.send(ensureUid(doc));
    });
});

// Create a new object
router.post('/', function(req, res, next) {
    if (req.body === undefined) {
        var e = new Error('Malformed request body');
        next(e);
        return;
    }

    var objs = req.db.get('objs');
    var obj = req.body;
    objs.insert(obj, function(err, doc) {
        if (err) {
            var e = new Error('Database error');
            next(e);
            return;
        }

        res.send(ensureUid(doc));
    });
});

module.exports = router;
