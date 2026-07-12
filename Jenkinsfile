pipeline {
    agent any

    tools {
        nodejs 'Node18'
    }

    parameters {
        string(
            name: 'TAGS',
            defaultValue: '@smoke',
            description: 'Enter Cucumber tags, for example @smoke or @regression'
        )
    }

    stages {
        stage('Install Dependencies') {
            steps {
                sh 'node -v'
                sh 'npm -v'
                sh 'npm ci'
                sh 'npx playwright install --with-deps'
            }
        }

        stage('Run Tests') {
            steps {
                echo "Running tests with TAGS: ${params.TAGS}"

                sh """
                    mkdir -p test-results cucumber-report

                    npx cucumber-js \
                      --tags '${params.TAGS}' \
                      --format progress \
                      --format junit:test-results/cucumber-results.xml \
                      --format html:cucumber-report/index.html
                """
            }
        }
    }

    post {
        always {
            archiveArtifacts(
                artifacts: 'reports/**/*, cucumber-report/**/*, test-results/**/*, playwright-report/**/*',
                allowEmptyArchive: true
            )

            junit(
                testResults: 'test-results/**/*.xml',
                allowEmptyResults: true
            )

            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'cucumber-report',
                reportFiles: 'index.html',
                reportName: 'Cucumber HTML Report'
            ])
        }

        success {
            echo 'Cucumber tests completed successfully.'
        }

        failure {
            echo 'Pipeline failed. Check test execution and report publishing logs.'
        }
    }
}
