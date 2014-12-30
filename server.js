var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var express = require('express');
var monk = require('monk');

var objects = require('./objects_routes');

// connect to database
var connection_string = 'localhost/';
if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
    connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ':' +
    process.env.OPENSHIFT_MONGODB_DB_PASSWORD + '@' +
    process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
    process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
    process.env.OPENSHIFT_APP_NAME;
}
var db = monk(connection_string);

var app = express();
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// routes to /api/objects
app.use('/api/objects', objects);

// catch any unhandled routes
app.use(function(req, res, next) {
    console.log(req.method);
    console.log(req.url);

    res.send({
        verb: req.method,
        url: req.url,
        message: 'URL not found'
    });
});

var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
console.log("server listening on port ", port);
app.listen(port, ip);
