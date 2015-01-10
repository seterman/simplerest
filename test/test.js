var monk = require('monk');
var request = require('supertest');
var should = require('should');

// TODO: figure out how to switch databases so that the tests do not
// use the same database as the app
var connection_string = 'localhost/simplerest';
var testUrl = 'http://localhost:8080/api/objects';

describe('Objects', function() {
    // This was a randomly generated id, hardcode it for easy testing
    var testId = '54b19207ff487e8061d46636';
    var db;

    before(function(done) {
        db = monk(connection_string);
        done();
    });

    // Clear the database and insert a dummy object to test against
    beforeEach(function(done) {
        var objs = db.get('objs');
        objs.remove({}, function(err) {
            if (err) {
                done(err);
                return;
            }
            // cast the id to an ObjectId from a string
            objs.insert({ "_id": objs.id(testId), "foo": "apple", "bar": "banana" }, done);
        });
    });

    after(function(done) {
        db.close();
        done();
    });

    it('POST / should return the object with a uid', function(done) {
        request(testUrl)
            .post('/')
            .send({
                "1": "foo",
                "2": "bar",
                "3": "baz"
            }).expect(200) // check the status code
            .expect(function(res) { // check the response body
                res.body.should.have.properties({
                    "1": "foo",
                    "2": "bar",
                    "3": "baz"
                });
                res.body.should.have.property('uid');
            }).end(done);
    });

    it('PUT /:uid should update the object', function(done) {
        request(testUrl)
            .put('/' + testId)
            .send({
                "1": "foo",
                "2": "bar",
                "3": "baz"
            }).expect(200)
            .expect(function(res) {
                res.body.should.have.properties({
                    "uid": testId,
                    "1": "foo",
                    "2": "bar",
                    "3": "baz"
                });
                res.body.should.not.have.properties({
                    "foo": "apple",
                    "bar": "banana"
                });
            }).end(done);
    });

    it('GET / should return a list of objects with urls', function(done) {
        request(testUrl)
            .get('/')
            .expect(200)
            .expect(function(res) {
                res.body.should.have.length(1);
                // Since the length is 1, res.body[0] will always exist
                res.body[0].should.have.property('url');
                res.body[0].url.should.equal(testUrl + '/' + testId);
            }).end(done);
    });

    it('GET /:uid should return the dummy object', function(done) {
        request(testUrl)
            .get('/' + testId)
            .expect(200)
            .expect(function(res) {
                res.body.should.have.properties({
                    'uid': testId,
                    'foo': 'apple',
                    'bar': 'banana'
                });
            }).end(done);
    });

    // This is not an incredibly helpful test, but DELETE returns nothing
    // so there is no response to check.
    it('DELETE /:uid should work', function(done) {
        request(testUrl)
            .delete('/' + testId)
            .expect(200)
            .end(done);
    });

    it('Invalid URL should return an error', function(done) {
        request(testUrl)
            .get('/xxx')
            .expect(200)
            .expect(function(res) {
                // Make sure the error is to spec
                res.body.should.have.properties({
                    'verb': 'GET',
                    'url': testUrl + '/xxx'
                });
                res.body.should.have.property('message');
            }).end(done);
    });

});
