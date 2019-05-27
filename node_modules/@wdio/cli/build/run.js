"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = run;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _launcher = _interopRequireDefault(require("./launcher.js"));

var _watcher = _interopRequireDefault(require("./watcher"));

var _setup = _interopRequireDefault(require("./setup"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function run(params) {
  let stdinData = '';
  const firstArgument = params._[0];

  const commands = _fs.default.readdirSync(_path.default.join(__dirname, 'commands')).map(file => _path.default.parse(file).name);

  const localConf = _path.default.join(process.cwd(), 'wdio.conf.js');

  const wdioConf = firstArgument || (_fs.default.existsSync(localConf) ? localConf : null);
  /**
   * don't do anything if command handler is triggered
   */

  if (commands.includes(firstArgument)) {
    return;
  }
  /**
   * if no default wdio.conf was found and no path to a wdio config was specified
   * run the setup
   */


  if (!wdioConf || firstArgument === 'config') {
    return (0, _setup.default)();
  }
  /**
   * if `--watch` param is set, run launcher in watch mode
   */


  if (params.watch) {
    const watcher = new _watcher.default(wdioConf, params);
    return watcher.watch();
  }
  /**
   * if stdin.isTTY, then no piped input is present and launcher should be
   * called immediately, otherwise piped input is processed, expecting
   * a list of files to process.
   *
   * stdin.isTTY is false when command is from nodes spawn since it's treated as a pipe
   */


  if (process.stdin.isTTY || !process.stdout.isTTY) {
    return launch(wdioConf, params);
  }
  /*
   * get a list of spec files to run from stdin, overriding any other
   * configuration suite or specs.
   */


  const stdin = process.openStdin();
  stdin.setEncoding('utf8');
  stdin.on('data', data => {
    stdinData += data;
  });
  stdin.on('end', () => {
    if (stdinData.length > 0) {
      params.specs = stdinData.trim().split(/\r?\n/);
    }

    launch(wdioConf, params);
  });
}

function launch(wdioConf, params) {
  const launcher = new _launcher.default(wdioConf, params);
  launcher.run().then(code => process.nextTick(() => process.exit(code)), e => process.nextTick(() => {
    throw e;
  }));
}