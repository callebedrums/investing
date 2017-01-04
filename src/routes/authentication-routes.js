
var jwt = require('jsonwebtoken');

module.exports = function (app, User) {
    return {
        "/authenticate": {
            // authentication endpoint that require a json containing username and password
            post: function (req, res) {

                User.query({ username: req.body.username }).$promise
                .then(function (users) {

                    var user = users[0];

                    if (!user) {
                        res.status(401).json({ message: "username not found" });
                    } else {
                        user.comparePassword(req.body.password)
                        .then(function (match) {

                            if (match) {
                                var token = jwt.sign({
                                    id: user.data.id,
                                    username: user.data.username
                                }, app.get('secret'), {
                                    expiresIn: 24 * 60 * 60  // expires in 24 hours
                                });

                                res.json({
                                    message: 'user authenticated successfuly',
                                    token: token
                                });
                            } else {
                                res.status(401).json({ message: "wrong password" });
                            }

                        })
                        .catch(function () {
                            res.status(401).json({ message: "wrong password" });
                        });
                    }

                })
                .catch(function (err) {
                    res.status(401).json({ message: "username not found" });
                });
            }
        }
    };
};