"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sanitizeErrorMessage = sanitizeErrorMessage;
exports.filterSpecArgs = filterSpecArgs;

var _constants = require("./constants");

/**
 * Cleanup stack traces, merge and remove duplicates
 * @param {Error|*} commandError    Error object or anything else including undefined
 * @param {Error}   savedError      Error with root stack trace
 * @returns {Error}
 */
function sanitizeErrorMessage(commandError, savedError) {
  let name, stack, message;

  if (commandError instanceof Error) {
    ({
      name,
      message,
      stack
    } = commandError);
  } else {
    ({
      name
    } = savedError);
    message = commandError;
  }

  const err = new Error(message);
  err.name = name;
  err.stack = savedError.stack; // merge stack traces if Error has stack trace

  if (stack) {
    err.stack = stack + '\n' + err.stack;
  }

  let stackArr = err.stack.split('\n'); // filter stack trace

  stackArr = stackArr.filter(_constants.STACKTRACE_FILTER_FN); // remove duplicates from stack traces

  err.stack = stackArr.reduce((acc, currentValue) => {
    return acc.includes(currentValue) ? acc : `${acc}\n${currentValue}`;
  }, '').trim();
  return err;
}
/**
 * filter out arguments passed to specFn & hookFn, don't allow callbacks
 * as there is no need for user to call e.g. `done()`
 */


function filterSpecArgs(args) {
  return args.filter(arg => typeof arg !== 'function');
}