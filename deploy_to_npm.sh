#!/bin/bash
./npm_login.sh
git config --global user.email $NPM_EMAIL
git config --global user.name $NPM_USERNAME
npm i && npm run build && npm publish
