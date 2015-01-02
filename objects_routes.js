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

module.exports = router;
