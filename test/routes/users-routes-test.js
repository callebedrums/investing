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
    var endSpy;

    var UserMock;

    var promise;
    var resolve;
    var reject;

    beforeEach(function () {
        User = userConstructor({}, {});
        routes = userRoutes(User);

        request = {
            body: {},
            app: {
                get: function () { }
            },
            get: function () {}
        };

        statusSpy = sinon.spy(responseMock, 'status');
        jsonSpy = sinon.spy(responseMock, 'json');
        endSpy = sinon.spy(responseMock, 'end');

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
        endSpy.restore();
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

        it('sould count users when paginating', function () {
            var res, rej;

            var countPromise = new PromiseMock(function (_res, _rej) {
                res = _res;
                rej = _rej;
            });


            var paginationStub = sinon.stub(request.app, 'get').returns({
                enabled: true,
                size: 2
            });

            UserMock.expects('count').returns(countPromise);
            UserMock.expects('query').returns({$promise:promise});

            route(request, responseMock);

            res(7);

            UserMock.verify();

            var user = { toJS: sinon.spy() };
            resolve([user, user]);

            //UserMock.expects('query').returns({$promise:promise});

            paginationStub.restore();
        });

        it('should fail on listing users', function () {
            UserMock.expects('query').returns({$promise:promise});

            route(request, responseMock);

            UserMock.verify();

            reject('err');

            expect(statusSpy.withArgs(500).calledOnce).to.be.true;
            expect(jsonSpy.withArgs(sinon.match({message: 'error while listing user', error: 'err'})).calledOnce).to.be.true;
        });
    });

    describe('ALL /user/:id', function () {
        beforeEach(function () {
            route = routes['/users/:id'].all[1];
        });

        it('sould return the user', function () {
            var spy = sinon.spy();
            UserMock.expects('load').withArgs(1).returns(promise);

            request.params = { id: 1 };

            route(request, responseMock, spy);

            UserMock.verify();

            var user = { };

            resolve(user);

            expect(spy.calledOnce).to.be.true;
            expect(request.object).to.equal(user);
        });

        it('should fail loading user', function () {
            UserMock.expects('load').returns(promise);

            request.params = { id: 1 };

            route(request, responseMock);

            UserMock.verify();

            reject('err');

            expect(statusSpy.withArgs(404).calledOnce).to.be.true;
            expect(jsonSpy.withArgs(sinon.match({message: 'user not found', error: 'err'})).calledOnce).to.be.true;
        });
    });

    describe('GET /user/:id', function () {
        beforeEach(function () {
            route = routes['/users/:id'].get;
        });

        it('should load user data', function () {
            request.object = { toJS: sinon.spy() };

            route(request, responseMock);

            expect(request.object.toJS.calledOnce).to.be.true;
            expect(jsonSpy.calledOnce).to.be.true;
        });
    });

    describe('PUT /user/:id', function () {
        beforeEach(function () {
            route = routes['/users/:id'].put;
        });

        it('should update user data', function () {
            var user = {
                data: {
                    id: 1,
                    name: '123'
                },
                toJS: sinon.spy(),
                save: sinon.stub()
            };
            user.save.returns(promise);

            request.object = user;
            request.body = {
                id: 2,
                name: '456'
            };

            route(request, responseMock);

            expect(user.data.id).to.equal(1);
            expect(user.data.name).to.equal('456');
            expect(user.save.calledOnce).to.be.true;

            resolve(user);

            expect(user.toJS.calledOnce).to.be.true;
            expect(jsonSpy.calledOnce).to.be.true;
        });

        it('should fail to update user data', function () {
            var user = {
                data: { id: 1 },
                save: sinon.stub()
            };
            user.save.returns(promise);

            request.object = user;
            request.body = {};

            route(request, responseMock);

            reject('err');

            expect(statusSpy.withArgs(500).calledOnce).to.be.true;
            expect(jsonSpy.withArgs(sinon.match({message: 'error while updating user data', error: 'err'})).calledOnce).to.be.true;
        });
    });

    describe('DELETE /user/:id', function () {
        beforeEach(function () {
            route = routes['/users/:id'].delete;
        });

        it('should delete user', function () {
            var user = { destroy: sinon.stub() };
            user.destroy.returns(promise);

            request.object = user;

            route(request, responseMock);

            expect(user.destroy.calledOnce).to.be.true;

            resolve();

            expect(statusSpy.withArgs(204).calledOnce).to.be.true;
            expect(endSpy.calledOnce).to.be.true;
        });

        it('should fail while deleting user', function () {
            var user = { destroy: sinon.stub() };
            user.destroy.returns(promise);

            request.object = user;

            route(request, responseMock);

            reject('err');

            expect(statusSpy.withArgs(500).calledOnce).to.be.true;
            expect(jsonSpy.withArgs(sinon.match({message: 'error while deleting user data', error: 'err'})).calledOnce).to.be.true;
        });
    });
});