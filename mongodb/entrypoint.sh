#!/bin/bash
set -e
echo "Running entrypoint.sh..."
ls -l /docker-entrypoint-initdb.d/

# Start MongoDB in standalone mode for user creation with TLS (no --fork)
echo "Starting MongoDB in standalone mode with TLS..."
gosu mongodb mongod --bind_ip_all --port 27017 --dbpath /data/db --tlsMode requireTLS --tlsCertificateKeyFile /etc/ssl/mongodb.pem --tlsCAFile /etc/ssl/mongodb.pem --logpath /tmp/mongod.log
sleep 15

# Run create-user.js
if [ -f /docker-entrypoint-initdb.d/01-create-user.js ]; then
    echo "Executing /docker-entrypoint-initdb.d/01-create-user.js..."
    gosu mongodb mongosh --quiet --tls --tlsCAFile /etc/ssl/mongodb.pem --eval "load('/docker-entrypoint-initdb.d/01-create-user.js')" mongodb://localhost:27017/admin?ssl=true
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
sleep 5

# Start MongoDB in replica set mode with TLS (no --fork)
echo "Starting MongoDB in replica set mode with TLS..."
gosu mongodb mongod --config /etc/mongod.conf --logpath /tmp/mongod.log
sleep 15

# Run init-mongo.js
if [ -f /docker-entrypoint-initdb.d/02-init-mongo.js ]; then
    echo "Executing /docker-entrypoint-initdb.d/02-init-mongo.js..."
    gosu mongodb mongosh --quiet --tls --tlsCAFile /etc/ssl/mongodb.pem --eval "load('/docker-entrypoint-initdb.d/02-init-mongo.js')" mongodb://localhost:27017/admin?ssl=true
    if [ $? -eq 0 ]; then
        echo "02-init-mongo.js executed successfully"
    else
        echo "Error executing 02-init-mongo.js"
        exit 1
    fi
fi

# Shut down replica set MongoDB
echo "Shutting down replica set MongoDB..."
gosu mongodb mongod --shutdown
sleep 5

# Start MongoDB in foreground with TLS
echo "Starting MongoDB in foreground with TLS..."
exec gosu mongodb mongod --config /etc/mongod.conf