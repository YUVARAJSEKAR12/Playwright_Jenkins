pipeline {
    agent any

    tools {
        nodejs 'Node18'
    }

    parameters {
        string(
            name: 'TAGS',
            defaultValue: '@smoke',
            description: 'Enter Cucumber tags (e.g., @smoke or @regression or @smoke and not @wip)'
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
                echo "Running tests with TAGS: ${params.TAGS}"
                bat "npx cucumber-js --tags \"${params.TAGS}\""
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'screenshots/**, videos/**, reports/**', allowEmptyArchive: true
            junit allowEmptyResults: true, testResults: 'reports/junit/*.xml'
        }
    }
}
