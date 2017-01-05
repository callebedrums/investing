
var sinon           = require('sinon');
var chai            = require('chai');
var responseMock    = require('../mocks/response-mock');

var expect          = chai.expect;

var authenticationRequiredMiddleware = require('../../src/middlewares/authentication-required-middleware')();

describe('AuthenticationRequired Middleware test suite', function () {

    var next;
    var statusSpy;
    var jsonSpy;

    beforeEach(function () {
        next = sinon.spy();
        statusSpy = sinon.spy(responseMock, 'status');
        jsonSpy = sinon.spy(responseMock, 'json');
    });

    afterEach(function () {
        next = null;

        statusSpy.restore();
        jsonSpy.restore();
    });

    it('it should call next when there is an user', function () {
        var req = { user: {} };

        authenticationRequiredMiddleware(req, responseMock, next);

        expect(next.calledOnce).to.be.true;
    });

    it('sould reject the call when there is no user', function () {
        authenticationRequiredMiddleware({}, responseMock, next);

        expect(statusSpy.withArgs(403).calledOnce).to.be.true;
        expect(jsonSpy.withArgs(sinon.match({status:'error', message:'the request is not authenticated'})).calledOnce).to.be.true;
        expect(next.called).to.be.false;
    });
});