
module.exports = function () {
    return {
        "/users": {
            post: function (req, res) {
                if (!req.body.username || typeof req.body.username !== 'string') {
                    res.status(400).json({message: 'username not provided or invalid'});
                    return;
                }

                if (!req.body.password || typeof req.body.password !== 'string') {
                    res.status(400).json({message: 'password not provided or invalid'});
                }

                // save user
            }
        },
        "/users/:id": {

        }
    };
};