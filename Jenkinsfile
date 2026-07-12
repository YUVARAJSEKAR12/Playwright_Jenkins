pipeline {
    agent any

    options {
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '20'))
        skipDefaultCheckout(true)
    }

    parameters {
        string(
            name: 'CUCUMBER_TAGS',
            defaultValue: '@smoke',
            description: 'Example: @smoke or @smoke and not @wip'
        )

        choice(
            name: 'BROWSER',
            choices: ['chromium', 'firefox', 'webkit'],
            description: 'Select Playwright browser'
        )

        choice(
            name: 'ENV',
            choices: ['qa', 'stage', 'prod'],
            description: 'Select environment'
        )

        booleanParam(
            name: 'HEADLESS',
            defaultValue: true,
            description: 'Run browser in headless mode'
        )
    }

    environment {
        CI = 'true'
        NPM_CONFIG_FUND = 'false'
        NPM_CONFIG_AUDIT = 'false'
    }

    stages {

        stage('Checkout Source Code') {
            steps {
                cleanWs()

                checkout scm

                bat '''
                    echo Current workspace:
                    cd

                    echo Repository files:
                    dir
                '''
            }
        }

        stage('Verify Required Files') {
            steps {
                bat '''
                    if not exist package.json (
                        echo ERROR: package.json is not available in the Jenkins workspace.
                        exit /b 1
                    )

                    if not exist features (
                        echo ERROR: features folder is not available.
                        exit /b 1
                    )

                    echo package.json and features folder are available.
                '''
            }
        }

        stage('Verify Node and NPM') {
            steps {
                bat '''
                    where node
                    if errorlevel 1 (
                        echo ERROR: Node.js is not configured for Jenkins.
                        exit /b 1
                    )

                    where npm
                    if errorlevel 1 (
                        echo ERROR: npm is not configured for Jenkins.
                        exit /b 1
                    )

                    echo Node version:
                    node --version

                    echo NPM version:
                    npm --version
                '''
            }
        }

        stage('Install NPM Dependencies') {
            steps {
                bat '''
                    if exist package-lock.json (
                        echo package-lock.json found. Running npm ci...
                        call npm ci
                    ) else (
                        echo package-lock.json not found. Running npm install...
                        call npm install
                    )

                    if errorlevel 1 (
                        echo ERROR: NPM dependency installation failed.
                        exit /b 1
                    )

                    echo Installed dependencies:
                    call npm list --depth=0
                '''
            }
        }

        stage('Install Playwright Browser') {
            steps {
                script {
                    bat """
                        echo Installing Playwright browser: ${params.BROWSER}

                        call npx playwright install ${params.BROWSER}

                        if errorlevel 1 (
                            echo ERROR: Playwright browser installation failed.
                            exit /b 1
                        )
                    """
                }
            }
        }

        stage('Verify Feature Tags') {
            steps {
                script {
                    bat """
                        echo Searching for tag: ${params.CUCUMBER_TAGS}

                        findstr /S /N /I /C:"${params.CUCUMBER_TAGS}" features\\*.feature

                        if errorlevel 1 (
                            echo WARNING: Exact tag text may not have been found.
                            echo Jenkins will still execute Cucumber so that Cucumber can validate the expression.
                        )
                    """
                }
            }
        }

        stage('Run Cucumber Tests') {
            steps {
                script {
                    withEnv([
                        "BROWSER=${params.BROWSER}",
                        "HEADLESS=${params.HEADLESS}",
                        "TEST_ENV=${params.ENV}",
                        "DOTENV_CONFIG_PATH=.env.${params.ENV}"
                    ]) {
                        bat """
                            echo ==========================================
                            echo Running Cucumber Playwright tests
                            echo ==========================================
                            echo Tags       : ${params.CUCUMBER_TAGS}
                            echo Browser    : %BROWSER%
                            echo Headless   : %HEADLESS%
                            echo Environment: %TEST_ENV%
                            echo Env file   : %DOTENV_CONFIG_PATH%
                            echo ==========================================

                            if not exist "%DOTENV_CONFIG_PATH%" (
                                echo WARNING: %DOTENV_CONFIG_PATH% does not exist.
                            )

                            call npm run test:cucumber -- --tags "${params.CUCUMBER_TAGS}"

                            if errorlevel 1 (
                                echo ERROR: Cucumber execution failed.
                                exit /b 1
                            )
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Publishing available test results...'

            archiveArtifacts(
                artifacts: 'reports/**/*,cucumber-report/**/*,test-results/**/*,playwright-report/**/*,allure-results/**/*',
                allowEmptyArchive: true
            )

            junit(
                testResults: 'test-results/**/*.xml',
                allowEmptyResults: true
            )

            publishHTML(target: [
                allowMissing         : true,
                alwaysLinkToLastBuild: true,
                keepAll              : true,
                reportDir            : 'cucumber-report',
                reportFiles          : 'index.html',
                reportName           : 'Cucumber HTML Report'
            ])
        }

        success {
            echo 'Cucumber Playwright execution completed successfully.'
        }

        failure {
            echo 'Pipeline failed. Check the failed stage in the Jenkins console output.'
        }

        cleanup {
            echo 'Pipeline execution completed.'
        }
    }
}
