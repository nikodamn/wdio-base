"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = shadowRoot;

var _shadowFnFactory = require("../../scripts/shadowFnFactory");

/**
 *
 * Access an element inside a given element's shadowRoot
 *
 * <example>
    :shadow$$.js
    it('should return an element inside a shadowRoot', () => {
        const innerEl = $('.input').shadow$('#innerEl');
        console.log(innerEl.getValue()); // outputs: 'test123'
    });
 * </example>
 *
 * @alias element.shadow$
 * @param {String|Function} selector  selector or JS Function to fetch a certain element
 * @return {Element}
 * @type utility
 *
 */
async function shadowRoot(selector) {
  return await this.$((0, _shadowFnFactory.shadowFnFactory)(selector));
}