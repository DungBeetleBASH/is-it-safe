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
        switch (this.attributes.lastState) {
        case STATES.NEW:
            return this.emitWithState('MoreInfo');
        case STATES.MORE_INFO:
            return this.emitWithState('TooMuchInfo');
        default:
            return this.emitWithState('WeirdError');
        }
    },

    'AMAZON.NoIntent': function() {
        console.log('AMAZON.NoIntent');
        this.attributes.speechOutput = speech.getRiskMessage();
        this.attributes.speechOutput += ' ' + speech.getStopMessage();
        this.emit('RespondAndClose');
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
                console.log('LocationError', err, deviceLocation);
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
            this.attributes.speechOutput += ' <break time="0.5s"/> ';
            this.attributes.speechOutput += speech.getRiskMessage();
            this.attributes.speechOutput += ' <break time="0.5s"/> ';
            this.attributes.speechOutput += this.t('HEAR_MORE');
            this.attributes.repromptSpeech = this.t('HEAR_MORE');
            this.attributes.crimeData = crimeData;
            this.attributes.lastState = STATES.NEW;
            this.emitWithState('Respond');
        });
    },

    'MoreInfo': function() {
        console.log('MoreInfo');
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
        this.attributes.speechOutput += speech.getRiskMessage();
        this.attributes.speechOutput += ' <break time="0.5s"/> ';
        this.attributes.speechOutput += this.t('HEAR_MORE');
        this.attributes.repromptSpeech = this.t('HEAR_MORE');
        this.attributes.lastState = STATES.MORE_INFO;
        this.emitWithState('Respond');
    },

    'TooMuchInfo': function() {
        console.log('TooMuchInfo');
        this.attributes.speechOutput = speech.getFinalResponse();
        this.emitWithState('RespondAndClose');
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
        this.emit(':tell', speech.getStopMessage());
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
        this.attributes.speechOutput = this.t('PERMISSION_MESSAGE') + ' ' + speech.getStopMessage();
        this.attributes.repromptSpeech = this.t('PERMISSION_MESSAGE');
        this.emitWithState('RespondAndClose');
    },

    'LocationError': function() {
        console.log('LocationError');
        this.attributes.speechOutput = this.t('LOCATION_ERROR_MESSAGE') + ' ' + speech.getStopMessage();
        this.attributes.repromptSpeech = this.t('LOCATION_ERROR_MESSAGE');
        this.emitWithState('RespondAndClose');
    },

    'DataError': function() {
        console.log('DataError');
        this.attributes.speechOutput = this.t('DATA_ERROR_MESSAGE') + ' ' + speech.getStopMessage();
        this.attributes.repromptSpeech = this.t('DATA_ERROR_MESSAGE');
        this.emitWithState('RespondAndClose');
    },

    'WeirdError': function() {
        console.log('WeirdError');
        this.attributes.speechOutput = this.t('WEIRD_ERROR') + ' ' + speech.getStopMessage();
        this.emitWithState('RespondAndClose');
    },

    'Unhandled': function() {
        console.log('Unhandled');
        this.emitWithState('AMAZON.HelpIntent');
    }
};
