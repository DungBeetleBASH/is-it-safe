'use strict';

const PostcodesIO = require('postcodesio-client');
const httpsPromise = require('./httpsPromise');

const baseUris = {
    uk: 'api.eu.amazonalexa.com',
    de: 'api.eu.amazonalexa.com',
    us: 'api.amazonalexa.com'
};
const postcodes = new PostcodesIO();

function getCountryAndPostCode(locationOptions, done) {
    let options = makeRequestObject(locationOptions.locale, locationOptions.deviceId, locationOptions.consentToken);

    httpsPromise.get(options)
        .then((data) => {
            let deviceAddress;

            try {
                deviceAddress = JSON.parse(data);
            } catch (e) {
                return done(e);
            }

            getLocation(deviceAddress, done);

        }, (err) => {
            done(err);
        });
}

function makeRequestObject(locale, deviceId, consentToken) {
    return {
        hostname: baseUris[locale],
        path: `/v1/devices/${deviceId}/settings/address/countryAndPostalCode`,
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + consentToken
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