'use strict';

const https = require('https');
const PostcodesIO = require('postcodesio-client');

const baseUris = {
    uk: 'api.eu.amazonalexa.com',
    de: 'api.eu.amazonalexa.com',
    us: 'api.amazonalexa.com'
};
const postcodes = new PostcodesIO();

function getCountryAndPostCode(locationOptions, done) {
    let options = makeRequestObject(locationOptions.locale, locationOptions.deviceId, locationOptions.consentToken);

    https.get(options, (response) => {
        // eslint-disable-next-line no-console
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

            getLocation(deviceAddress, done);

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

function getLocation(deviceAddress, done) {

    postcodes
        .lookup(deviceAddress.postalCode)
        .then((response) => {

            if (!response) {
                return done(new Error('Location not found'));
            }

            const location = {
                longitude: response.longitude,
                latitude: response.latitude
            };

            done(null, location);

        }, (err) => {
            done(err);
        });

}

module.exports = {
    get: getCountryAndPostCode
};