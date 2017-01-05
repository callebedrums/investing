
var jwt = require('jsonwebtoken');

module.exports = function () {
    return function (req, res, next) {
        if (req.user) {
            next();
        } else {
            return res.status(403).json({
                status: 'error',
                message: 'the request is not authenticated'
            });
        }
    };
};