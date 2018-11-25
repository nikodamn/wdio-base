const { expect } = require('chai');

describe('First suite', () => {
    it('main page test', () => {
        browser.setViewportSize({
            width: 1800,
            height: 900 }
        );
        browser.url('http://nikodamn.github.io')
        expect(browser.waitForVisible('.site-title'), 'Logo is not visible').to.be.true;
    })
});