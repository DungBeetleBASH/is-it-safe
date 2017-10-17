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
        let self = this;
        location.get(options, (err, deviceLocation) => {
            // eslint-disable-next-line no-console
            console.log('location.get', err, deviceLocation);
            if (err) {
                return this.emitWithState('LocationError');
            }
            self.attributes.deviceLocation = deviceLocation;
            self.emitWithState('GetPoliceData');
        });
    },

    'GetPoliceData': function() {
        // eslint-disable-next-line no-console
        console.log('this.attributes.deviceLocation', JSON.stringify(this.attributes.deviceLocation, null, 4));
        let self = this;
        // eslint-disable-next-line no-console
        console.log('self.attributes.deviceLocation', JSON.stringify(self.attributes.deviceLocation, null, 4));
        police.getLocalCrime(this.deviceLocation, (err, crimeData) => {
            if (err) {
                return self.emitWithState('LocationError');
            }
            // eslint-disable-next-line no-console
            console.log('crimeData', JSON.stringify(crimeData, null, 4));
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
