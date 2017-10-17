'use strict';

const https = require('https');
const baseUris = {
    uk: 'api.eu.amazonalexa.com',
    de: 'api.eu.amazonalexa.com',
    us: 'api.amazonalexa.com'
};

function getCountryAndPostCode(locale, deviceId, consentToken, done) {
    let options = makeRequestObject(locale, deviceId, consentToken);

    https.get(options, (response) => {
        console.log(`Device Address API responded with a status code of : ${response.statusCode}`);

        response.on('data', (data) => {
            let deviceAddress;

            if (response.statusCode !== 200) {
                return done(new Error(response.statusMessage));
            }

            try {
                deviceAddress = JSON.parse(data);
            } catch (e) {
                return done(e);
            }

            done(null, deviceAddress);
        });
    }).on('error', (e) => {
        done(e);
    });

}

function makeRequestObject(locale, deviceId, consentToken) {
    return {
        hostname: baseUris[locale],
        path: `/v1/devices/${deviceId}/settings/address/countryAndPostalCode`,
        method: 'GET',
        'headers': {
            'Authorization': 'Bearer ' + consentToken
        }
    };
}

module.exports = {
    get: getCountryAndPostCode
};