const { expect } = require('chai');

describe('[Mobile] First suite', () => {
    it('main page test', () => {
        browser.url('http://nikodamn.github.io')
        expect($('.not-existing-class').waitForDisplayed(), 'Logo should be visible').to.be.true;
    })
});