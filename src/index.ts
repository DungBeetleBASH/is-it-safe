'use strict';
import * as AWS from 'aws-sdk';
AWS.config.update({ region: 'eu-west-1' });
import * as Alexa from 'alexa-sdk';
import * as language from './language';
import * as handlers from './handlers';
const APP_ID = process.env.APP_ID;

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    if (event.context && event.context.System.application.applicationId === 'applicationId') {
        event.context.System.application.applicationId = event.session.application.applicationId;
    }
    alexa.resources = language;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
