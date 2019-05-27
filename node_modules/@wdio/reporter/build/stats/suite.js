"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _runnable = _interopRequireDefault(require("./runnable"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Class describing statistics about a single suite.
 */
class SuiteStats extends _runnable.default {
  constructor(suite) {
    super('suite');
    this.uid = _runnable.default.getIdentifier(suite);
    this.cid = suite.cid;
    this.title = suite.title;
    this.fullTitle = suite.fullTitle;
    this.tests = [];
    this.hooks = [];
    this.suites = [];
  }

}

exports.default = SuiteStats;