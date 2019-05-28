<a href="http://github.com/nikodamn/wdio-base"><img width="150px" src="https://github.com/nikodamn/wdio-base/blob/master/logo.png?raw=true" title="Wdio-base logo" alt="Wdio-base"></a>

[![Build Status](http://img.shields.io/travis/badges/badgerbadgerbadger.svg?style=flat-square)](https://travis-ci.org/badges/badgerbadgerbadger) [![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)


#  Wdio base

Base platform for your WebdriverIO 5.x.x project.

* `WebdriverIO` (version 5.x.x)
* `Chromedriver` for local development
* Selenium Standalone server for CI usage
* `Chai` for Assertions
* `Mocha` as test runner
* Allure Dashboard integration for raporting
* Separated Desktop and Mobile configuration files (both local and remote)
* Application is fully dockerized and communicates with also dockerized `selenium-standalone`
* Jenkins pipeline for running, cleaning and managing Docker images. Added support for Allure in Jenkins


## Installation

Just run `yarn` command from the root directory. If you don't have `yarn` installed check it out here: https://yarnpkg.com/en/docs/install

## Run wdio tests locally
To run WebdriverIO tests on your local machine (with Chromedriver), just execute:
```./node_modules/.bin/wdio ./specs/config/local-desktop.conf.js``` (`local-mobile.conf.js` for mobile) or simply ```yarn wdio```.
This command will run all of your suites in mutliple browsers (it's number is defined in the config file).

## Run only selected wdio suite
For running only selected suites you can specify this with `--suite=` switch. Examples for desktop:
```./node_modules/.bin/wdio ./specs/config/local-desktop.conf.js --suite=example```
```./node_modules/.bin/wdio ./specs/config/local-desktop.conf.js --suite=example1 --suite=example2```
Suites are defined in the config file.

## How can I skip failing test?
Since our test runner is MochaJS, you can use `describe.skip()` or `it.skip()`.

## I'm creating completely new suite. What should I do?
If you are adding a new suite you should add it in the `./specs/suites/` directory. Suite for desktop should have a `XXX.desktop.js` naming. Corresponding naming applies for mobile.

Once you've added your suite files, you need to add them to the configuration files. Take a look at those files in the `./specs/config/` directory. For local development add your new suite to `local-desktop.conf.js` and `local-mobile.conf.js` files. For enabling them on Jenkins you need to add them to `remote-desktop.conf.js` and `remote-mobile.conf.js` files.

## Where can I find WebdriverIO documentation?
Creators of WebdriverIO have some great documentation, which you can check here:
* https://webdriver.io/docs/api.html - doc about Wdio methods
* https://webdriver.io/docs/selectors.html - doc about various ways of finding a web element
* https://webdriver.io/docs/api/webdriver.html - doc on methods to manage Webdriver (not WebdriverIO)

## Why there are few `.conf.js` files?
As you noticed there are few configuration files, e.g.: `local-desktop.conf.js` and `remote-desktop.conf.js`. First one is used for local development - it's using local ChromeDriver to run tests. We would like to ensure that developer who's writing tests can see the screen with tests being executed and has some meaningful logs in console, rather then black-box Docker image on Jenkins. `remote-desktop.conf.js` and `remote-mobile.conf.js` are used for automated runs using Jenkins and Docker. Those tests are dockerized along with Selenium Standalone server and are also running in headless mode. It's much more robust, but less developer-friendly since it's all happening inside the container.

## What is addStep() method?
This method is not necessary to run your tests, but it adds a step in the Allure Dashboard and is helpful when debugging what went wrong (which steps were achieved and which were not).

## Why do I need to implement Desktop and Mobile tests separately?
It's pretty common for web application to have various flow for Mobile and Desktop users. So probably you need to define various user flows for those paths. If it's not the case you can have one testing suite for both of them, being executed and reported separately (by Mobile and Desktop configs).

## How can I open Allure dashboard locally
For local development it might be helpful to see some logs or screenshots. For this purpose we use Allure reporter. Your tests should generate test results (in XML format) in the `./allure-results`. Those XML files needs to be converted to HTML report using Allure. To achieve it, just perform those steps:

* When starting for the first time: `./node_modules/.bin/allure generate test/allure-results` or `yarn allure-generate`
* When there are already generated (previous) reports run with `--clean` switch: `./node_modules/.bin/allure generate test/allure-results --clean` or `yarn allure-generate:clean`

Once you've done it, just open the Allure dashboard in your local browser: ` ./node_modules/.bin/allure open` or `yarn allure-open`.

## Some general tips & tricks
* If your test is not clicking an element which needs (or tries to click "undefined") take a look if element is already displayed. The most common case is that it tries to click too early, waiting for element to be displayed (or enabled) should help.

* If you are not sure what's happening at the moment, try adding e.g. `browser.pause(5000)` and take a look what's the current state of the application.

* It's helpful to add `addStep()` methods to faster spot where is the problem during test results verification in Jenkins

* It's also helpful to add message in the assertions e.g.: `expect(sth, 'Sth should be equal to sth else').to.equal(sthElse)`. This way there's a ready, meaningful information about assertion in the Allure dashboard.

## License
- **[MIT license](http://opensource.org/licenses/mit-license.php)**
