const lang = require('./language.json').en.translation;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = {
    get: function(key) {
        return lang[key] || '';
    },
    getTotalCrimePrefix: function(data) {
        let exclamations = lang['EXCLAMATIONS'];
        if (data.total >= 10) {
            return exclamations[getRandomInt(0, exclamations.length)] || '';
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
        return data.categories.map(category => {
            let count = data.incidents[category];
            let output = String(count);
            output += (count === 1) ? this.get('WAS') : this.get('WERE');
            output += category.replace(/-/g, ' ');
            return output;
        });
    }
};