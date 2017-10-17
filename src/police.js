'use strict';

const fetch = require('node-fetch');

const api = 'https://data.police.uk/api';
const street = '/crimes-street/all-crime?';

module.exports = {
    getLocalCrime(location, done) {
        let url = `${api}${street}lat=${location.latitude}&lng=${location.longitude}`;
        // eslint-disable-next-line no-console
        console.log('url: ' + url);
        fetch(url)
            .then(res => {
                done(null, res.json());
            })
            .catch(e => {
                done(e);
            });
    }
};
