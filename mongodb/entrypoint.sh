#!/bin/bash
set -e
echo "Running entrypoint.sh..."
ls -l /docker-entrypoint-initdb.d/

# Start MongoDB in background
gosu mongodb mongod --config /etc/mongod.conf --fork --logpath /tmp/mongod.log
sleep 5 # Wait for MongoDB to start

# Run initialization scripts with explicit ssl=false
for f in /docker-entrypoint-initdb.d/*.js; do
    if [ -f "$f" ]; then
        echo "Executing $f..."
        gosu mongodb mongosh --quiet --eval "load('$f')" mongodb://localhost:27017/admin?ssl=false
        if [ $? -eq 0 ]; then
            echo "$f executed successfully"
        else
            echo "Error executing $f"
            exit 1
        fi
    fi
done

# Bring MongoDB to foreground
gosu mongodb mongod --config /etc/mongod.conf