
var sinon           = require('sinon');
var chai            = require('chai');
var PromiseMock     = require('../mocks/promise-mock');
var responseMock    = require('../mocks/response-mock');
var jwt             = require('jsonwebtoken');

var expect          = chai.expect;

var userConstructor = require('../../src/models/user');
var authenticationIdentifierMiddlewareConstructor = require('../../src/middlewares/authentication-identifier-middleware');

describe('AuthenticationIdentifier Middleware test suite', function () {

    var req;
    var app;
    var next;
    var statusSpy;
    var jsonSpy;
    var jwtStub;

    var token;
    var secret;
    var callback;

    var User;
    var authenticationIdentifierMiddleware;

    var UserMock;

    var promise;
    var resolve;
    var reject;

    beforeEach(function () {
        req = { headers: {}, query: {} };
        app = {
            get: sinon.spy(function () { return 'abc' })
        };

        next = sinon.spy();
        statusSpy = sinon.spy(responseMock, 'status');
        jsonSpy = sinon.spy(responseMock, 'json');

        jwtStub = sinon.stub(jwt, 'verify', function (t, s, cb) {
            token = t;
            secret = s;
            callback = cb;
        });

        User = userConstructor({}, {});

        UserMock = sinon.mock(User);

        promise = new PromiseMock(function (res, rej) {
            resolve = res;
            reject = rej;
        });

        authenticationIdentifierMiddleware = authenticationIdentifierMiddlewareConstructor(app, User);
    });

    afterEach(function () {
        app = null;
        next = null;
        statusSpy.restore();
        jsonSpy.restore();

        jwtStub.restore();

        UserMock.restore();
    });

    it('should identify and load the user', function () {
        var decoded = { id: 1 };
        var user = {};
        req.headers.authorization = 'user-token';

        authenticationIdentifierMiddleware(req, responseMock, next);

        expect(jwtStub.calledOnce).to.be.true;
        expect(app.get.withArgs('secret').calledOnce).to.be.true;
        expect(token).to.equal('user-token');

        UserMock.expects('load').withArgs(1).returns(promise);

        callback(null, decoded);
        expect(req.decoded).to.equal(decoded);

        UserMock.verify();

        resolve(user);

        expect(req.user).to.equal(user);
        expect(next.calledOnce).to.be.true;
    });

    it('should fail loading user data', function () {
        var decoded = { id: 1 };
        req.headers.authorization = 'user-token';

        authenticationIdentifierMiddleware(req, responseMock, next);

        UserMock.expects('load').withArgs(1).returns(promise);

        callback(null, decoded);

        UserMock.verify();

        reject('err');

        expect(statusSpy.withArgs(403).calledOnce).to.be.true;
        expect(jsonSpy.withArgs(sinon.match({status:'error', message:'unable to load user data'})).calledOnce).to.be.true;
    });

    it('should fail validating token', function () {
        req.headers.authorization = 'user-token';

        authenticationIdentifierMiddleware(req, responseMock, next);

        callback('err');

        expect(statusSpy.withArgs(403).calledOnce).to.be.true;
        expect(jsonSpy.withArgs(sinon.match({status:'error', message:'invalid token'})).calledOnce).to.be.true;
    });

    it('should proceed as anonymous when there is no token', function () {
        authenticationIdentifierMiddleware(req, responseMock, next);
        expect(next.calledOnce).to.be.true;
    });
});