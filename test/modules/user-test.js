
var bcrypt  = require('bcrypt-nodejs');
var sinon   = require('sinon');
var chai    = require('chai');
var expect  = chai.expect;

var User = require('../../src/models/user')();

describe('Users router test suite', function () {

    it('should extend the data on constructor', function () {
        var user = new User();
        expect(user.data).to.eql({});

        user = new User({username:'callebe'});
        expect(user.data.username).to.equal('callebe');
    });

    describe('Password managing', function () {
        it('should encrypt the password', function () {
            sinon.stub(bcrypt, 'genSalt', function (rounds, _cb) {
                _cb(null, 'salt');
            });
            sinon.stub(bcrypt, 'hash', function (pw, salt, _cb) {
                _cb(null, 'encrypted');
            });

            var user = new User();

            user.setPassword('abc');

            expect(user.data.password).to.equal('encrypted');

            bcrypt.genSalt.restore();
            bcrypt.hash.restore();
        });

        it('should fail generating salt to encrypt password', function () {
            sinon.stub(bcrypt, 'genSalt', function (rounds, _cb) {
                _cb('err');
            });

            var spy = sinon.spy();
            var user = new User();

            user.setPassword('abc', spy);

            expect(user.data.password).to.be.undefined;
            expect(spy.withArgs('err').calledOnce).to.be.true;

            bcrypt.genSalt.restore();
        });

        it('should fail encrypting password', function () {
            sinon.stub(bcrypt, 'genSalt', function (rounds, _cb) {
                _cb(null, 'salt');
            });
            sinon.stub(bcrypt, 'hash', function (pw, salt, _cb) {
                _cb('err');
            });

            var spy = sinon.spy();
            var user = new User({password:'aabbcc'});

            user.setPassword('abc', spy);

            expect(user.data.password).to.equal('aabbcc');
            expect(spy.withArgs('err').calledOnce).to.be.true;

            bcrypt.genSalt.restore();
            bcrypt.hash.restore();
        });

        it('sould compare passwords', function () {
            sinon.stub(bcrypt, 'compare', function (pwd, enctrypted, _cb) {
                _cb(null, true);
            })

            var spy = sinon.spy();
            var user = new User({password: 'aabbcc'});

            user.comparePassword('aabbcc');
            user.comparePassword('aabbcc', spy);

            expect(spy.withArgs(null, true).calledOnce).to.be.true;

            bcrypt.compare.restore();
        });
    });
});