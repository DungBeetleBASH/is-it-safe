'use strict';

const location = require('./location');
const police = require('./police');

function getLocationOptions(system) {
    return {
        locale: 'uk',
        deviceId: system.device.deviceId,
        consentToken: system.user.permissions.consentToken
    };
}

function hasConsentToken(system) {
    return !!(system && system.user && system.user.permissions && system.user.permissions.consentToken);
}

module.exports = {

    'LaunchRequest': () => {
        this.emitWithState('VerifyPermission');
    },

    'VerifyPermission': () => {
        if (!hasConsentToken(this.event.context.System)) {
            return this.emitWithState('PermissionRequired');
        }
        this.emitWithState('GetLocationData');
    },

    'GetLocationData': () => {
        let options = getLocationOptions(this.event.context.System);
        location.get(options, (err, deviceLocation) => {
            if (err) {
                return this.emitWithState('LocationError');
            }
            this.deviceLocation = deviceLocation;
            this.emitWithState('GetPoliceData');
        });
    },

    'GetPoliceData': () => {
        police.getLocalCrime(this.deviceLocation, (err, crimeData) => {
            if (err) {
                return this.emitWithState('LocationError');
            }
            // eslint-disable-next-line no-console
            console.log(JSON.stringify(crimeData, null, 4));
        });
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
