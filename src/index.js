'use strict';
const AWS = require('aws-sdk');
AWS.config.update({region:'eu-west-1'});
const Alexa = require('alexa-sdk');
const language = require('./language.json');
const APP_ID = process.env.APP_ID;
const handlers = require('./handlers');

AWS.config.update({ region: 'eu-west-1' });

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.resources = language;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
