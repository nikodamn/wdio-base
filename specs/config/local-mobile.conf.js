const { config } = require('chai');
const merge = require('deepmerge');

const baseConfig = require('./base.conf.js');

config.includeStack = true; // enable chai custom login messages

global.wdioEnvironment = 'mobile';

exports.config = merge(
    baseConfig.config,
    {
        suites: {
            // none for now :)
        },
        specs: ['**/suites/**/*.mobile.js'],
        exclude: ['**/suites/**/*.mobile.js'],
        port: 9515,
        path: '/',
        specFileRetries: 0,
        services: ['chromedriver'],
        capabilities: [{
            maxInstances: 4,
            browserName: 'chrome',
            'goog:chromeOptions': {
                mobileEmulation: {
                    deviceName: 'iPhone X',
                },
                args: ['--no-sandbox'],
            },
        }],
        deprecationWarnings: true,
        baseUrl: 'http://localhost',
    }
);