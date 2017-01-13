var _ = require('lodash');
var authenticationRequiredMiddleware = require('../middlewares/authentication-required-middleware')();
var paginationHelper = require('../helpers/pagination-helper')();

module.exports = function (User) {
    'use strict';
    
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
                var data = req.query || {};
                var pagination = req.app.get('pagination') || {};

                var options = {};

                var setPaginationHeaders = function () {};

                var error = function (err) {
                    res.status(500).json({
                        message: 'error while listing user',
                        error: err
                    });
                };

                var query = function () {
                    User.query(data, options).$promise.then(function (users) {
                        users = users.map(function (user) {
                            return user.toJS();
                        });

                        setPaginationHeaders();

                        res.json(users);
                    })
                    .catch(error);
                };

                if (pagination.enabled) {
                    var page = parseInt(req.get('x-pagination-page'), 10) || 0;
                    var size = parseInt(req.get('x-pagination-page-size'), 10) || pagination.size;

                    options.offset = size * page;
                    options.limit = size;

                    User.count(data).then(function (count) {
                        setPaginationHeaders = function () {
                            // calculate total of pages, next and previous pages and fill the headers
                            res.set(paginationHelper.getResponseHeaders(page, size, count));
                        }

                        query();
                    }).catch(error);
                } else {
                    query();
                }
            }]
        },
        "/users/:id": {
            all: [authenticationRequiredMiddleware, function (req, res, next) {
                var id = parseInt(req.params.id, 10);

                User.load(id).then(function (user) {
                    req.object = user;
                    next();
                })
                .catch(function (err) {
                    res.status(404).json({
                        message: 'user not found',
                        error: err
                    });
                });
            }],
            get: function (req, res) {
                res.json(req.object.toJS());
            },
            put: function (req, res) {
                var user = req.object;
                var data = req.body;

                delete data.id;

                _.extend(user.data, data);

                user.save().then(function (user) {
                    res.json(user.toJS());
                })
                .catch(function (err) {
                    res.status(500).json({
                        message: 'error while updating user data',
                        error: 'err'
                    });
                });
            },
            delete: function (req, res) {
                req.object.destroy().then(function () {
                    res.status(204).end();
                })
                .catch(function (err) {
                    res.status(500).json({
                        message: 'error while deleting user data',
                        error: 'err'
                    });
                });
            }
        },
        "/users/me": {
            all: [authenticationRequiredMiddleware],
            get: function (req, res) {
                res.json(req.user.toJS());
            }
        }
    };
};