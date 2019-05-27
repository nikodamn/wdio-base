const merge = require('deepmerge');

const baseConfig = require('./base.conf');

global.wdioEnvironment = 'mobile';

exports.config = merge(
    baseConfig.config,
    {
        suites: {
            // for now until we introduce some mobile suite
            example: ['./specs/suites/example.desktop.js'],
        },
        specs: ['./specs/suites/*.mobile.js'],
        exclude: ['./specs/suites/*.desktop.js'],
        hostname: 'selenium-standalone',
        port: '4444',
        path: '/wd/hub',
        specFileRetries: 2,
        capabilities: [{
            maxInstances: 4,
            browserName: 'chrome',
            acceptInsecureCerts: true,
            'goog:chromeOptions': {
                mobileEmulation: {
                    deviceName: 'iPhone X',
                },
                args: ['--headless', '--disable-gpu', '--no-sandbox', '--ignore-certificate-errors', '--disable-extensions', '--whitelisted-ips'],
            },
        }],
        logLevel: 'error',
        baseUrl: 'selenium-standalone',

        onPrepare() {
            setTimeout(() => { console.log('Wait before all workers got launched'); }, 5000);
        },
    }
);