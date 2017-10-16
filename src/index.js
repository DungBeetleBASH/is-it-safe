'use strict';
const AWS = require('aws-sdk');
AWS.config.update({region:'eu-west-1'});
const Alexa = require('alexa-sdk');
const language = require('./language.json');
const APP_ID = process.env.APP_ID;
const handlers = require('./handlers')(etty);

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.appId = APP_ID;
    if (event.context && event.context.System.application.applicationId == 'applicationId') {
        event.context.System.application.applicationId = event.session.application.applicationId;
    }
    alexa.resources = language;
    alexa.registerHandlers(handlers);
    alexa.execute();
};