"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.run = void 0;

var _yargs = _interopRequireDefault(require("yargs"));

var _lodash = _interopRequireDefault(require("lodash.pickby"));

var _config = require("./config");

var _launcher = _interopRequireDefault(require("./launcher"));

var _run = _interopRequireDefault(require("./run"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const run = () => {
  let argv = _yargs.default.usage(_config.USAGE).commandDir('commands');
  /**
   * populate cli arguments
   */


  for (const param of _config.CLI_PARAMS) {
    argv = argv.option(param.name, param);
  }

  const params = (0, _lodash.default)(argv.argv);
  /**
   * fail execution if more than one wdio config file was specified
   */

  if (params._.length > 1) {
    argv.showHelp();
    console.error(`More than one config file was specified: ${params._.join(', ')}`); // eslint-disable-line

    console.error('Error: You can only run one wdio config file!'); // eslint-disable-line

    process.exit(1);
  }

  (0, _run.default)(params);
};

exports.run = run;
var _default = _launcher.default;
exports.default = _default;