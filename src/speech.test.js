/*global describe, it, beforeEach, afterEach */
const assert = require('chai').assert;
const sinon = require('sinon');
const speech = require('./speech');
const lang = require('./language.json').en.translation;


describe('speech', function() {
    let sandbox;

    beforeEach(function() {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('get', function() {

        it('should return PERMISSION_MESSAGE', function() {
            let expected = lang['PERMISSION_MESSAGE'];
            let actual = speech.get('PERMISSION_MESSAGE');
            assert.equal(expected, actual);
        });

    });

    describe('getRandom', function() {
        let stubRandom;

        beforeEach(function() {
            stubRandom = sandbox.stub(Math, 'random');
            stubRandom.returns(0.23);
        });

        it('should return a valid result', function() {
            let expected = lang['EXCLAMATIONS'][2];
            let actual = speech.getRandom(lang['EXCLAMATIONS']);
            assert.equal(expected, actual);
        });

    });

    describe('getTotalCrimePrefix', function() {
        let stubRandom;

        beforeEach(function() {
            stubRandom = sandbox.stub(Math, 'random');
        });

        it('should return HMMM', function() {
            let data = {
                total: 9
            };
            let expected = lang['HMMM'];
            let actual = speech.getTotalCrimePrefix(data);
            assert.equal(expected, actual);
        });

        it('should return an exclamation', function() {
            let data = {
                total: 10
            };
            stubRandom.returns(0.23);
            let expected = lang['EXCLAMATIONS'][2];
            let actual = speech.getTotalCrimePrefix(data);
            assert.equal(expected, actual);
        });

    });

    describe('getTotalCrimeStats', function() {

        it('should return TOTAL_CRIME', function() {
            let data = {
                total: 1
            };
            let expected = 'There was only 1 crime reported within a mile of your house last month. ';
            let actual = speech.getTotalCrimeStats(data);
            assert.equal(expected, actual);
        });

        it('should return TOTAL_CRIMES', function() {
            let data = {
                total: 10
            };
            let expected = 'There were 10 crimes reported within a mile of your house last month. ';
            let actual = speech.getTotalCrimeStats(data);
            assert.equal(expected, actual);
        });

        it('should return TOTAL_CRIMES', function() {
            let data = {
                total: 0
            };
            let expected = 'There were 0 crimes reported within a mile of your house last month. ';
            let actual = speech.getTotalCrimeStats(data);
            assert.equal(expected, actual);
        });

    });

    describe('getCrimeBreakdown', function() {

        it('should return a default string', function() {
            let data = {
                categories: [],
                incidents: {}
            };
            let expected = [
                'Well, like I said. There wasn\'t any crime within a mile of your house last month.'
            ];
            let actual = speech.getCrimeBreakdown(data);
            assert.deepEqual(expected, actual);
        });

        it('should return 2 results', function() {
            let data = {
                categories: ['anti-social-behaviour', 'bicycle-theft'],
                incidents: {
                    'anti-social-behaviour': 1,
                    'bicycle-theft': 5
                }
            };
            let expected = [
                '1 was anti social behaviour',
                '5 were bicycle theft'
            ];
            let actual = speech.getCrimeBreakdown(data);
            assert.deepEqual(expected, actual);
        });

    });

    describe('getFinalResponse', function() {
        let stubRandom;

        beforeEach(function() {
            stubRandom = sandbox.stub(Math, 'random');
            stubRandom.returns(0.1);
        });

        it('should return a valid result', function() {
            let expected = lang['FINAL_RESPONSES'][0] + lang['STOP_MESSAGES'][0];
            let actual = speech.getFinalResponse();
            assert.equal(expected, actual);
        });

    });

});
