"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _reporter = _interopRequireDefault(require("@wdio/reporter"));

var _allureJsCommons = _interopRequireDefault(require("allure-js-commons"));

var _step = _interopRequireDefault(require("allure-js-commons/beans/step"));

var _utils = require("./utils");

var _constants = require("./constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class AllureReporter extends _reporter.default {
  constructor(options) {
    const outputDir = options.outputDir || 'allure-results';
    super(_objectSpread({}, options, {
      outputDir
    }));
    this.config = {};
    this.allure = new _allureJsCommons.default();
    this.allure.setOptions({
      targetDir: outputDir
    });
    this.registerListeners();
  }

  registerListeners() {
    process.on(_constants.events.addFeature, this.addFeature.bind(this));
    process.on(_constants.events.addStory, this.addStory.bind(this));
    process.on(_constants.events.addSeverity, this.addSeverity.bind(this));
    process.on(_constants.events.addIssue, this.addIssue.bind(this));
    process.on(_constants.events.addTestId, this.addTestId.bind(this));
    process.on(_constants.events.addEnvironment, this.addEnvironment.bind(this));
    process.on(_constants.events.addAttachment, this.addAttachment.bind(this));
    process.on(_constants.events.addDescription, this.addDescription.bind(this));
    process.on(_constants.events.startStep, this.startStep.bind(this));
    process.on(_constants.events.endStep, this.endStep.bind(this));
    process.on(_constants.events.addStep, this.addStep.bind(this));
    process.on(_constants.events.addArgument, this.addArgument.bind(this));
  }

  onRunnerStart(runner) {
    this.config = runner.config;
    this.isMultiremote = runner.isMultiremote || false;
  }

  onSuiteStart(suite) {
    const currentSuite = this.allure.getCurrentSuite();
    const prefix = currentSuite ? currentSuite.name + ' ' : '';
    this.allure.startSuite(prefix + suite.title);
  }

  onSuiteEnd() {
    this.allure.endSuite();
  }

  onTestStart(test) {
    this.allure.startCase(test.title);
    const currentTest = this.allure.getCurrentTest();

    if (!this.isMultiremote) {
      const {
        browserName,
        deviceName
      } = this.config.capabilities;
      const targetName = browserName || deviceName || test.cid;
      const version = this.config.capabilities.version || this.config.capabilities.platformVersion || '';
      const paramName = deviceName ? 'device' : 'browser';
      const paramValue = version ? `${targetName}-${version}` : targetName;
      currentTest.addParameter('argument', paramName, paramValue);
    } else {
      currentTest.addParameter('argument', 'isMultiremote', 'true');
    } // Allure analytics labels. See https://github.com/allure-framework/allure2/blob/master/Analytics.md


    currentTest.addLabel('language', 'javascript');
    currentTest.addLabel('framework', 'wdio');
    currentTest.addLabel('thread', test.cid);
  }

  onTestPass() {
    this.allure.endCase(_constants.testStatuses.PASSED);
  }

  onTestFail(test) {
    if (!this.isAnyTestRunning()) {
      this.allure.startCase(test.title);
    } else {
      this.allure.getCurrentTest().name = test.title;
    }

    const status = (0, _utils.getTestStatus)(test, this.config);

    while (this.allure.getCurrentSuite().currentStep instanceof _step.default) {
      this.allure.endStep(status);
    }

    this.allure.endCase(status, (0, _utils.getErrorFromFailedTest)(test));
  }

  onTestSkip(test) {
    if (!this.allure.getCurrentTest() || this.allure.getCurrentTest().name !== test.title) {
      this.allure.pendingCase(test.title);
    } else {
      this.allure.endCase(_constants.testStatuses.PENDING);
    }
  }

  onBeforeCommand(command) {
    if (!this.isAnyTestRunning()) {
      return;
    }

    if (this.options.disableWebdriverStepsReporting || this.isMultiremote) {
      return;
    }

    this.allure.startStep(`${command.method} ${command.endpoint}`);

    if (!(0, _utils.isEmpty)(command.body)) {
      this.dumpJSON('Request', command.body);
    }
  }

  onAfterCommand(command) {
    if (!this.isAnyTestRunning() || this.isMultiremote) {
      return;
    }

    const {
      disableWebdriverStepsReporting,
      disableWebdriverScreenshotsReporting
    } = this.options;

    if (this.isScreenshotCommand(command) && command.result.value) {
      if (!disableWebdriverScreenshotsReporting) {
        this.allure.addAttachment('Screenshot', Buffer.from(command.result.value, 'base64'));
      }
    }

    if (!disableWebdriverStepsReporting) {
      if (command.result && command.result.value && !this.isScreenshotCommand(command)) {
        this.dumpJSON('Response', command.result.value);
      }

      const suite = this.allure.getCurrentSuite();

      if (!suite || !(suite.currentStep instanceof _step.default)) {
        return;
      }

      this.allure.endStep(_constants.testStatuses.PASSED);
    }
  }

  onHookStart(hook) {
    // ignore global hooks
    if (!hook.parent || !this.allure.getCurrentSuite()) {
      return false;
    } // add beforeEach / afterEach hook as step to test


    if ((0, _utils.isMochaEachHooks)(hook.title)) {
      if (this.allure.getCurrentTest()) {
        this.allure.startStep(hook.title);
      }

      return;
    } // add hook as test to suite


    this.onTestStart(hook);
  }

  onHookEnd(hook) {
    // ignore global hooks
    if (!hook.parent || !this.allure.getCurrentSuite() || !this.allure.getCurrentTest()) {
      return false;
    } // set beforeEach / afterEach hook (step) status


    if ((0, _utils.isMochaEachHooks)(hook.title)) {
      if (hook.error) {
        this.allure.endStep(_constants.stepStatuses.FAILED);
      } else {
        this.allure.endStep(_constants.stepStatuses.PASSED);
      }

      return;
    } // set hook (test) status


    if (hook.error) {
      this.onTestFail(hook);
    } else {
      this.onTestPass(); // remove hook from suite if it has no steps

      if (this.allure.getCurrentTest().steps.length === 0) {
        this.allure.getCurrentSuite().testcases.pop();
      }
    }
  }

  addStory({
    storyName
  }) {
    if (!this.isAnyTestRunning()) {
      return false;
    }

    const test = this.allure.getCurrentTest();
    test.addLabel('story', storyName);
  }

  addFeature({
    featureName
  }) {
    if (!this.isAnyTestRunning()) {
      return false;
    }

    const test = this.allure.getCurrentTest();
    test.addLabel('feature', featureName);
  }

  addSeverity({
    severity
  }) {
    if (!this.isAnyTestRunning()) {
      return false;
    }

    const test = this.allure.getCurrentTest();
    test.addLabel('severity', severity);
  }

  addIssue({
    issue
  }) {
    if (!this.isAnyTestRunning()) {
      return false;
    }

    const test = this.allure.getCurrentTest();
    test.addLabel('issue', issue);
  }

  addTestId({
    testId
  }) {
    if (!this.isAnyTestRunning()) {
      return false;
    }

    const test = this.allure.getCurrentTest();
    test.addLabel('testId', testId);
  }

  addEnvironment({
    name,
    value
  }) {
    if (!this.isAnyTestRunning()) {
      return false;
    }

    const test = this.allure.getCurrentTest();
    test.addParameter('environment-variable', name, value);
  }

  addDescription({
    description,
    type
  }) {
    if (!this.isAnyTestRunning()) {
      return false;
    }

    const test = this.allure.getCurrentTest();
    test.setDescription(description, type);
  }

  addAttachment({
    name,
    content,
    type = 'text/plain'
  }) {
    if (!this.isAnyTestRunning()) {
      return false;
    }

    if (type === 'application/json') {
      this.dumpJSON(name, content);
    } else {
      this.allure.addAttachment(name, Buffer.from(content), type);
    }
  }

  startStep(title) {
    if (!this.isAnyTestRunning()) {
      return false;
    }

    this.allure.startStep(title);
  }

  endStep(status) {
    if (!this.isAnyTestRunning()) {
      return false;
    }

    this.allure.endStep(status);
  }

  addStep({
    step
  }) {
    if (!this.isAnyTestRunning()) {
      return false;
    }

    this.startStep(step.title);

    if (step.attachment) {
      this.addAttachment(step.attachment);
    }

    this.endStep(step.status);
  }

  addArgument({
    name,
    value
  }) {
    if (!this.isAnyTestRunning()) {
      return false;
    }

    const test = this.allure.getCurrentTest();
    test.addParameter('argument', name, value);
  }

  isAnyTestRunning() {
    return this.allure.getCurrentSuite() && this.allure.getCurrentTest();
  }

  isScreenshotCommand(command) {
    const isScrenshotEndpoint = /\/session\/[^/]*\/screenshot/;
    return isScrenshotEndpoint.test(command.endpoint);
  }

  dumpJSON(name, json) {
    this.allure.addAttachment(name, JSON.stringify(json, null, 2), 'application/json');
  }
  /**
   * Assign feature to test
   * @name addFeature
   * @param {(string)} featureName - feature name or an array of names
   */


}

