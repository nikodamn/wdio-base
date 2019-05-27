"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getElements = exports.getElement = void 0;

var _webdriver = require("webdriver");

var _config = require("@wdio/config");

var _lodash = _interopRequireDefault(require("lodash.merge"));

var _utils = require("../utils");

var _middlewares = require("../middlewares");

var _constants = require("../constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * transforms and findElement response into a WDIO element
 * @param  {String} selector  selector that was used to query the element
 * @param  {Object} res       findElement response
 * @return {Object}           WDIO element object
 */
const getElement = function findElement(selector, res) {
  const browser = (0, _utils.getBrowserObject)(this);
  const prototype = (0, _lodash.default)({}, browser.__propertiesObject__, (0, _utils.getPrototype)('element'), {
    scope: 'element'
  });
  const element = (0, _webdriver.webdriverMonad)(this.options, client => {
    const elementId = (0, _utils.getElementFromResponse)(res);

    if (elementId) {
      /**
       * set elementId for easy access
       */
      client.elementId = elementId;
      /**
       * set element id with proper key so element can be passed into execute commands
       */

      if (this.isW3C) {
        client[_constants.ELEMENT_KEY] = elementId;
      } else {
        client.ELEMENT = elementId;
      }
    } else {
      client.error = res;
    }

    client.selector = selector;
    client.parent = this;
    client.emit = this.emit.bind(this);
    return client;
  }, prototype);
  const elementInstance = element(this.sessionId, (0, _middlewares.elementErrorHandler)(_config.wrapCommand));
  const origAddCommand = elementInstance.addCommand.bind(elementInstance);

  elementInstance.addCommand = (name, fn) => {
    browser.__propertiesObject__[name] = {
      value: fn
    };
    origAddCommand(name, (0, _config.runFnInFiberContext)(fn));
  };

  return elementInstance;
};
/**
 * transforms and findElement response into a WDIO element
 * @param  {String} selector  selector that was used to query the element
 * @param  {Object} res       findElement response
 * @return {Object}           WDIO element object
 */


exports.getElement = getElement;

const getElements = function getElements(selector, res) {
  const browser = (0, _utils.getBrowserObject)(this);
  const prototype = (0, _lodash.default)({}, browser.__propertiesObject__, (0, _utils.getPrototype)('element'), {
    scope: 'element'
  });
  const elements = res.map((res, i) => {
    const element = (0, _webdriver.webdriverMonad)(this.options, client => {
      const elementId = (0, _utils.getElementFromResponse)(res);

      if (elementId) {
        /**
         * set elementId for easy access
         */
        client.elementId = elementId;
        /**
         * set element id with proper key so element can be passed into execute commands
         */

        if (this.isW3C) {
          client[_constants.ELEMENT_KEY] = elementId;
        } else {
          client.ELEMENT = elementId;
        }
      } else {
        client.error = res;
      }

      client.selector = selector;
      client.parent = this;
      client.index = i;
      client.emit = this.emit.bind(this);
      return client;
    }, prototype);
    const elementInstance = element(this.sessionId, (0, _middlewares.elementErrorHandler)(_config.wrapCommand));
    const origAddCommand = elementInstance.addCommand.bind(elementInstance);

    elementInstance.addCommand = (name, fn) => {
      browser.__propertiesObject__[name] = {
        value: fn
      };
      origAddCommand(name, (0, _config.runFnInFiberContext)(fn));
    };

    return elementInstance;
  });
  return elements;
};

exports.getElements = getElements;