const merge = require('deepmerge');

const baseConfig = require('./base.conf');

global.wdioEnvironment = 'desktop';

exports.config = merge(
    baseConfig.config,
    {
        suites: {
            example: ['../suites/example.desktop.js'],
        },
        specs: ['../**/suites/**/*.desktop.js'],
        exclude: ['../**/suites/**/*.mobile.js'],
        hostname: 'selenium-standalone',
        port: 4444,
        path: '/wd/hub',
        specFileRetries: 1,
        capabilities: [{
            maxInstances: 4,
            browserName: 'chrome',
            acceptInsecureCerts: true,
            'goog:chromeOptions': {
                args: ['--headless', '--disable-gpu', '--no-sandbox', '--ignore-certificate-errors', '--disable-extensions', '--window-size=1366,768', '--whitelisted-ips'],
            },
        }],
        logLevel: 'error',
        baseUrl: 'selenium-standalone',

        onPrepare() {
            setTimeout(() => { console.log('Wait before all workers got launched'); }, 5000);
        },
    }
);