_defineProperty(AllureReporter, "addFeature", featureName => {
  (0, _utils.tellReporter)(_constants.events.addFeature, {
    featureName
  });
});

_defineProperty(AllureReporter, "addSeverity", severity => {
  (0, _utils.tellReporter)(_constants.events.addSeverity, {
    severity
  });
});

_defineProperty(AllureReporter, "addIssue", issue => {
  (0, _utils.tellReporter)(_constants.events.addIssue, {
    issue
  });
});

_defineProperty(AllureReporter, "addTestId", testId => {
  (0, _utils.tellReporter)(_constants.events.addTestId, {
    testId
  });
});

_defineProperty(AllureReporter, "addStory", storyName => {
  (0, _utils.tellReporter)(_constants.events.addStory, {
    storyName
  });
});

_defineProperty(AllureReporter, "addEnvironment", (name, value) => {
  (0, _utils.tellReporter)(_constants.events.addEnvironment, {
    name,
    value
  });
});

_defineProperty(AllureReporter, "addDescription", (description, type) => {
  (0, _utils.tellReporter)(_constants.events.addDescription, {
    description,
    type
  });
});

_defineProperty(AllureReporter, "addAttachment", (name, content, type = 'text/plain') => {
  (0, _utils.tellReporter)(_constants.events.addAttachment, {
    name,
    content,
    type
  });
});

