class Common {
    constructor() {

    }

    navigateToMainPage() {
        // this should be changed for prod/stage switching
        browser.url('http://wichtowski.pl')
    }

    isDisplayed(selector, elementName, customTimeout) {
        let isDisplayed = false;
        try {
            isDisplayed = $(selector).isDisplayed(customTimeout, true);
            console.log(`${elementName} is displayed: ${isDisplayed}`);
        } catch (err) {
            console.log(`${elementName} is displayed: ${isDisplayed}. Exception: ${err}`);
        }

        return isDisplayed;
    }

    getAttribute(selector, attribute, elementName) {
        let attributeValue = null;
        try {
            console.log(`${elementName} was displayed`);
            attributeValue = $(selector).getAttribute(attribute);
            console.log(`${elementName} had value: ${attributeValue}`);
        } catch (err) {
            console.log(`Could not get ${elementName}. Exception: ${err}`);
        }

        return attributeValue;
    }
}

module.exports = new Common();