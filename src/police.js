'use strict';

const fetch = require('node-fetch');

const api = 'https://data.police.uk/api';
const street = '/crimes-street/all-crime?';

module.exports = {
    getLocalCrime(location, done) {
        let url = `${api}${street}lat=${location.latitude}lng=${location.longitude}`;
        fetch(url)
            .then(data => {
                // eslint-disable-next-line no-console
                console.log(JSON.stringify(data, null, 4));
                done(null, data);
            })
            .catch(done);
    }
};
