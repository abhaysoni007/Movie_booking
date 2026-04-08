#!/usr/bin/env bash
npm install
node -e "require('./db.js'); console.log('DB initialized');"
