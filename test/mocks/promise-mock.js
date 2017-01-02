
var PromiseMock = function (callback) {
    var self = this;

    var resolve = function (data) {
        if (self.cb instanceof Function) self.cb(data);
    };

    var reject = function (data) {
        if (self.err_cb instanceof Function) self.err_cb(data);
    };

    callback(resolve, reject);
};

PromiseMock.prototype.then = function (cb, err_cb) {
    this.cb = cb;
    this.err_cb = err_cb;
};
PromiseMock.prototype.catch = function (err_cb) {
    this.err_cb = err_cb;
};

module.exports = PromiseMock