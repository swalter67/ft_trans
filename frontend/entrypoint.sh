#!/bin/sh
printf "Waiting for install frontend..."
cd /app

# set fund
#npm config set fund false
npm install -g npm@10.2.3
#npm audit fix
npm install
#npm run build

#node dist/main
npm run dev -- --host
