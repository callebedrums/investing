
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
            save: function () {},
            find: function () {},
            destroy: function () {},
            count: function () {}
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

    describe('Loading User', function () {

        it('should load user', function () {
            var resolve;
            dbMock.find = function (id, cb) {
                resolve = function () {
                    cb(null, {
                        id: id,
                        username: 'callebe'
                    });
                };
            };

            var user = new User({id: 1});
            var spy = sinon.spy();

            var promise = user.load();
            expect(promise).to.not.be.undefined;
            expect(promise).to.be.instanceof(PromiseMock);
            expect(promise).to.equal(user.$promise);

            promise.then(spy);
            resolve();

            expect(spy.withArgs(user).calledOnce).to.be.true;
            expect(user.data.id).to.equal(1);
            expect(user.data.username).to.equal('callebe');

            expect(user.$promise).to.be.undefined;
        });

        it('should fail loading user', function () {
            var resolve;
            dbMock.find = function (id, cb) {
                resolve = function () {
                    cb('err');
                };
            };

            var user = new User({id: 1});
            var spy = sinon.spy();

            user.load().catch(spy);

            resolve();

            expect(spy.withArgs('err').calledOnce).to.be.true;

            expect(user.$promise).to.be.undefined;
        });

        it('should create a new User instance and load it', function () {
            var loadResolve;
            var loadStub = sinon.stub(User.prototype, 'load').returns({
                then: function (cb) { loadResolve = cb; return this;},
                catch: function () { return this; }
            });

            var user;
            var spy = sinon.spy(function (__user) {
                user = __user;
            });

            var promise = User.load(1);

            expect(promise).to.be.instanceof(PromiseMock);

            promise.then(spy);

            loadResolve();

            expect(loadStub.calledOnce).to.be.true;

            expect(spy.calledOnce).to.be.true;
            expect(user).to.be.instanceof(User);

            loadStub.restore();
        });
    });

    describe('Destroing User', function () {

        it('should remove the user from database', function () {
            var user = new User({id:1});

            var data;
            var resolve;
            dbMock.destroy = function (_data, cb) {
                data = _data;
                resolve = function () {
                    cb(null);
                };
            };

            var spy = sinon.spy();

            var promise = user.destroy();
            expect(promise).to.be.instanceof(PromiseMock);
            promise.then(spy);

            resolve();

            expect(data).to.eql({id:1});
            expect(spy.calledOnce).to.be.true;
        });

        it('should fail when removing user', function () {
            var user = new User({id:1});

            var data;
            var resolve;
            dbMock.destroy = function (_data, cb) {
                data = _data;
                resolve = function () {
                    cb('err');
                };
            };

            var spy = sinon.spy();

            user.destroy().catch(spy);

            resolve();
            expect(spy.withArgs('err').calledOnce).to.be.true;
        });
    });

    describe('Quereing users', function () {
        it('should load users from data base', function () {
            var data;
            var resolve;
            dbMock.find = function (_data, _opt, cb) {
                data = _data;
                resolve = function () {
                    cb(null, [{
                        id: 1, name: 'Callebe'
                    }, {
                        id: 2, name: 'Callebe 2'
                    }]);
                };
            };

            var spy = sinon.spy();
            var users = User.query({ name: 'callebe' });

            expect(users).to.be.instanceof(Array);
            expect(users.$promise).to.be.instanceof(PromiseMock);
            expect(users).to.have.length(0);
            expect(data).to.eql({ name: 'callebe' });
            users.$promise.then(spy);

            resolve();
            expect(spy.withArgs(users).calledOnce).to.be.true;

            expect(users).to.have.length(2);
            expect(users[0]).to.be.instanceof(User);
            expect(users.$promise).to.be.undefined;
        });

        it('should fail loading users', function () {
            var resolve;
            dbMock.find = function (data, _opt, cb) {
                resolve = function () {
                    cb('err');
                };
            };

            var spy = sinon.spy();
            User.query().$promise.catch(spy);

            resolve();
            expect(spy.withArgs('err').calledOnce).to.be.true;
        });
    });

    describe('Counting users', function () {
        it('should count users', function () {
            var resolve;
            dbMock.count = function (_data, cb) {
                resolve = cb;
            };

            var spy = sinon.spy();
            var promise = User.count();

            expect(promise).to.be.instanceof(PromiseMock);
            promise.then(spy);

            resolve(null, 1);

            expect(spy.withArgs(1).calledOnce).to.be.true;
        });

        it('should fail when counting users', function () {
            var resolve;
            dbMock.count = function (_data, cb) {
                resolve = cb;
            };
            var spy = sinon.spy();

            User.count().catch(spy);

            resolve('err');

            expect(spy.withArgs('err').calledOnce).to.be.true;
        });
    });

    describe('Password managing', function () {

        it('should encrypt the password', function () {
            sinon.stub(bcrypt, 'genSalt', function (rounds, _cb) {
                _cb(null, 'salt');
            });

            var resolve;
            sinon.stub(bcrypt, 'hash', function (pw, salt, _pcb, _cb) {
                _pcb();
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
            sinon.stub(bcrypt, 'hash', function (pw, salt, _pcb, _cb) {
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

        it('should update the password', function () {
            var user = new User({ id: 1, password: 'abcd', username: 'callebe' });

            var resolve;
            var _data;
            dbMock.save = function (data, cb) {
                _data = data;
                resolve = function () {
                    cb(null);
                };
            };

            var spy = sinon.spy();

            user.savePassword().then(spy);

            expect(_data).to.eql({ id:1, password: 'abcd' });

            resolve();
            expect(spy.calledOnce).to.be.true;
        });

        it('should fail on updating password', function () {
            var user = new User({ id: 1, password: 'abcd', username: 'callebe' });

            var resolve;
            var _data;
            dbMock.save = function (data, cb) {
                _data = data;
                resolve = function () {
                    cb('err');
                };
            };

            var spy = sinon.spy();

            user.savePassword().catch(spy);

            expect(_data).to.eql({ id:1, password: 'abcd' });

            resolve();
            expect(spy.withArgs('err').calledOnce).to.be.true;
        });
    });
});