var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var express = require('express');
var monk = require('monk');

var objects = require('./objects_routes');

// Connect to the relevant database: local, local test, or deployed
var connection_string;
if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
    connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ':' +
    process.env.OPENSHIFT_MONGODB_DB_PASSWORD + '@' +
    process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
    process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
    process.env.OPENSHIFT_APP_NAME;
} else if (process.env.NODE_ENV == 'test') {
    connection_string = 'localhost/simpleresttest';
} else {
    connection_string = 'localhost/simplerest';
}
var db = monk(connection_string);

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Pre-seed the req with a reference to the database.
app.use(function(req, res, next) {
    req.db = db;
    next();
});

// Handle specified routes
app.use('/api/objects', objects);

// Catch unhandled routes, pass to the error handler
app.use(function(req, res, next) {
    var err = new Error('URL not found');
    next(err);
});

// Error handler
app.use(function(err, req, res, next) {
    // Code for getting the full URL based on this question on StackOverflow:
    // http://stackoverflow.com/questions/10183291/how-to-get-the-full-url-in-express-js
    var fullURL = req.protocol + '://' + req.get('host') + req.url;

    res.send({
        verb: req.method,
        url: fullURL,
        message: err.message || 'URL not found'
    });
});

// Start the server
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
console.log('Server listening on port', port);
app.listen(port, ip);
