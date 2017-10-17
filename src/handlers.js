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

function generatePoliceOutput(crimeData, trans) {
    let output = '';
    if (crimeData.total > 10) {
        output += trans('OMG');
    }
    if (crimeData.total === 1) {
        output += trans('TOTAL_CRIME');
    } else {
        output += trans('TOTAL_CRIMES').replace('{num}', String(crimeData.total));
    }
    if (crimeData.total > 0) {
        output += '<break time="0.5s"/>';
        output += trans('OF_WHICH');
        crimeData.crimeCategories.forEach(category => {
            let count = crimeData.crimeIncidents[category];
            output += '<break time="0.5s"/>' + String(count);
            output += (count === 1) ? trans('WAS') : trans('WERE');
            output += ' ' + category.replace('-', ' ');
        });
    }
    return output;
}

module.exports = {

    'LaunchRequest': function() {
        // eslint-disable-next-line no-console
        console.log('LaunchRequest');
        this.emitWithState('VerifyPermission');
    },

    'VerifyPermission': function() {
        // eslint-disable-next-line no-console
        console.log('VerifyPermission');
        if (!hasConsentToken(this.event.context.System)) {
            return this.emitWithState('PermissionRequired');
        }
        this.emitWithState('GetLocationData');
    },

    'GetLocationData': function() {
        // eslint-disable-next-line no-console
        console.log('GetLocationData');
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
        console.log('GetPoliceData', this.attributes.deviceLocation);
        let self = this;

        police.getLocalCrime(this.attributes.deviceLocation, (err, crimeData) => {
            // eslint-disable-next-line no-console
            console.log('getLocalCrime', err);
            if (err) {
                return this.emitWithState('DataError');
            }
            this.attributes.speechOutput = generatePoliceOutput(crimeData, self.t);
            this.attributes.repromptSpeech = 'temp message';
            this.emitWithState('RespondAndClose');
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
