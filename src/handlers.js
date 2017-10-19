'use strict';
const _ = require('lodash');
const location = require('./location');
const police = require('./police');
const speech = require('./speech');

/*const STATES = {
    NEW: 'NEW',
    MORE_INFO: 'MORE_INFO'
};*/

function getLocationOptions(system) {
    return {
        locale: 'uk',
        deviceId: system.device.deviceId,
        consentToken: system.user.permissions.consentToken
    };
}

function hasConsentToken(event) {
    return _.get(event, 'context.System.user.permissions.consentToken', false);
}

function generatePoliceOutput(crimeData) {
    let output = speech.getTotalCrimePrefix(crimeData);
    output += speech.getTotalCrimeStats(crimeData);
    return output;
}

module.exports = {

    'LaunchRequest': function() {
        this.emitWithState('VerifyPermission');
    },

    'AMAZON.YesIntent': function() {
        /*eslint no-console: 0*/
        console.log(JSON.stringify(this.attributes));
        this.attributes.speechOutput = this.t('MORE_INFO_INTRO');
        this.emitWithState('Respond');
    },

    'AMAZON.NoIntent': function() {
        this.emit('SessionEndedRequest');
    },

    'VerifyPermission': function() {
        if (!hasConsentToken(this.event)) {
            return this.emitWithState('PermissionRequired');
        }
        this.emitWithState('GetLocationData');
    },

    'GetLocationData': function() {
        let options = getLocationOptions(this.event.context.System);

        location.get(options, (err, deviceLocation) => {
            if (err) {
                return this.emitWithState('LocationError');
            }
            this.attributes.deviceLocation = deviceLocation;
            this.emitWithState('GetPoliceData');
        });
    },

    'GetPoliceData': function() {
        police.getLocalCrime(this.attributes.deviceLocation, (err, crimeData) => {
            if (err) {
                return this.emitWithState('DataError');
            }
            this.attributes.speechOutput = this.t('LAUNCH_MESSAGE');
            this.attributes.speechOutput += generatePoliceOutput(crimeData);
            this.attributes.speechOutput += this.t('HEAR_MORE');
            this.attributes.repromptSpeech = this.t('HEAR_MORE');
            this.attributes.crimeData = crimeData;
            this.emitWithState('Respond');
        });
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
        // eslint-disable-next-line no-console
        console.log('Respond');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },

    'RespondAndClose': function() {
        // eslint-disable-next-line no-console
        console.log('RespondAndClose');
        this.emit(':tell', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },

    'PermissionRequired': function() {
        // eslint-disable-next-line no-console
        console.log('PermissionRequired');
        this.attributes.speechOutput = this.t('PERMISSION_MESSAGE');
        this.attributes.repromptSpeech = this.t('PERMISSION_MESSAGE');
        this.emitWithState('RespondAndClose');
    },

    'LocationError': function() {
        // eslint-disable-next-line no-console
        console.log('LocationError');
        this.attributes.speechOutput = this.t('LOCATION_ERROR_MESSAGE');
        this.attributes.repromptSpeech = this.t('LOCATION_ERROR_MESSAGE');
        this.emitWithState('RespondAndClose');
    },

    'DataError': function() {
        // eslint-disable-next-line no-console
        console.log('LocationError');
        this.attributes.speechOutput = this.t('DATA_ERROR_MESSAGE');
        this.attributes.repromptSpeech = this.t('DATA_ERROR_MESSAGE');
        this.emitWithState('RespondAndClose');
    },

    'Unhandled': function() {
        this.emitWithState('AMAZON.HelpIntent');
    }
};
