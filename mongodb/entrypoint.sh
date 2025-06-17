#!/bin/bash
set -e
echo "Running entrypoint.sh..."
ls -l /docker-entrypoint-initdb.d/
exec gosu mongodb mongod --config /etc/mongod.conf