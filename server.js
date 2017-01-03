
var express     = require('express');
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var jwt         = require('jsonwebtoken');
var cors        = require('cors');
var massive     = require('massive');

var app = express();
var port = process.env.PORT || 8080;

var config = require('./config');

var db = massive.connectSync({connectionString : config.database});

app.set('secret', config.secret);
app.set('db', db);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// log requests on console
app.use(morgan('dev'));

// enable cors
app.use(cors());

var router = express.Router();

router.get('/', function (req, res) {
    res.json({ message: "hellow world!" });
});


var registerRouter = function (routes, router) {
    for(var path in routes) {
        if (routes.hasOwnProperty(path)) {
            var route = router.route(path);

            for (var method in routes[path]) {
                if (routes[path].hasOwnProperty(method) && typeof route[method] === 'function') {
                    route[method](routes[path][method]);
                }
            }
        }
    }
};

var User = require('./src/models/user')(Promise, db.users);

var AuthenticationRouter = require('./src/routers/authentication-router')(app, User);
registerRouter(AuthenticationRouter, router);

var UserRoutes  = require('./src/routers/users-router')(app, User);
registerRouter(UserRoutes, router);

app.use('/api', router);

app.listen(port, function () {
    console.log('listening on port', port)
});