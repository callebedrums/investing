
var express     = require('express');
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var jwt         = require('jsonwebtoken');
var cors        = require('cors');

var app = express();
var port = process.env.PORT || 8080;

app.set('superSecret', 'secretusedtogeneratethejwt');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// log requests on console
app.use(morgan('dev'));

// enable cors
app.use(cors());

var router = express.Router();

// authentication endpoint that require a json containing username and password
router.post('/authenticate', function (req, res) {
    if (req.body.username === 'chewbacca' && req.body.password === 'hurhurhur') {
        // create token
        var token = jwt.sign({
            id: 1,
            username: 'chewbacca'
        }, app.get('superSecret'), {
            expiresIn: 24 * 60 * 60  // expires in 24 hours
        });

        res.json({
            message: 'welcome',
            token: token
        });
    } else {
        res.status(401).json({ message: 'Authentication failed. username or password incorrect'});        
    }
});

// middleware to validate the authentication
router.use(function (req, res, next) {
    var token = req.query.token || req.headers['authorization'];
    
    if (token) {
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if (!err) {
                // expose the decoded data from token to the next routes
                req.decoded = decoded;
                next();
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
});

router.get('/', function (req, res) {
    res.json({ message: "hellow world!" });
});


var bearsRouter = require('./src/routers/bears-router');

for(var path in bearsRouter) {
    if (bearsRouter.hasOwnProperty(path)) {
        var route = router.route(path);

        for (var method in bearsRouter[path]) {
            if (bearsRouter[path].hasOwnProperty(method) && typeof route[method] === 'function') {
                route[method](bearsRouter[path][method]);
            }
        }
    }
}


app.use('/api', router);

app.listen(port, function () {
    console.log('listening on port', port)
});