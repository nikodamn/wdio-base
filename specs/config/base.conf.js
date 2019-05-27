exports.config = {
    sync: true,
    logLevel: 'error',
    outputDir: 'allure-results',
    bail: 0,
    waitforTimeout: 10000,
    connectionRetryTimeout: 300000,
    connectionRetryCount: 3,
    framework: 'mocha',
    coloredLogs: true,
    reporters: [
        ['spec',
            {
                outputDir: 'allure-results',
            },
        ],
        ['allure',
            {
                outputDir: 'allure-results',
                disableWebdriverStepsReporting: true,
                disableWebdriverScreenshotsReporting: false,
                useCucumberStepReporter: false,
            },
        ],
    ],
    screenshotPath: './screenshots',
    mochaOpts: {
        timeout: 99999999,
        ui: 'bdd',
    },

    /**
     * Function to be executed after a test (in Mocha/Jasmine) or a step (in Cucumber) starts.
     * @param {Object} test test details
     */
    afterTest(test) {
        // get current test title and clean it, to use it as file name
        const filename = encodeURIComponent(test.title.replace(/\s+/g, '-'));
        const filePath = `${this.screenshotPath}/${filename}_${Date.now()}.png`;

        // eslint-disable-next-line no-undef
        browser.saveScreenshot(filePath);
        console.log('\n\tScreenshot location:', filePath, '\n');
    },
};