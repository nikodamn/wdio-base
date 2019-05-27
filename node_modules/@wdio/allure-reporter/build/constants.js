"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mochaEachHooks = exports.events = exports.stepStatuses = exports.testStatuses = void 0;
const PASSED = 'passed';
const FAILED = 'failed';
const BROKEN = 'broken';
const PENDING = 'pending';
const testStatuses = {
  PASSED,
  FAILED,
  BROKEN,
  PENDING
};
exports.testStatuses = testStatuses;
const stepStatuses = {
  PASSED,
  FAILED,
  BROKEN
};
exports.stepStatuses = stepStatuses;
const events = {
  addFeature: 'allure:addFeature',
  addStory: 'allure:addStory',
  addSeverity: 'allure:addSeverity',
  addIssue: 'allure:addIssue',
  addTestId: 'allure:addTestId',
  addEnvironment: 'allure:addEnvironment',
  addDescription: 'allure:addDescription',
  addAttachment: 'allure:addAttachment',
  startStep: 'allure:startStep',
  endStep: 'allure:endStep',
  addStep: 'allure:addStep',
  addArgument: 'allure:addArgument'
};
exports.events = events;
const mochaEachHooks = ['"before each" hook', '"after each" hook'];
exports.mochaEachHooks = mochaEachHooks;