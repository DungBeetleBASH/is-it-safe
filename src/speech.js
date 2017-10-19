'use strict';
const _ = require('lodash');
const lang = require('./language.json').en.translation;
const risks = require('./risks.json');

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = {
    get: function(key) {
        return lang[key] || '';
    },
    getRandom: function(strings) {
        if(!Array.isArray(strings)) {
            return '';
        }
        return strings[getRandomInt(0, strings.length)] || ''; 
    },
    getTotalCrimePrefix: function(data) {
        if (data.total >= 10) {
            return this.getRandom(lang['EXCLAMATIONS']);
        }
        return this.get('HMMM');
    },
    getTotalCrimeStats: function(data) {
        if (data.total === 1) {
            return this.get('TOTAL_CRIME');
        }
        return this.get('TOTAL_CRIMES').replace('{num}', String(data.total));
    },
    getCrimeBreakdown: function(data) {
        if (!_.get(data, 'categories[0]')) {
            return [this.get('NO_BREAKDOWN')];
        }
        return data.categories.map(category => {
            let count = data.incidents[category];
            let output = String(count);
            output += (count === 1) ? this.get('WAS') : this.get('WERE');
            output += category.replace(/-/g, ' ');
            return output;
        });
    },
    getFinalResponse: function() {
        return this.getRandom(lang['FINAL_RESPONSES']) + this.getRandom(lang['STOP_MESSAGES']);
    },
    getRisk: function() {
        return this.getRandom(risks) || '';
    }
};