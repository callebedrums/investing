
var _       = require('lodash');
var bcrypt  = require('bcrypt-nodejs');

module.exports = function (Promise, db) {

    var User = function (data) {
        this.data = {};

        data = data || {};

        _.extend(this.data, data);
    };

    User.prototype.toJS = function () {
        var obj = {};
        _.extend(obj, this.data);

        delete obj.password;

        return obj;
    };

    User.prototype.isNew = function () {
        return !this.data.id;
    };

    User.prototype.save = function () {
        var user = this;
        this.$promise = new Promise(function (resolve, reject) {
            var data = user.toJS();

            if (user.isNew()) {
                data = user.data;
            }

            db.save(data, function (err, result) {
                if (!err) {
                    User.call(user, result);
                    resolve(user);   
                } else {
                    reject(err);
                }

                delete user.$promise;
            });
        });

        return this.$promise;
    };

    User.save = function (data) {
        var user = new User(data);

        return new Promise(function (resolve, reject) {
            user.setPassword(data.password)
            .then(function () {
                user.save()
                .then(function () {
                    resolve(user);
                })
                .catch(reject);
            })
            .catch(reject);
        });
    };

    User.prototype.setPassword = function (password) {
        var user = this;

        return new Promise(function (resolve, reject) {
            if (!password) {
                reject('invalid password');
            } else {
                bcrypt.genSalt(10, function (err, salt) {
                    if (err) {
                        reject(err);
                    } else {
                        bcrypt.hash(password, salt, function (err, hash) {
                            if (!err) {
                                user.data.password = hash;
                                resolve();
                            } else {
                                reject(err);   
                            }
                        });
                    }
                });
            }
        });
    };

    User.prototype.comparePassword = function (password) {
        var user = this;

        return new Promise(function (resolve, reject) {
            bcrypt.compare(password, user.data.password, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve()
                }
            });            
        });
    };

    return User;
};