'use strict';

const fetch = require('node-fetch');

const api = 'https://data.police.uk/api';
const street = '/crimes-street/all-crime?';

function makeResponse(crimes) {
    let crimeIncidents = {};
    let crimeCategories = [];
    crimes.forEach(crime => {
        let category = crimeIncidents[crime.category];
        if (category !== undefined) {
            category++;
        } else {
            category = 1;
            crimeCategories.push(crime.category);
        }
    });
    // eslint-disable-next-line no-console
    console.log('crimeIncidents: ' + crimeIncidents);

    return  {
        crimeIncidents: crimeIncidents,
        crimeCategories: crimeCategories
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
