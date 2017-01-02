
var PromiseMock = function PromiseMock(callback) {
    var self = this;

    var cb, err_cb, status;

    status = 'pending';

    var resolve = function (data) {
        status = 'resolved';
        if (cb instanceof Function) cb(data);
    };

    var reject = function (data) {
        status = 'rejected';
        if (err_cb instanceof Function) err_cb(data);
    };

    this.then = function (_cb, _err_cb) {
        cb = _cb;
        err_cb = _err_cb;

        if (status === 'resolved') resolve();

        if (status === 'rejected') reject();

        return this;
    };

    this.catch = function (_err_cb) {
        err_cb = _err_cb;

        if (status === 'rejected') reject();

        return this;
    };

    callback(resolve, reject);
};

module.exports = PromiseMock