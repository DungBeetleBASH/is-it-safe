'use strict';
import * as Alexa from 'alexa-sdk';
import * as AWS from 'aws-sdk';
import * as handlers from './handlers';
import * as language from './language';
const APP_ID = process.env.APP_ID;

AWS.config.update({ region: 'eu-west-1' });

export class Handler {

	constructor(event: Alexa.RequestBody<Alexa.Request>, context: Alexa.Context) {
		const alexa = Alexa.handler(event, context);
		alexa.appId = APP_ID;
		alexa.resources = language;
		alexa.registerHandlers(handlers);
		alexa.execute();
	}

}