_defineProperty(AllureReporter, "startStep", title => {
  (0, _utils.tellReporter)(_constants.events.startStep, title);
});

_defineProperty(AllureReporter, "endStep", (status = _constants.stepStatuses.PASSED) => {
  if (!Object.values(_constants.stepStatuses).includes(status)) {
    throw new Error(`Step status must be ${Object.values(_constants.stepStatuses).join(' or ')}. You tried to set "${status}"`);
  }

  (0, _utils.tellReporter)(_constants.events.endStep, status);
});

_defineProperty(AllureReporter, "addStep", (title, {
  content,
  name = 'attachment',
  type = 'text/plain'
} = {}, status = _constants.stepStatuses.PASSED) => {
  if (!Object.values(_constants.stepStatuses).includes(status)) {
    throw new Error(`Step status must be ${Object.values(_constants.stepStatuses).join(' or ')}. You tried to set "${status}"`);
  }

  const step = content ? {
    title,
    attachment: {
      content,
      name,
      type
    },
    status
  } : {
    title,
    status
  };
  (0, _utils.tellReporter)(_constants.events.addStep, {
    step
  });
});

_defineProperty(AllureReporter, "addArgument", (name, value) => {
  (0, _utils.tellReporter)(_constants.events.addArgument, {
    name,
    value
  });
});

var _default = AllureReporter;
exports.default = _default;