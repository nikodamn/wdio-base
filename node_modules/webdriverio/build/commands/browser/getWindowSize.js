"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getWindowSize;

var _utils = require("../../utils");

/**
 *
 * Returns browser window size (and position for drivers with W3C support).
 *
 * <example>
 * :getWindowSize.js
    it('should return browser window size', function () {
        const windowSize = browser.getWindowSize(500, 600);
        console.log(windowSize);
        // outputs
        // Firefox: { x: 4, y: 23, width: 1280, height: 767 }
        // Chrome: { width: 1280, height: 767 }
    });
 * </example>
 *
 * @alias browser.getWindowSize
 * @return {Object} { x, y, width, height } for W3C or { width, height } for non W3C browser
 * @type window
 *
 */
function getWindowSize() {
  const browser = (0, _utils.getBrowserObject)(this);

  if (!browser.isW3C) {
    return browser._getWindowSize();
  }

  return browser.getWindowRect();
}