import * as Alexa from 'alexa-sdk';

export const handlers: Alexa.Handlers<Alexa.Request> = {

    'LaunchRequest': () => {
        this.attributes.speechOutput = this.t('LAUNCH_MESSAGE');
        this.attributes.repromptSpeech = this.t('LAUNCH_MESSAGE');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },

    'AMAZON.HelpIntent': () => {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
        this.emitWithState('Respond');
    },

    'AMAZON.RepeatIntent': () => {
        this.emitWithState('Respond');
    },

    'AMAZON.StopIntent': () => {
        this.emit('SessionEndedRequest');
    },

    'AMAZON.CancelIntent': () => {
        this.emit('SessionEndedRequest');
    },

    'SessionEndedRequest': () => {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },

    'Respond': () => {
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },

    'Unhandled': () => {
        this.emitWithState('AMAZON.HelpIntent');
    }
};
