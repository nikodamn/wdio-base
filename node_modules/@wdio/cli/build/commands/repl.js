"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.desc = exports.command = void 0;

var _webdriverio = require("webdriverio");

const command = 'repl <browserName>';
exports.command = command;
const desc = 'Run WebDriver session in command line';
exports.desc = desc;

const handler = async argv => {
  const {
    browserName
  } = argv;
  const client = await (0, _webdriverio.remote)(Object.assign(argv, {
    capabilities: {
      browserName
    }
  }));
  global.$ = client.$.bind(client);
  global.$$ = client.$$.bind(client);
  global.browser = client;
  await client.debug();
  await client.deleteSession();
};

exports.handler = handler;