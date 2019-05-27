"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getLogger;

var _fs = _interopRequireDefault(require("fs"));

var _loglevel = _interopRequireDefault(require("loglevel"));

var _util = _interopRequireDefault(require("util"));

var _chalk = _interopRequireDefault(require("chalk"));

var _loglevelPluginPrefix = _interopRequireDefault(require("loglevel-plugin-prefix"));

var _stripAnsi = _interopRequireDefault(require("strip-ansi"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_loglevelPluginPrefix.default.reg(_loglevel.default);

const DEFAULT_LEVEL = 'trace';
const COLORS = {
  error: 'red',
  warn: 'yellow',
  info: 'cyanBright',
  debug: 'green',
  trace: 'cyan'
};
const matches = {
  COMMAND: 'COMMAND',
  DATA: 'DATA',
  RESULT: 'RESULT'
};
const SERIALIZERS = [{
  /**
   * display error stack
   */
  matches: err => err instanceof Error,
  serialize: err => err.stack
}, {
  /**
   * color commands blue
   */
  matches: log => log === matches.COMMAND,
  serialize: log => _chalk.default.magenta(log)
}, {
  /**
   * color data yellow
   */
  matches: log => log === matches.DATA,
  serialize: log => _chalk.default.yellow(log)
}, {
  /**
   * color result cyan
   */
  matches: log => log === matches.RESULT,
  serialize: log => _chalk.default.cyan(log)
}];
const loggers = {};
let logLevelsConfig = {};
const logCache = new Set();
let logFile;
const originalFactory = _loglevel.default.methodFactory;

_loglevel.default.methodFactory = function (methodName, logLevel, loggerName) {
  const rawMethod = originalFactory(methodName, logLevel, loggerName);
  return (...args) => {
    /**
     * create logFile lazily
     */
    if (!logFile && process.env.WDIO_LOG_PATH) {
      logFile = _fs.default.createWriteStream(process.env.WDIO_LOG_PATH);
    }
    /**
     * split `prefixer: value` sting to `prefixer: ` and `value`
     * so that SERIALIZERS can match certain string
     */


    const match = Object.values(matches).filter(x => args[0].endsWith(`: ${x}`))[0];

    if (match) {
      const prefixStr = args.shift().slice(0, -match.length - 1);
      args.unshift(prefixStr, match);
    }

    args = args.map(arg => {
      for (const s of SERIALIZERS) {
        if (s.matches(arg)) {
          return s.serialize(arg);
        }
      }

      return arg;
    });
    const logText = (0, _stripAnsi.default)(`${_util.default.format.apply(this, args)}\n`);

    if (logFile && logFile.writable) {
      /**
       * empty logging cache if stuff got logged before
       */
      if (logCache.size) {
        logCache.forEach(log => logFile.write(log));
        logCache.clear();
      }

      return logFile.write(logText);
    }

    logCache.add(logText);
    rawMethod(...args);
  };
};

_loglevelPluginPrefix.default.apply(_loglevel.default, {
  template: '%t %l %n:',
  timestampFormatter: date => _chalk.default.gray(date.toISOString()),
  levelFormatter: level => _chalk.default[COLORS[level]](level.toUpperCase()),
  nameFormatter: name => _chalk.default.whiteBright(name)
});

function getLogger(name) {
  /**
   * check if logger was already initiated
   */
  if (loggers[name]) {
    return loggers[name];
  }

  let logLevel = process.env.WDIO_LOG_LEVEL || DEFAULT_LEVEL;
  const logLevelName = getLogLevelName(name);

  if (logLevelsConfig[logLevelName]) {
    logLevel = logLevelsConfig[logLevelName];
  }

  loggers[name] = _loglevel.default.getLogger(name);
  loggers[name].setLevel(logLevel);
  return loggers[name];
}
/**
 * Wait for writable stream to be flushed.
 * Calling this prevents part of the logs in the very env to be lost.
 */


getLogger.waitForBuffer = async () => new Promise(resolve => {
  if (logFile && Array.isArray(logFile.writableBuffer) && logFile.writableBuffer.length !== 0) {
    return setTimeout(async () => {
      await getLogger.waitForBuffer(resolve);
      resolve();
    }, 20);
  }

  resolve(true);
});

getLogger.setLevel = (name, level) => loggers[name].setLevel(level);

getLogger.setLogLevelsConfig = (logLevels = {}, wdioLogLevel = DEFAULT_LEVEL) => {
  /**
   * set log level
   */
  if (process.env.WDIO_LOG_LEVEL === undefined) {
    process.env.WDIO_LOG_LEVEL = wdioLogLevel;
  }

  logLevelsConfig = {};
  /**
   * build logLevelsConfig object
   */

  Object.entries(logLevels).forEach(([logName, logLevel]) => {
    const logLevelName = getLogLevelName(logName);
    logLevelsConfig[logLevelName] = logLevel;
  });
  /**
   * set log level for each logger
   */

  Object.keys(loggers).forEach(logName => {
    const logLevelName = getLogLevelName(logName);
    /**
     * either apply log level from logLevels object or use global logLevel
     */

    const logLevel = typeof logLevelsConfig[logLevelName] !== 'undefined' ? logLevelsConfig[logLevelName] : process.env.WDIO_LOG_LEVEL;
    loggers[logName].setLevel(logLevel);
  });
};

const getLogLevelName = logName => logName.split(':').shift();