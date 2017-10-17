'use strict';

const location = require('./location');

function getLocationOptions(system) {
    return {
        locale: 'uk',
        deviceId: system.device.deviceId,
        consentToken: system.user.permissions.consentToken
    }
}

function hasConsentToken(system) {
    return !!(system && system.user && system.user.permissions && system.user.permissions.consentToken);
}

module.exports = {

    'LaunchRequest': () => {
        if (!hasConsentToken(this.event.context.System)) {
            return this.emitWithState('PermissionRequired');
        } else {
            let options = getLocationOptions(this.event.context.System);
            location.get(options, (err, deviceAddress) => {
                if (err) {
                    return this.emitWithState('LocationError');
                }
                this.deviceAddress = deviceAddress;
                this.emitWithState('GetPoliceData');
            });
        }
        this.attributes.speechOutput = this.t('LAUNCH_MESSAGE');
        this.attributes.repromptSpeech = this.t('LAUNCH_MESSAGE');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },

    'GetPoliceData': () => {
        this.attributes.speechOutput = 'temp message';
        this.attributes.repromptSpeech = 'temp message';
        this.emitWithState('Respond');
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

    'PermissionRequired': () => {
        this.attributes.speechOutput = this.t('PERMISSION_MESSAGE');
        this.attributes.repromptSpeech = this.t('PERMISSION_MESSAGE');
        this.emitWithState('Respond');
    },

    'LocationError': () => {
        this.attributes.speechOutput = this.t('LOCATION_ERROR_MESSAGE');
        this.attributes.repromptSpeech = this.t('LOCATION_ERROR_MESSAGE');
        this.emitWithState('Respond');
    },

    'Unhandled': () => {
        this.emitWithState('AMAZON.HelpIntent');
    }
};
