var jwt = require('jsonwebtoken');

module.exports = function (User) {
    'use strict';
    
    return function (req, res, next) {
        var token = req.query.token || req.headers.authorization;
        
        if (token) {
            jwt.verify(token, req.app.get('secret'), function (err, decoded) {
                if (!err) {
                    // expose the decoded data from token to the next routes
                    req.decoded = decoded;
                    User.load(decoded.id).then(function (user) {
                        req.user = user;
                        next();
                    }).catch(function () {
                        // not able to load user
                        return res.status(403).json({
                            status: 'error',
                            message: 'unable to load user data'
                        });
                    });
                } else {
                    // if the token is invalid, reject the call
                    return res.status(403).json({
                        status: 'error',
                        message: 'invalid token'
                    });
                }
            });
        } else {
            // if there is no token, go next as anonymous
            next();
        }
    };
};