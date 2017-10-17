'use strict';

const PostcodesIO = require('postcodesio-client');
/*const fetch = require('node-fetch');

const baseUris = {
    uk: 'https://api.eu.amazonalexa.com',
    de: 'https://api.eu.amazonalexa.com',
    us: 'https://api.amazonalexa.com'
};*/
const postcodes = new PostcodesIO();

function getCountryAndPostCode(locationOptions, done) {
    // TODO remove temp code
    return done(null, {
        postalCode: 'CF62 7EE'
    });


    /*let url = `${baseUris[locationOptions.locale]}/v1/devices/${locationOptions.deviceId}/settings/address/countryAndPostalCode`;
    let options = makeRequestObject(locationOptions.consentToken);

    fetch(url, options)
        .then(res => {
            done(null, res.json());
        })
        .catch((err) => {
            done(err);
        });*/
}

/*function makeRequestObject(consentToken) {
    return {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${consentToken}`
        }
    };
}*/

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

        })
        .catch((err) => {
            done(err);
        });

}

module.exports = {
    get: function(locationOptions, done) {
        getCountryAndPostCode(locationOptions, function (err, deviceAddress) {
            if (err) {
                return done(err);
            }
            getLocation(deviceAddress, function (err, location) {
                if (err) {
                    return done(err);
                }
                done(null, location);
            });
        });
    }
};