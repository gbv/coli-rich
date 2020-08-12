#!/bin/bash
# Deploy to GitHub Pages on travis with an encrypted deploy key

set -e
set -u

git config --global user.email "voss@gbv.de"
git config --global user.name "Jakob Voß (DEPLOY)"

mkdir -p ~/.ssh
echo "Host github.com" >> ~/.ssh/config
echo "        StrictHostKeyChecking no" >> ~/.ssh/config
chmod 600 ~/.ssh/config

openssl aes-256-cbc -K $encrypted_5a976ece19b3_key -iv $encrypted_5a976ece19b3_iv -in .travis/travis-deploy-github.enc -out .travis/travis-deploy-github.pem -d
chmod 0400 .travis/travis-deploy-github.pem

set -v
eval "$(ssh-agent -s)"
ssh-add .travis/travis-deploy-github.pem

cd dist/
git init
git remote add origin git@github.com:gbv/coli-rich.git
echo > .nojekyll
git add .
git commit -m "Update dist/"
git push -f origin master:gh-pages
