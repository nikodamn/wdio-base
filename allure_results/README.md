Do not remove this folder or this file. It's needed for WebdriverIO tests. Why? Since docker-compose is mounting volumes as root user, test results would not be reachable for Jenkins Allure plugin. That's why by including this empty folder in repository, it's initialized with Jenkins permissions (not root) and Jenkins has correct permissions to include those results in the build.