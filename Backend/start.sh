#!/usr/bin/env sh
set -e

printf "*** Running prisma generate\n"
npx prisma generate

printf "*** Running prisma migrate deploy\n"
npx prisma migrate deploy || true

printf "*** Running database seed\n"
npx prisma db seed || true

printf "*** Starting server\n"
node dist/server.js
