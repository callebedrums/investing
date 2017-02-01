var _ = require('lodash');

module.exports = (function () {
    var envConfig = {};

    if (process.env.INVESTING_ENV) {
        envConfig = JSON.parse(process.env.INVESTING_ENV);
    }

    console.log(envConfig);

    var config = _.extend({
        secret: 'xwVlTKvUrmW9zZc377ueUPEWg0ExmxNgsZlPchngZw1xVbsqxGhZoN5tDfWWeoWX6qi3trK0zZ3e23abHWeJYnLFmifU7KvqSGd3FMT2McKI02tAMeJ2C48XgITeXJnh',
        database: 'postgres://postgres:postgres@localhost/investing',
        pagination: {
            enabled: true,
            size: 20
        }
    }, envConfig);

    console.log(config);

    return config;
})()