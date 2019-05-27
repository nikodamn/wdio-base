def jobBuildNumber = env.BUILD_NUMBER
def currentBuildStatusOK = true;
def testsExitStatus = '';

node ('wdio') {
  wrap([$class: 'AnsiColorBuildWrapper', colorMapName: 'xterm']) {

    currentBuild.description = "branch ${params.commit} on ${params.environment} for ${params.resolution}"

    try {
        stage('Try to remove exited containers (if any)') {
            // In case if previous jobs were stopped or aborted and containers were not stopped and deleted properly
            // we would like to stop all containers with status 'Exited'.
            sh returnStdout: true, script: 'docker ps -a -q -f status=exited'
            sh returnStdout: true, script: 'docker rm -v $(docker ps -a -q -f status=exited)'
            sh returnStdout: true, script: "docker-compose -p wdio-${jobBuildNumber} down"
        }
    } catch (e) {
            // No operation.
            // Try/catch is here just because we don't want to fail the job if there are no 'Exited' containers running.
    }

    try {
        stage('Try to remove old wdio docker images') {
            // Print existing wdio images
            sh returnStdout: true, script: "docker images | grep 'wdio'"
            // Try to delete wdio leftover images which might be there after some jobs did not clean up after itself
            // (e.g. got aborted in the middle of execution)
            sh returnStdout: true, script: "docker rmi \$(docker images | grep 'wdio')"
        }
    } catch (e) {
        // No operation
    }

        stage("Clone repo and setup git") {
            // Setup git credentials
            sh(script: 'git config --global user.name "Sir Jenkins"')
            sh(script: 'git config --global user.email "jenkins@fandom.com"')

            git url: 'git@github.com:nikodamn/wdio-base.git',
            credentialsId: 'bd3cf712-39a7-4b16-979e-ff86208ab2ea',
            branch: 'master'
            sshagent(credentials: ['bd3cf712-39a7-4b16-979e-ff86208ab2ea']) {
                //Clean any local changes and untracked files, then fetch and checkout
                sh "git reset --hard"
                // Clean ignored files and directories like 'build'
                sh "git clean -fdX"
                sh "git fetch origin"
                sh "git checkout ${params.commit}"
                // Pull only if params.commit is a valid branch name
                sh "if git show-ref --quiet ${params.commit}; then git pull origin ${params.commit}; fi"
            }
        }

        stage('Build an image with WebdriverIO tests') {
            // Build wdio-jobBuildNumber. This way we ensure that each of the images is unique.
            // This will be helpfull in the situation when we have multiple wdio images running on one machine at once.
            sh returnStdout: true, script: "docker-compose -p wdio-${jobBuildNumber} build wdio"
        }

    if(params.resolution.toLowerCase().contains("desktop")) {
        try {
            stage('Run all desktop tests') {
                // Pass ENV param from job parameter and run all tests (command configured in docker-compose.yaml).
                // --exit-code-from wdio ensures that once all tests finished container will be stopped.
                testsExitStatus = sh (returnStatus: true, script: "ENV=${params.environment} docker-compose -p wdio-${jobBuildNumber} run wdio ./node_modules/.bin/wdio ./specs/config/remote-desktop.conf.js --port=4444")
            }
        } catch (e) {
                // No operation.
                // If not all tests passed we still want to move on and generate test reports.
        }
    }

    if(params.resolution.toLowerCase().contains("mobile")) {
        try {
            stage('Run all mobile tests') {
                // Pass ENV param from job parameter and run all tests (command configured in docker-compose.yaml).
                // --exit-code-from wdio ensures that once all tests finished container will be stopped.
                testsExitStatus = sh (returnStatus: true, script: "& ENV=${params.environment} docker-compose -p wdio-${jobBuildNumber} run wdio ./node_modules/.bin/wdio ./specs/config/remote-mobile.conf.js --port=4444")
            }
        } catch (e) {
                // No operation.
                // If not all tests passed we still want to move on and generate test reports.
        }
    }

    echo "Desktop tests exit status: ${testsExitStatus}"

        // Use Allure jenkins plugin for generating raports
        stage('Generate Allure reports') {
            script {
                try {
                    allure([
                            includeProperties: false,
                            jdk: '',
                            properties: [],
                            reportBuildPolicy: 'ALWAYS',
                            results: [[path: '/allure-results']]
                    ])
                } catch (e) {
                    // No operation.
                    // In case of Allure reports generation failure we still want to move on to the next step.
                }
            }
        }

    try {
        stage('Clean up containers') {
            // Shut down wdio container.
            sh returnStdout: true, script: "docker-compose -p wdio-${jobBuildNumber} down"
            // Remove wdio unique container to safe machine's disk space.
            // No need to delete Selenium-standalone, since it is reused.
            sh returnStdout: true, script: "docker rmi \$(docker images | grep 'wdio-${jobBuildNumber}')"
        }
    } catch (e) {
        // No Operation.
        // If there are no containers to shut down, it's even better. :)
    }
        stage('Set current build status') {
            if(testsExitStatus == 1) {
                currentBuild.result = 'UNSTABLE'
            } else if (testsExitStatus != 0) {
                currentBuild.result = 'FAILURE'
            }
        }
  }
}