
var _       = require('lodash');
var bcrypt  = require('bcrypt-nodejs');

module.exports = function () {

    var User = function (data) {
        this.data = {};

        data = data || {};

        _.extend(this.data, data);
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