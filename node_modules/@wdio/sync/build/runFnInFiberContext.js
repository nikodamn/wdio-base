"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = runFnInFiberContext;

var _fibers = _interopRequireDefault(require("fibers"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * global function to wrap callbacks into Fiber context
 * @param  {Function} fn  function to wrap around
 * @return {Function}     wrapped around function
 */
function runFnInFiberContext(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => (0, _fibers.default)(() => {
      try {
        const result = fn.apply(this, args);
        return resolve(result);
      } catch (err) {
        return reject(err);
      }
    }).run());
  };
}