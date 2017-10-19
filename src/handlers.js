'use strict';
const _ = require('lodash');
const location = require('./location');
const police = require('./police');
const speech = require('./speech');

const STATES = {
    NEW: 'NEW',
    MORE_INFO: 'MORE_INFO'
};

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
        // eslint-disable-next-line no-console
        console.log('LaunchRequest');
        this.emitWithState('VerifyPermission');
    },

    'AMAZON.YesIntent': function() {
        // eslint-disable-next-line no-console
        console.log('AMAZON.YesIntent');
        /*eslint no-console: 0*/
        console.log(JSON.stringify(this.attributes));
        if (!this.attributes.crimeData) {
            this.emitWithState('WeirdError');
        }
        this.attributes.speechOutput = this.t('MORE_INFO_INTRO');
        let breakdown = speech.getCrimeBreakdown(this.attributes.crimeData);
        breakdown.forEach(crime => {
            this.attributes.speechOutput += ' <break time="0.5s"/> ' + crime;
        });
        this.attributes.speechOutput += ' <break time="0.5s"/> ';
        this.attributes.speechOutput += this.t('HEAR_MORE');
        this.attributes.repromptSpeech = this.t('HEAR_MORE');
        this.attributes.lastState = STATES.MORE_INFO;
        this.emitWithState('Respond');
    },

    'AMAZON.NoIntent': function() {
        // eslint-disable-next-line no-console
        console.log('AMAZON.NoIntent');
        this.emit('SessionEndedRequest');
    },

    'VerifyPermission': function() {
        // eslint-disable-next-line no-console
        console.log('VerifyPermission');
        if (!hasConsentToken(this.event)) {
            return this.emitWithState('PermissionRequired');
        }
        this.emitWithState('GetLocationData');
    },

    'GetLocationData': function() {
        // eslint-disable-next-line no-console
        console.log('GetLocationData');
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
        // eslint-disable-next-line no-console
        console.log('GetPoliceData');
        police.getLocalCrime(this.attributes.deviceLocation, (err, crimeData) => {
            if (err) {
                return this.emitWithState('DataError');
            }
            this.attributes.speechOutput = this.t('LAUNCH_MESSAGE');
            this.attributes.speechOutput += generatePoliceOutput(crimeData);
            this.attributes.speechOutput += ' <break time="0.5s"/> ';
            this.attributes.speechOutput += this.t('HEAR_MORE');
            this.attributes.repromptSpeech = this.t('HEAR_MORE');
            this.attributes.crimeData = crimeData;
            this.attributes.lastState = STATES.NEW;
            this.emitWithState('Respond');
        });
    },

    'AMAZON.HelpIntent': function() {
        // eslint-disable-next-line no-console
        console.log('AMAZON.HelpIntent');
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
        this.emitWithState('Respond');
    },

    'AMAZON.RepeatIntent': function() {
        // eslint-disable-next-line no-console
        console.log('AMAZON.RepeatIntent');
        this.emitWithState('Respond');
    },

    'AMAZON.StopIntent': function() {
        // eslint-disable-next-line no-console
        console.log('AMAZON.StopIntent');
        this.emit('SessionEndedRequest');
    },

    'AMAZON.CancelIntent': function() {
        // eslint-disable-next-line no-console
        console.log('AMAZON.CancelIntent');
        this.emit('SessionEndedRequest');
    },

    'SessionEndedRequest': function() {
        // eslint-disable-next-line no-console
        console.log('SessionEndedRequest');
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

    'WeirdError': function() {
        // eslint-disable-next-line no-console
        console.log('WeirdError');
        this.attributes.speechOutput = this.t('WEIRD_ERROR') + ' ' + this.t('STOP_MESSAGE');
        this.emitWithState('RespondAndClose');
    },

    'Unhandled': function() {
        // eslint-disable-next-line no-console
        console.log('Unhandled');
        this.emitWithState('AMAZON.HelpIntent');
    }
};
