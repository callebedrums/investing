
var sinon           = require('sinon');
var chai            = require('chai');
var PromiseMock     = require('../mocks/promise-mock');
var responseMock    = require('../mocks/response-mock');

var expect          = chai.expect;

var userConstructor = require('../../src/models/user');
var userRoutes      = require('../../src/routes/users-routes');

describe('Users router test suite', function () {

    var routes;
    var route;
    var User;

    var request;

    var statusSpy;
    var jsonSpy;

    var UserMock;

    var promise;
    var resolve;
    var reject;

    beforeEach(function () {
        User = userConstructor({}, {});
        routes = userRoutes({}, User);

        request = { body: {} };

        statusSpy = sinon.spy(responseMock, 'status');
        jsonSpy = sinon.spy(responseMock, 'json');

        UserMock = sinon.mock(User);

        promise = new PromiseMock(function (res, rej) {
            resolve = res;
            reject = rej;
        });
    });

    afterEach(function () {
        statusSpy.restore();
        jsonSpy.restore();
        UserMock.restore();
    });

    describe('POST /users', function () {

        beforeEach(function () {
            route = routes['/users'].post;
        });

        it('should validate if username is presented', function () {
            route(request, responseMock);

            expect(statusSpy.withArgs(400).calledOnce).to.be.true;
            expect(jsonSpy.withArgs(sinon.match({message: 'username not provided or invalid'})).calledOnce).to.be.true;

            request.body.username = 1;
            route(request, responseMock);

            expect(statusSpy.withArgs(400).calledTwice).to.be.true;
            expect(jsonSpy.withArgs(sinon.match({message: 'username not provided or invalid'})).calledTwice).to.be.true;
        });

        it('should validate if password is presented', function () {
            request.body.username = "callebe";

            route(request, responseMock);

            expect(statusSpy.withArgs(400).calledOnce).to.be.true;
            expect(jsonSpy.withArgs(sinon.match({message: 'password not provided or invalid'})).calledOnce).to.be.true;

            request.body.password = 1;
            route(request, responseMock);

            expect(statusSpy.withArgs(400).calledTwice).to.be.true;
            expect(jsonSpy.withArgs(sinon.match({message: 'password not provided or invalid'})).calledTwice).to.be.true;
        });

        it('should not allow providing id', function () {
            request.body.username = "callebe";
            request.body.password = "123";
            request.body.id = 123;

            route(request, responseMock);

            expect(statusSpy.withArgs(400).calledOnce).to.be.true;
            expect(jsonSpy.withArgs(sinon.match({message: 'id not allowed when creating user'})).calledOnce).to.be.true;
        });

        it('sould create user and return it', function () {
            var user = { toJS: sinon.spy() };

            UserMock.expects('save').returns(promise);

            request.body.username = 'callebe';
            request.body.password = '123';

            route(request, responseMock);

            UserMock.verify();

            resolve(user);

            expect(statusSpy.withArgs(201).calledOnce).to.be.true;
            expect(jsonSpy.calledOnce).to.be.true;
            expect(user.toJS.calledOnce).to.be.true;
        });

        it('sould fail on creating user', function () {
            UserMock.expects('save').returns(promise);

            request.body.username = 'callebe';
            request.body.password = '123';

            route(request, responseMock);

            UserMock.verify();

            reject('err');

            expect(statusSpy.withArgs(500).calledOnce).to.be.true;
            expect(jsonSpy.withArgs(sinon.match({message: 'error while saving user', error: 'err'})).calledOnce).to.be.true;
        });
    });

    describe('GET /users', function () {
        beforeEach(function () {
            route = routes['/users'].get[1];
        });

        it('sould list all users', function () {
            UserMock.expects('query').returns({$promise:promise});

            route(request, responseMock);

            UserMock.verify();

            var user = { toJS: sinon.spy() };

            resolve([user, user]);

            expect(jsonSpy.calledOnce).to.be.true;
            expect(user.toJS.calledTwice).to.be.true;
        });

        it('should fail on listing users', function () {
            UserMock.expects('query').returns({$promise:promise});

            route(request, responseMock);

            UserMock.verify();

            reject('err');

            expect(statusSpy.withArgs(500).calledOnce).to.be.true;
            expect(jsonSpy.withArgs(sinon.match({message: 'error while listing user', error: 'err'})).calledOnce).to.be.true;
        });
    })
});