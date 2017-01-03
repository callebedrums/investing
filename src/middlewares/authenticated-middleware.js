
var jwt = require('jsonwebtoken');

module.exports = function (app, User) {
    return function (req, res, next) {
        var token = req.query.token || req.headers['authorization'];
        
        if (token) {
            jwt.verify(token, app.get('secret'), function (err, decoded) {
                if (!err) {
                    // expose the decoded data from token to the next routes
                    req.decoded = decoded;
                    User.load(decoded.id).then(function (user) {
                        req.user = user;
                        next();
                    }).catch(function () {
                        next();
                    });
                } else {
                    return res.status(403).json({
                        status: 'error',
                        message: 'invalid token'
                    });
                }
            });
        } else {
            return res.status(403).json({
                status: 'error',
                message: 'the request is not authenticated'
            });
        }
    };
};