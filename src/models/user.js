
var _       = require('lodash');
var bcrypt  = require('bcrypt-nodejs');

module.exports = function (Promise, db) {
    'use strict';

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

    /**
     * Insert or Update user data into database
     * If it is an existing user, the password will be ignored.
     * To update password use method User.prototype.savePassword()
     *
     * @return {Promise} - a promise that will be resolve with user instance
     * */
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

    /**
     * It creates a new user instance with the data provided,
     * Sets its password and save the instance
     *
     * @param data {Object} - User data
     *
     * @return {Promise} - a promise that will be resolve with user instance
     * */
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

    /**
     * Loda user data from database
     *
     * @return {Promise} - a promise that will be resolve with user instance
     * */
    User.prototype.load = function () {
        var user = this;

        this.$promise = new Promise(function (resolve, reject) {
            db.find(user.data.id, function (err, res) {
                if (!err) {
                    User.call(user, res);
                    resolve(user);
                } else {
                    reject(err);
                }

                delete user.$promise;
            });
        });

        return this.$promise;
    };

    /**
     * Create a new user instance and loda user data from database
     *
     * @param id {PkType} - the user identifier in database
     *
     * @return {Promise} - a promise that will be resolve with user instance
     * */
    User.load = function (id) {
        var user = new User({ id: id });

        return new Promise(function (resolve, reject) {
            user.load()
            .then(function () {
                resolve(user);
            })
            .catch(reject);
        });
    };

    /**
     * Remove the user instance from database
     *
     * @return {Promise} - a promise that will be resolve when removing user
     * */
    User.prototype.destroy = function () {
        var user = this;

        return new Promise(function (resolve, reject) {
            db.destroy({ id: user.data.id }, function (err) {
                if (!err) {
                    resolve();
                } else {
                    reject(err);
                }
            });
        });
    };

    /**
     * Query for users on database
     *
     * @return {Array.$promise} - Array to be filled with result.
     *                            The $promise attribute is a promise that will be resolved
     * */
    User.query = function (data) {
        var users = [];

        users.$promise = new Promise(function (resolve, reject) {
            db.find(data, function (err, res) {
                if (!err) {
                    res = res;
                    res = res.map(function (u) {
                        return new User(u);
                    });
                    Array.prototype.push.apply(users, res);
                    resolve(users);
                } else {
                    reject(err);
                }

                delete users.$promise;
            });
        });

        return users;
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
                        bcrypt.hash(password, salt, function () {}, function (err, hash) {
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
                    resolve(result);
                }
            });            
        });
    };

    User.prototype.savePassword = function () {
        var user = this;

        return new Promise(function (resolve, reject) {
            db.save({
                id: user.data.id,
                password: user.data.password
            }, function (err, result) {
                if (!err) {
                    resolve();
                } else {
                    reject(err);
                }
            });
        });
    };

    return User;
};