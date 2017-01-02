
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

        it('should create a new User instance and save it', function () {
            var pwdResolve;
            var pwdStub = sinon.stub(User.prototype, 'setPassword').returns({
                then: function (cb) { pwdResolve = cb; return this; },
                catch: function () { return this; }
            });

            var saveResolve;
            var saveStub = sinon.stub(User.prototype, 'save').returns({
                then: function (cb) { saveResolve = cb; return this;},
                catch: function () { return this; }
            });

            var user;
            var spy = sinon.spy(function (__user) {
                user = __user;
            });

            var promise = User.save(_user);

            expect(promise).to.be.instanceof(PromiseMock);

            promise.then(spy);

            pwdResolve();
            saveResolve();

            expect(pwdStub.calledOnce).to.be.true;
            expect(saveStub.calledOnce).to.be.true;

            expect(spy.calledOnce).to.be.true;
            expect(user).to.be.instanceof(User);

            pwdStub.restore();
            saveStub.restore();
        });
    });

    describe('Password managing', function () {

        it('should encrypt the password', function () {
            sinon.stub(bcrypt, 'genSalt', function (rounds, _cb) {
                _cb(null, 'salt');
            });

            var resolve;
            sinon.stub(bcrypt, 'hash', function (pw, salt, _cb) {
                resolve = function () {
                    _cb(null, 'encrypted');
                };
            });

            var user = new User();
            var spy = sinon.spy();

            var promise = user.setPassword('abc');

            expect(promise).to.be.instanceof(PromiseMock);

            promise.then(spy);
            resolve();

            expect(user.data.password).to.equal('encrypted');
            expect(spy.calledOnce).to.be.true;

            bcrypt.genSalt.restore();
            bcrypt.hash.restore();
        });

        it('should fail if password is invalid', function () {
            var spy = sinon.spy();
            var user = new User();

            user.setPassword('').catch(spy);

            expect(spy.calledOnce).to.be.true;
        });

        it('should fail generating salt to encrypt password', function () {

            var resolve;
            sinon.stub(bcrypt, 'genSalt', function (rounds, _cb) {
                resolve = function () {
                    _cb('err');
                };
            });

            var spy = sinon.spy();
            var user = new User();

            user.setPassword('abc').catch(spy);

            resolve();

            expect(user.data.password).to.be.undefined;
            expect(spy.withArgs('err').calledOnce).to.be.true;

            bcrypt.genSalt.restore();
        });

        it('should fail encrypting password', function () {
            sinon.stub(bcrypt, 'genSalt', function (rounds, _cb) {
                _cb(null, 'salt');
            });

            var resolve;
            sinon.stub(bcrypt, 'hash', function (pw, salt, _cb) {
                resolve = function () {
                    _cb('err');
                };
            });

            var spy = sinon.spy();
            var user = new User({password:'aabbcc'});

            user.setPassword('abc').catch(spy);

            resolve();

            expect(user.data.password).to.equal('aabbcc');
            expect(spy.withArgs('err').calledOnce).to.be.true;

            bcrypt.genSalt.restore();
            bcrypt.hash.restore();
        });

        it('sould compare passwords successfuly', function () {
            var resolve;
            sinon.stub(bcrypt, 'compare', function (pwd, enctrypted, _cb) {
                resolve = function () {
                    _cb(null, true);
                };
            })

            var spy = sinon.spy();
            var user = new User({password: 'aabbcc'});

            user.comparePassword('aabbcc').then(spy);

            resolve();

            expect(spy.calledOnce).to.be.true;

            bcrypt.compare.restore();
        });

        it('should fail comparring passwords', function () {
            var resolve;
            sinon.stub(bcrypt, 'compare', function (pwd, enctrypted, _cb) {
                resolve = function () {
                    _cb('err');
                };
            })

            var spy = sinon.spy();
            var user = new User({password: 'aabbcc'});

            user.comparePassword('aabbccde').catch(spy);

            resolve();

            expect(spy.withArgs('err').calledOnce).to.be.true;

            bcrypt.compare.restore();
        });
    });
});