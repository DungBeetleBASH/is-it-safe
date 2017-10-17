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

    'LaunchRequest': function() {
        this.emitWithState('VerifyPermission');
    },

    'VerifyPermission': function() {
        if (!hasConsentToken(this.event.context.System)) {
            return this.emitWithState('PermissionRequired');
        }
        this.emitWithState('GetLocationData');
    },

    'GetLocationData': function() {
        let options = getLocationOptions(this.event.context.System);
        location.get(options, (err, deviceLocation) => {
            if (err) {
                // TODO: replace when using real device
                //return this.emitWithState('LocationError');
                this.deviceLocation = {
                    longitude: '-3.2814380',
                    latitude: '51.4016840'
                };
                return this.emitWithState('GetPoliceData');
            }
            this.deviceLocation = deviceLocation;
            this.emitWithState('GetPoliceData');
        });
    },

    'GetPoliceData': function() {
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

    'AMAZON.HelpIntent': function() {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
        this.emitWithState('Respond');
    },

    'AMAZON.RepeatIntent': function() {
        this.emitWithState('Respond');
    },

    'AMAZON.StopIntent': function() {
        this.emit('SessionEndedRequest');
    },

    'AMAZON.CancelIntent': function() {
        this.emit('SessionEndedRequest');
    },

    'SessionEndedRequest': function() {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },

    'Respond': function() {
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },

    'RespondAndClose': function() {
        this.emit(':tell', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },

    'PermissionRequired': function() {
        this.attributes.speechOutput = this.t('PERMISSION_MESSAGE');
        this.attributes.repromptSpeech = this.t('PERMISSION_MESSAGE');
        this.emitWithState('RespondAndClose');
    },

    'LocationError': function() {
        this.attributes.speechOutput = this.t('LOCATION_ERROR_MESSAGE');
        this.attributes.repromptSpeech = this.t('LOCATION_ERROR_MESSAGE');
        this.emitWithState('RespondAndClose');
    },

    'Unhandled': function() {
        this.emitWithState('AMAZON.HelpIntent');
    }
};
