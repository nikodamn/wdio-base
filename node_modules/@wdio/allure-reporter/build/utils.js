"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getErrorFromFailedTest = exports.tellReporter = exports.isMochaEachHooks = exports.isEmpty = exports.getTestStatus = void 0;

var _process = _interopRequireDefault(require("process"));

var _compoundError = _interopRequireDefault(require("./compoundError"));

var _constants = require("./constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Get allure test status by TestStat object
 * @param test {Object} - TestStat object
 * @param config {Object} - wdio config object
 * @private
 */
const getTestStatus = (test, config) => {
  if (config.framework === 'jasmine') {
    return _constants.testStatuses.FAILED;
  }

  if (test.error.name) {
    return test.error.name === 'AssertionError' ? _constants.testStatuses.FAILED : _constants.testStatuses.BROKEN;
  }

  const stackTrace = test.error.stack.trim();
  return stackTrace.startsWith('AssertionError') ? _constants.testStatuses.FAILED : _constants.testStatuses.BROKEN;
};
/**
 * Check is object is empty
 * @param object {Object}
 * @private
 */


exports.getTestStatus = getTestStatus;

const isEmpty = object => !object || Object.keys(object).length === 0;
/**
 * Is mocha beforeEach / afterEach hook
 * @param title {String} - hook title
 * @returns {boolean}
 * @private
 */


exports.isEmpty = isEmpty;

const isMochaEachHooks = title => _constants.mochaEachHooks.some(hook => title.includes(hook));
/**
 * Call reporter
 * @param {string} event  - event name
 * @param {Object} msg - event payload
 * @private
 */


exports.isMochaEachHooks = isMochaEachHooks;

const tellReporter = (event, msg = {}) => {
  _process.default.emit(event, msg);
};
/**
 * Properly format error from different test runners
 * @param {Object} test - TestStat object
 * @returns {Object} - error object
 * @private
 */


exports.tellReporter = tellReporter;

const getErrorFromFailedTest = test => {
  if (test.errors && Array.isArray(test.errors)) {
    return test.errors.length === 1 ? test.errors[0] : new _compoundError.default(...test.errors);
  }

  return test.error;
};

exports.getErrorFromFailedTest = getErrorFromFailedTest;