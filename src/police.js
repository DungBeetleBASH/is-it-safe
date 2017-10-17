'use strict';

const ukpd = require('ukpd');

module.exports = {
    getLocalCrime(location, done) {
        ukpd.streetLevel(location.latitude, location.longitude)
            .then(data => {
                // eslint-disable-next-line no-console
                console.log(JSON.stringify(data, null, 4));
                done(null, data);
            })
            .catch(done);
    }
};
