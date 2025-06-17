#!/bin/bash
set -e
echo "Running entrypoint.sh..."
ls -l /docker-entrypoint-initdb.d/

# Start MongoDB in standalone mode for user creation
echo "Starting MongoDB in standalone mode..."
gosu mongodb mongod --bind_ip_all --port 27017 --dbpath /data/db --fork --logpath /tmp/mongod.log
sleep 15 # Wait for MongoDB to start

# Run create-user.js
if [ -f /docker-entrypoint-initdb.d/01-create-user.js ]; then
    echo "Executing /docker-entrypoint-initdb.d/01-create-user.js..."
    gosu mongodb mongosh --quiet --eval "load('/docker-entrypoint-initdb.d/01-create-user.js')" mongodb://localhost:27017/admin?ssl=false
    if [ $? -eq 0 ]; then
        echo "01-create-user.js executed successfully"
    else
        echo "Error executing 01-create-user.js"
        exit 1
    fi
fi

# Shut down standalone MongoDB
echo "Shutting down standalone MongoDB..."
gosu mongodb mongod --shutdown

# Start MongoDB in replica set mode for initialization
echo "Starting MongoDB in replica set mode..."
gosu mongodb mongod --config /etc/mongod.conf --fork --logpath /tmp/mongod.log
sleep 15 # Wait for MongoDB to start

# Run init-mongo.js
if [ -f /docker-entrypoint-initdb.d/02-init-mongo.js ]; then
    echo "Executing /docker-entrypoint-initdb.d/02-init-mongo.js..."
    gosu mongodb mongosh --quiet --eval "load('/docker-entrypoint-initdb.d/02-init-mongo.js')" mongodb://localhost:27017/admin?ssl=false
    if [ $? -eq 0 ]; then
        echo "02-init-mongo.js executed successfully"
    else
        echo "Error executing 02-init-mongo.js"
        exit 1
    fi
fi

# Bring MongoDB to foreground with replica set configuration
echo "Starting MongoDB in foreground..."
gosu mongodb mongod --config /etc/mongod.conf