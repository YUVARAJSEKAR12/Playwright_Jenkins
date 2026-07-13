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
        stage('Install') {
            steps {
                bat 'node -v'
                bat 'npm -v'
                bat 'npm ci'
                bat 'npx playwright install'
            }
        }

        stage('Test') {
            steps {
                bat "npx cucumber-js --tags \"${params.TAGS}\""

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
      // Archive reports if you generate them
      archiveArtifacts artifacts: 'reports/**/*, cucumber-report/**/*, test-results/**/*, playwright-report/**/*', allowEmptyArchive: true

      // Optional JUnit publish (only if you generate junit xml)
      junit testResults: 'test-results/**/*.xml', allowEmptyResults: true

      // Optional: publish HTML report (needs "HTML Publisher" plugin)
      publishHTML(target: [
        allowMissing: true,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportDir: 'cucumber-report',
        reportFiles: 'index.html',
        reportName: 'Cucumber HTML Report'
      ])
    }
}
