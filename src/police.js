'use strict';

const fetch = require('node-fetch');

const api = 'https://data.police.uk/api';
const street = '/crimes-street/all-crime?';

function makeResponse(crimes) {
    let incidents = {};
    let categories = [];
    let total = 0;
    crimes.forEach(crime => {
        if (incidents[crime.category] !== undefined) {
            incidents[crime.category]++;
        } else {
            incidents[crime.category] = 1;
            categories.push(crime.category);
        }
        total++;
    });

    return {
        incidents: incidents,
        categories: categories,
        total: total
    };
}

module.exports = {
    getLocalCrime(location, done) {
        let url = `${api}${street}lat=${location.latitude}&lng=${location.longitude}`;
        fetch(url)
            .then(res => res.json())
            .then(json => {
                if (Array.isArray(json)) {
                    return done(null, makeResponse(json));
                }
                done(null, makeResponse([]));
            })
            .catch(done);
    }
};
