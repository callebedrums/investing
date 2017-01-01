
var bears = [];
var nextId = 1;

var middleware1 = function (erq, res, next) {
    console.log('middleware 1');
    next();
};

var middleware2 = function (erq, res, next) {
    console.log('middleware 2');
    next();
};

var middleware3 = function (erq, res, next) {
    console.log('middleware 3');
    next();
};

module.exports = {
    "/bears": {
        all: [middleware1, middleware2], // adding middlewares to all methods for /bears endpoint
        get: [middleware3, function (req, res) {  // adding middlewares only for GET /bears
            res.json(bears);
        }],
        post: function (req, res) {
            console.log(req.body)
            if (req.body.name) {
                var bear = {
                    id: nextId++,
                    name: req.body.name
                };
                bears.push(bear);
                res.json(bear);
            } else {
                res.status(400).json({message: 'Name not provided or invalid'});
            }
        }
    },
    "/bears/:id": {
        all: [middleware2, middleware1], // order does matter
        get: function (req, res) {
            var bear = bears.find(function (b) {
                return b.id === parseInt(req.params.id, 10);
            });

            if (bear) {
                res.json(bear);
            } else {
                res.status(404).json({message: 'Bear not found'});
            }
        }
    }
};