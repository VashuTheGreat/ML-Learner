pipeline {
    agent any

    environment {
        REPO_URL = "https://github.com/VashuTheGreat/ML-Learner.git"
        PROJECT_NAME = "ML-Learner"
        SPACE_NAME = "ML-Learner"
        HF_USERNAME = "VashuTheGreat2"
        HF_TOKEN = credentials('HF_TOKEN')
    }

    stages {

        stage('Clone Repository') {
            steps {
                echo "📥 Cloning repository..."
                git branch: 'main', url: "${REPO_URL}"
            }
        }

        stage('Setup Dependencies') {
            steps {
                echo "🔧 Setting git identity and installing HF CLI..."
                sh '''#!/bin/bash
set -e
git config --global user.name "jenkins"
git config --global user.email "jenkins@local"
export PATH=$HOME/.local/bin:$PATH
if ! command -v hf &> /dev/null; then
    pip3 install --user -U huggingface_hub
fi
'''
            }
        }

        stage('Authenticate Hugging Face') {
            steps {
                echo "🔐 Logging into Hugging Face..."
                sh '''#!/bin/bash
set -e
export PATH=$HOME/.local/bin:$PATH
hf auth login --token "$HF_TOKEN"
'''
            }
        }

        stage('Configure Space Meta') {
            steps {
                echo "📝 Injecting HF Spaces configuration into README.md..."
                sh '''#!/bin/bash
set -e
TEMP_README=$(mktemp)
cat << EOF > "$TEMP_README"
---
title: $PROJECT_NAME
emoji: 🚀
colorFrom: indigo
colorTo: purple
sdk: docker
app_file: Dockerfile
pinned: false
short_description: Multi-service ML-Learner Platform (Node, Python, React)
---

EOF
cat README.md >> "$TEMP_README"
mv "$TEMP_README" README.md
'''
            }
        }

        stage('Create App Space') {
            steps {
                echo "🚀 Creating HF Space if it doesn't exist..."
                sh '''#!/bin/bash
set -e
export PATH=$HOME/.local/bin:$PATH
hf repos create "$HF_USERNAME/$SPACE_NAME" --type space --space-sdk docker || true
sleep 5
'''
            }
        }

        stage('Upload to HF Space') {
            steps {
                echo "📤 Uploading project files..."
                sh '''#!/bin/bash
set -e
export PATH=$HOME/.local/bin:$PATH
export HF_DEBUG=1
hf upload "$HF_USERNAME/$SPACE_NAME" . --repo-type=space
'''
            }
        }

    }

    post {
        success {
            echo "✅ Pipeline executed successfully!"
        }
        failure {
            echo "❌ Pipeline failed!"
        }
    }
}
