
var bcrypt          = require('bcrypt-nodejs');
var sinon           = require('sinon');
var chai            = require('chai');
var PromiseMock     = require('../mocks/promise-mock');
var UserConstructor = require('../../src/models/user');

var expect          = chai.expect;

describe('Users Model test suite', function () {

    var User;
    var dbMock;
    var _user;

    beforeEach(function () {
        dbMock = {
            save: function () {}
        };

        _user = {
            username: 'callebe',
            password: 'abcdef_encrypted'
        };

        User = UserConstructor(PromiseMock, dbMock);
    });

    afterEach(function () {

    })

    it('should extend the data on constructor', function () {
        var user = new User();
        expect(user.data).to.eql({});

        user = new User({username:'callebe'});
        expect(user.data.username).to.equal('callebe');
    });

    it('should remove the password on toJS method', function () {
        var user = new User({
            username: 'callebe',
            password: 'abcdefg_encrypted'
        });

        expect(user.toJS()).to.eql({username:'callebe'});
    });

    it('should know if is new user when there is not id setted', function () {
        var user = new User({});
        expect(user.isNew()).to.be.true;

        user = new User({id:1});
        expect(user.isNew()).to.be.false;
    });

    describe('Saving User', function () {

        it('should save the user', function () {
            var user = new User(_user);

            var resolve;
            var _data;
            dbMock.save = function (data, cb) {
                _data = data;
                resolve = function () {
                    cb(null, {
                        id: 1,
                        username: 'callebe',
                        password: 'abcdef_encrypted'
                    });
                };
            };

            var spy = sinon.spy();

            expect(user.$promise).to.be.undefined;

            var promise = user.save();
            expect(promise).to.not.be.undefined;
            expect(promise).to.be.instanceof(PromiseMock);
            expect(promise).to.equal(user.$promise);

            expect(_data).to.eql(_user);

            promise.then(spy);
            resolve();

            expect(spy.withArgs(user).calledOnce).to.be.true;
            expect(user.data.id).to.equal(1);

            expect(user.$promise).to.be.undefined;
        });

        it('should update an existing user', function () {
            _user.id = 1;
            var user = new User(_user);

            var resolve;
            var _data;
            dbMock.save = function (data, cb) {
                _data = data;
                resolve = function () {
                    cb(null, {
                        id: 1,
                        username: 'callebe',
                        password: 'abcdef_encrypted'
                    });
                };
            };

            var spy = sinon.spy();

            user.save().then(spy);

            expect(_data).to.eql({ id:1, username: 'callebe' });

            resolve();
            expect(spy.withArgs(user).calledOnce).to.be.true;
        });

        it('should reject the promise when it fails saving', function () {
            var user = new User(_user);

            var resolve;
            dbMock.save = function (data, cb) {
                resolve = function () {
                    cb('err');
                };
            };

            var spy = sinon.spy();

            user.save().catch(spy);
            resolve();

            expect(spy.withArgs('err').calledOnce).to.be.true;
        });

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