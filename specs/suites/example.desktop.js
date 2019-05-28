const { expect } = require('chai');

describe('[Desktop] First suite', () => {
    it('main page test', () => {
        browser.url('http://nikodamn.github.io')
        expect($('.site-title').waitForDisplayed(), 'Logo should be visible').to.be.true;
    })
});