#!/bin/bash

echo 'Lotto backend {{' $1 '}} - Starting server.. Please wait...'

mode='reload'

if [ "${mode}" == $1 ]; then
  echo ${mode}
else
  mode=$1
  echo ${mode}
fi

case ${mode} in
  "start")
    npm install
    pm2 start ecosystem.config.js --env production
    echo 'Successful server startup.'
    ;;
  "reload")
    npm install
    pm2 reload ecosystem.config.js --env production
    echo 'Successful server reloaded.'
    ;;
  *)
    echo 0
esac
