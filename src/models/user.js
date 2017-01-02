
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

    User.prototype.setPassword = function (password, callback) {
        var user = this;
        callback = (typeof callback === 'function') ? callback : function () {};

        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                callback(err);
            } else {
                bcrypt.hash(password, salt, function (err, hash) {
                    if (!err) {
                        user.data.password = hash;
                    }
                    callback(err);
                });
            }
        });
    };

    User.prototype.comparePassword = function (password, callback) {
        callback = (typeof callback === 'function') ? callback : function () {};

        bcrypt.compare(password, this.data.password, function (err, result) {
            callback(err, result);
        });
    };

    return User;
};