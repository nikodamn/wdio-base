"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initialiseServices;

var _deepmerge = _interopRequireDefault(require("deepmerge"));

var _logger = _interopRequireDefault(require("@wdio/logger"));

var _initialisePlugin = _interopRequireDefault(require("./initialisePlugin"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _logger.default)('@wdio/utils:initialiseServices');
/**
 * initialise services based on configuration
 * @param  {Object}    config  config of running session
 * @param  {Object}    caps    capabilities of running session
 * @param  {String}    type    define sub type of plugins (for services it could be "launcher")
 * @return {Object[]}          list of service classes that got initialised
 */

function initialiseServices(config, caps, type) {
  const initialisedServices = [];

  if (!Array.isArray(config.services)) {
    return initialisedServices;
  }

  for (let serviceName of config.services) {
    let serviceConfig = config;
    /**
     * allow custom services with custom options
     */

    if (Array.isArray(serviceName)) {
      serviceConfig = (0, _deepmerge.default)(config, serviceName[1] || {});
      serviceName = serviceName[0];
    }
    /**
     * allow custom services that are already initialised
     */


    if (serviceName && typeof serviceName === 'object' && !Array.isArray(serviceName)) {
      log.debug('initialise custom initiated service');
      initialisedServices.push(serviceName);
      continue;
    }

    try {
      /**
       * allow custom service classes
       */
      if (typeof serviceName === 'function') {
        log.debug(`initialise custom service "${serviceName.name}"`);
        initialisedServices.push(new serviceName(serviceConfig, caps));
        continue;
      }

      log.debug(`initialise wdio service "${serviceName}"`);
      const Service = (0, _initialisePlugin.default)(serviceName, 'service', type);
      /**
       * service only contains a launcher
       */

      if (!Service) {
        continue;
      }

      initialisedServices.push(new Service(serviceConfig, caps));
    } catch (e) {
      log.error(e);
    }
  }

  return initialisedServices;
}