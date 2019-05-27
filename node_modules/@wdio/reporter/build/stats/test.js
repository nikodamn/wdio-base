"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _runnable = _interopRequireDefault(require("./runnable"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * TestStats class
 * captures data on a test.
 */
class TestStats extends _runnable.default {
  constructor(test) {
    super('test');
    this.uid = _runnable.default.getIdentifier(test);
    this.cid = test.cid;
    this.title = test.title;
    this.fullTitle = test.fullTitle;
    this.output = [];
    /**
     * initial test state is pending
     * the state can change to the following: passed, skipped, failed
     */

    this.state = 'pending';
  }

  pass() {
    this.complete();
    this.state = 'passed';
  }

  skip() {
    this.state = 'skipped';
  }

  fail(errors) {
    this.complete();
    this.state = 'failed';
    this.errors = errors;

    if (errors && errors.length) {
      this.error = errors[0];
    }
  }

}

exports.default = TestStats;