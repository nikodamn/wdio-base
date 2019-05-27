"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _util = require("util");

var _events = _interopRequireDefault(require("events"));

var _utils = require("./utils");

var _suite = _interopRequireDefault(require("./stats/suite"));

var _hook = _interopRequireDefault(require("./stats/hook"));

var _test = _interopRequireDefault(require("./stats/test"));

var _runner = _interopRequireDefault(require("./stats/runner"));

var _constants = require("./constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class WDIOReporter extends _events.default {
  constructor(options) {
    super();
    this.options = options; // ensure the report directory exists

    if (this.options.outputDir) {
      _fsExtra.default.ensureDirSync(this.options.outputDir);
    }

    this.outputStream = this.options.stdout || !this.options.logFile ? options.writeStream : _fs.default.createWriteStream(this.options.logFile);
    this.failures = [];
    this.suites = {};
    this.hooks = {};
    this.tests = {};
    this.currentSuites = [];
    this.counts = {
      suites: 0,
      tests: 0,
      hooks: 0,
      passes: 0,
      skipping: 0,
      failures: 0
    };
    let currentTest;
    const rootSuite = new _suite.default({
      title: '(root)',
      fullTitle: '(root)'
    });
    this.currentSuites.push(rootSuite);
    this.on('client:beforeCommand', this.onBeforeCommand.bind(this));
    this.on('client:afterCommand', this.onAfterCommand.bind(this));
    this.on('runner:start',
    /* istanbul ignore next */
    runner => {
      rootSuite.cid = runner.cid;
      this.runnerStat = new _runner.default(runner);
      this.onRunnerStart(this.runnerStat);
    });
    this.on('suite:start',
    /* istanbul ignore next */
    params => {
      const suite = new _suite.default(params);
      const currentSuite = this.currentSuites[this.currentSuites.length - 1];
      currentSuite.suites.push(suite);
      this.currentSuites.push(suite);
      this.suites[suite.uid] = suite;
      this.onSuiteStart(suite);
    });
    this.on('hook:start',
    /* istanbul ignore next */
    hook => {
      const hookStat = new _hook.default(hook);
      const currentSuite = this.currentSuites[this.currentSuites.length - 1];
      currentSuite.hooks.push(hookStat);
      this.hooks[hook.uid] = hookStat;
      this.onHookStart(hookStat);
    });
    this.on('hook:end',
    /* istanbul ignore next */
    hook => {
      const hookStat = this.hooks[hook.uid];
      hookStat.complete((0, _utils.getErrorsFromEvent)(hook));
      this.counts.hooks++;
      this.onHookEnd(hookStat);
    });
    this.on('test:start',
    /* istanbul ignore next */
    test => {
      currentTest = new _test.default(test);
      const currentSuite = this.currentSuites[this.currentSuites.length - 1];
      currentSuite.tests.push(currentTest);
      this.tests[test.uid] = currentTest;
      this.onTestStart(currentTest);
    });
    this.on('test:pass',
    /* istanbul ignore next */
    test => {
      const testStat = this.tests[test.uid];
      testStat.pass();
      this.counts.passes++;
      this.counts.tests++;
      this.onTestPass(testStat);
    });
    this.on('test:fail',
    /* istanbul ignore next */
    test => {
      const testStat = this.tests[test.uid];
      /**
       * replace "Ensure the done() callback is being called in this test." with more meaningful
       * message (Mocha only)
       */

      if (test.error && test.error.message && test.error.message.includes(_constants.MOCHA_TIMEOUT_MESSAGE)) {
        let replacement = (0, _util.format)(_constants.MOCHA_TIMEOUT_MESSAGE_REPLACEMENT, test.parent, test.title);
        test.error.message = test.error.message.replace(_constants.MOCHA_TIMEOUT_MESSAGE, replacement);
        test.error.stack = test.error.stack.replace(_constants.MOCHA_TIMEOUT_MESSAGE, replacement);
      }

      testStat.fail((0, _utils.getErrorsFromEvent)(test));
      this.counts.failures++;
      this.counts.tests++;
      this.onTestFail(testStat);
    });
    this.on('test:pending', test => {
      const currentSuite = this.currentSuites[this.currentSuites.length - 1];
      currentTest = new _test.default(test);
      /**
       * In Mocha: tests that are skipped don't have a start event but a test end.
       * In Jasmine: tests have a start event, therefor we need to replace the
       * test instance with the pending test here
       */

      if (test.uid in this.tests && this.tests[test.uid].state !== 'pending') {
        currentTest.uid = test.uid in this.tests ? 'skipped-' + this.counts.skipping : currentTest.uid;
      }

      const suiteTests = currentSuite.tests;

      if (!suiteTests.length || currentTest.uid !== suiteTests[suiteTests.length - 1].uid) {
        currentSuite.tests.push(currentTest);
      } else {
        suiteTests[suiteTests.length - 1] = currentTest;
      }

      this.tests[currentTest.uid] = currentTest;
      currentTest.skip();
      this.counts.skipping++;
      this.counts.tests++;
      this.onTestSkip(currentTest);
    });
    this.on('test:end',
    /* istanbul ignore next */
    test => {
      const testStat = this.tests[test.uid];
      this.onTestEnd(testStat);
    });
    this.on('suite:end',
    /* istanbul ignore next */
    suite => {
      const suiteStat = this.suites[suite.uid];
      suiteStat.complete();
      this.currentSuites.pop();
      this.onSuiteEnd(suiteStat);
    });
    this.on('runner:end',
    /* istanbul ignore next */
    runner => {
      rootSuite.complete();
      this.runnerStat.failures = runner.failures;
      this.runnerStat.retries = runner.retries;
      this.runnerStat.complete();
      this.onRunnerEnd(this.runnerStat);
    });
    /**
     * browser client event handlers
     */

    this.on('client:command',
    /* istanbul ignore next */
    payload => {
      if (!currentTest) {
        return;
      }

      currentTest.output.push(Object.assign(payload, {
        type: 'command'
      }));
    });
    this.on('client:result',
    /* istanbul ignore next */
    payload => {
      if (!currentTest) {
        return;
      }

      currentTest.output.push(Object.assign(payload, {
        type: 'result'
      }));
    });
  }
  /**
   * allows reporter to stale process shutdown process until required sync work
   * is done (e.g. when having to send data to some server or any other async work)
   */


  get isSynchronised() {
    return true;
  }
  /**
   * function to write to reporters output stream
   */


  write(content) {
    this.outputStream.write(content);
  }
  /* istanbul ignore next */


  onRunnerStart() {}
  /* istanbul ignore next */


  onBeforeCommand() {}
  /* istanbul ignore next */


  onAfterCommand() {}
  /* istanbul ignore next */


  onScreenshot() {}
  /* istanbul ignore next */


  onSuiteStart() {}
  /* istanbul ignore next */


  onHookStart() {}
  /* istanbul ignore next */


  onHookEnd() {}
  /* istanbul ignore next */


  onTestStart() {}
  /* istanbul ignore next */


  onTestPass() {}
  /* istanbul ignore next */


  onTestFail() {}
  /* istanbul ignore next */


  onTestSkip() {}
  /* istanbul ignore next */


  onTestEnd() {}
  /* istanbul ignore next */


  onSuiteEnd() {}
  /* istanbul ignore next */


  onRunnerEnd() {}

}

exports.default = WDIOReporter;