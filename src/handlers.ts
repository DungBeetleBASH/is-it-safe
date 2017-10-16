export const handlers: Alexa.Handlers = {
    'LaunchRequest': function () {
        this.attributes.speechOutput = this.t('LAUNCH_MESSAGE');
        this.attributes.repromptSpeech = this.t('LAUNCH_MESSAGE');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'AMAZON.HelpIntent': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
        this.emitWithState('Respond');
    },
    'AMAZON.RepeatIntent': function () {
        this.emitWithState('Respond');
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'Respond': function () {
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'Unhandled': function () {
        this.emitWithState('AMAZON.HelpIntent');
    }
}
