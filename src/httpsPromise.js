'use strict';

const https = require('https');

module.exports = {
    get(options) {
        return new Promise((resolve, reject) => {

            const request = https.get(options, res => {
                this.onResponse(res, resolve, reject);
            });

            request.on('error', reject);

            request.end();
        });
    },

    onResponse(response, resolve, reject) {
        let body = '';

        if (response.status >= 400) {
            reject(`Request to ${response.url} failed with HTTP ${response.status}`);
        }

        response.on('data', chunk => {
            body += chunk.toString();
        });

        response.on('end', () => {
            resolve(body);
        });
    }
};