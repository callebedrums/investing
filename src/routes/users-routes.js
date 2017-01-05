
var authenticationRequiredMiddleware = require('../middlewares/authentication-required-middleware')();

module.exports = function (app, User) {
    return {
        "/users": {
            post: function (req, res) {
                if (!req.body.username || typeof req.body.username !== 'string') {
                    res.status(400).json({message: 'username not provided or invalid'});
                    return;
                }

                if (!req.body.password || typeof req.body.password !== 'string') {
                    res.status(400).json({message: 'password not provided or invalid'});
                    return;
                }

                if (req.body.id) {
                    res.status(400).json({message: 'id not allowed when creating user'});
                    return;
                }

                User.save(req.body)
                .then(function (user) {
                    res.status(201).json(user.toJS());
                })
                .catch(function (err) {
                    res.status(500).json({
                        message: 'error while saving user',
                        error: err
                    });
                });
            },
            get: [authenticationRequiredMiddleware, function (req, res) {

                User.query().$promise.then(function (users) {
                    users = users.map(function (user) {
                        return user.toJS();
                    });

                    res.json(users);
                })
                .catch(function (err) {
                    res.status(500).json({
                        message: 'error while listing user',
                        error: err
                    });
                });
            }]
        },
        "/users/:id": {

        }
    };
};