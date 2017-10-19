'use strict';
/*eslint no-console: 0*/
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
        console.log('LaunchRequest');
        this.emitWithState('VerifyPermission');
    },

    'AMAZON.YesIntent': function() {
        console.log('AMAZON.YesIntent');
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
        console.log('AMAZON.NoIntent');
        this.emit('SessionEndedRequest');
    },

    'VerifyPermission': function() {
        console.log('VerifyPermission');
        if (!hasConsentToken(this.event)) {
            return this.emitWithState('PermissionRequired');
        }
        this.emitWithState('GetLocationData');
    },

    'GetLocationData': function() {
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
        console.log('AMAZON.HelpIntent');
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
        this.emitWithState('Respond');
    },

    'AMAZON.RepeatIntent': function() {
        console.log('AMAZON.RepeatIntent');
        this.emitWithState('Respond');
    },

    'AMAZON.StopIntent': function() {
        console.log('AMAZON.StopIntent');
        this.emit('SessionEndedRequest');
    },

    'AMAZON.CancelIntent': function() {
        console.log('AMAZON.CancelIntent');
        this.emit('SessionEndedRequest');
    },

    'SessionEndedRequest': function() {
        console.log('SessionEndedRequest');
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },

    'Respond': function() {
        console.log('Respond');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },

    'RespondAndClose': function() {
        console.log('RespondAndClose');
        this.emit(':tell', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },

    'PermissionRequired': function() {
        console.log('PermissionRequired');
        this.attributes.speechOutput = this.t('PERMISSION_MESSAGE');
        this.attributes.repromptSpeech = this.t('PERMISSION_MESSAGE');
        this.emitWithState('RespondAndClose');
    },

    'LocationError': function() {
        console.log('LocationError');
        this.attributes.speechOutput = this.t('LOCATION_ERROR_MESSAGE');
        this.attributes.repromptSpeech = this.t('LOCATION_ERROR_MESSAGE');
        this.emitWithState('RespondAndClose');
    },

    'DataError': function() {
        console.log('LocationError');
        this.attributes.speechOutput = this.t('DATA_ERROR_MESSAGE');
        this.attributes.repromptSpeech = this.t('DATA_ERROR_MESSAGE');
        this.emitWithState('RespondAndClose');
    },

    'WeirdError': function() {
        console.log('WeirdError');
        this.attributes.speechOutput = this.t('WEIRD_ERROR') + ' ' + this.t('STOP_MESSAGE');
        this.emitWithState('RespondAndClose');
    },

    'Unhandled': function() {
        console.log('Unhandled');
        this.emitWithState('AMAZON.HelpIntent');
    }
};
