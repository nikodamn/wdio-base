const { expect } = require('chai');
const common = require('./common.js');

const PRODUCT_CATEGORIES_NUMBER = 27;
const DIAGRAMS_NUMBER = 6;
const SOME_PRODUCT_PAGE = 'https://wichtowski.pl/index.php?id_product=2115&id_product_attribute=0&rewrite=termostat-th-5-3m-4150109&controller=product&id_lang=2';

function testProductCategoryPage(i) {
    it(`top menu product category for category #${i}`, () => {
        common.navigateToMainPage();

        // Open Product Category menu
        $$('#pts-top-menu .nav-item')[0].moveTo();
        $('#pts-top-menu .nav-item .dropdown-menu .menu-content').waitForDisplayed();
        // Click nth Product Category
        var productCategory = $$('#pts-top-menu .nav-item .dropdown-menu .menu-content a')[i];
        var name = productCategory.getAttribute('title');
        productCategory.click();

        expect(browser.getUrl(), `Category ${name} URL should &contain category=controller`).to.include('&controller=category');
        expect($('#main .block-category h1').getAttribute('textContent'), 'Page header should have proper header').to.equal(name);
        expect($(".current_cate .category-sub-link").getAttribute('textContent'), 'This category should be currently chosen in the sidebar').to.equal(name);
        expect(common.isDisplayed('#header', 'Page header'), `Page header should be displayed for ${name}`).to.be.true;
        expect(common.isDisplayed('.sidebar .category-top-menu', `Products categories sidebar for ${name}`), 'Products categories sidebar should be visible').to.be.true;
        expect(common.isDisplayed('.footer-bottom', 'Footer'), `Footer should be displayed ${name}`).to.be.true;
        expect(common.isDisplayed('#search_filters_wrapper', 'Search filter'), `Search filters should be displayed for ${name}`).to.be.true;
    });
};

describe('[Mobile] First suite', () => {
    it('modules visibility', () => {
        common.navigateToMainPage();

        expect(common.isDisplayed('#header', 'Page header'), 'Page header should be displayed').to.be.true;
        expect(common.isDisplayed('.container-fluid', 'Image slider'), 'Image slider should be displayed').to.be.true;
        expect(Number($$('.pts-container .row .col-inner .widget-banner').length), 'There should be 8 image banners').to.be.equal(8);
        expect(common.isDisplayed('.widget-producttabs .nav', 'New arrivals bar'), 'New arrivals bar should be displayed').to.be.true;
        expect(common.isDisplayed('.widget-producttabs .tab-content', 'New arrivals content'), 'New arrivals content should be displayed').to.be.true;
        expect(common.isDisplayed('.footer-bottom', 'Footer'), 'Footer should be displayed').to.be.true;
    });

    it('header links', () => {
        common.navigateToMainPage();

        expect(common.getAttribute('#header .row .logo-store a', 'href', 'Logo')).to.be.equal('https://wichtowski.pl/');
        expect(common.getAttribute('#contact-link-phone a', 'href', 'Contact phone')).to.be.equal('tel:618653521');
        expect(common.getAttribute('#contact-link-mail a', 'href', 'Contact mail')).to.be.equal('mailto:biuro@wichtowski.pl');
        $('.lang-flag').click();
        expect(common.isDisplayed('#_desktop_setting .dropdown-menu', 'Langiage dropdown'), 'Language dropdown should be open').to.be.true;
        expect(Number($$('.language-selector-wrapper a').length), 'There should be 3 languages links').to.be.equal(3);
        expect(Number($$('.currency-selector-wrapper a').length), 'There should be 2 currencies links').to.be.equal(2);
    });

    it('top menu dropdowns content', () => {
        common.navigateToMainPage();

        expect(Number($$('#pts-top-menu .nav-item').length), 'Top menu should have 5 tabs').to.be.equal(5);

        // Open Product Categories menu
        $$('#pts-top-menu .nav-item')[0].moveTo();
        $('#pts-top-menu .nav-item .dropdown-menu .menu-content').waitForDisplayed();
        expect(
            Number($$('#pts-top-menu .nav-item .dropdown-menu .menu-content a').length,
            `There should be ${PRODUCT_CATEGORIES_NUMBER} product categories in menu`
        )).to.be.equal(PRODUCT_CATEGORIES_NUMBER);

        // Open Diagrams menu
        $$('#pts-top-menu .nav-item')[1].moveTo();
        $('#pts-top-menu .nav-item .dropdown-menu .menu-content').waitForDisplayed();
        expect(
            Number($$('#pts-top-menu .nav-item .level1 a').length,
            `There should be ${DIAGRAMS_NUMBER} product categories in menu`
        )).to.be.equal(DIAGRAMS_NUMBER);
    });

    it('Verify Services from top menu', () => {
        common.navigateToMainPage();

        // Check links for Services tab
        $$('li.nav-item')[2].click();
        expect(browser.getUrl(), 'Verify URL').to.include('id_cms=7&controller=cms');
    });

    it('Verify Master from top menu', () => {
        common.navigateToMainPage();

        // Check links for Master tab
        $$('li.nav-item')[3].click();
        expect(browser.getUrl(), 'Verify URL').to.include('id_cms=15&controller=cms');
    });

    it('Verify Contact Us from top menu', () => {
        common.navigateToMainPage();

        // Check links for Contact Us tab
        $$('li.nav-item')[4].click();
        expect(browser.getUrl(), 'Verify URL').to.include('controller=contact');
    });

    for(productIndex=0; productIndex<PRODUCT_CATEGORIES_NUMBER; productIndex++) {
        testProductCategoryPage(productIndex);
    }

    it('Test navigation to the specific product page', () => {
        common.navigateToMainPage();

        // Open Product Category menu
        $$('#pts-top-menu .nav-item')[0].moveTo();
        $('#pts-top-menu .nav-item .dropdown-menu .menu-content').waitForDisplayed();
        // Click 'Accesories' Product Category
        var productCategory = $$('#pts-top-menu .nav-item .dropdown-menu .menu-content a')[0];
        var level1 = productCategory.getAttribute('title');
        productCategory.click();

        expect($$('.item').length, 'There should be more than 0 categories').to.be.greaterThan(0);
        // Open another product page
        var level2 = $$('.item')[0].$('.product-description').getAttribute('textContent');
        $$('.item')[0].$('a').click();
        expect($$('.item').length, 'There should be more than 0 categories').to.be.greaterThan(0);
        expect($('#main .block-category h1').getAttribute('outerText').trim().toLowerCase(), 'Category header should be correct').to.equal(level2.trim().toLowerCase());

        // Open actual product name
        var productName = $$('.item')[0].$('.product-title').getAttribute('textContent').toLowerCase();
        expect($$('.item').length, 'There should be more than 0 products').to.be.greaterThan(0);
        $$('.item')[0].$('a').click();
        expect($('.product-name-detail').getAttribute('textContent').trim().toLowerCase(), 'Check product name').to.equal(productName.trim().toLowerCase());
    });

    it('Product page elements', () => {
        browser.url(SOME_PRODUCT_PAGE);
    })

});