FROM mongo:7.0

# Install openssl for keyfile generation
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Create directories for data and keyfile
RUN mkdir -p /data/db /data/configdb && chown mongodb:mongodb /data/db /data/configdb

# Copy initialization script
COPY init-mongo.js /docker-entrypoint-initdb.d/init-mongo.js

# Generate keyfile and set permissions
RUN openssl rand -base64 756 > /data/keyfile.key && \
    chmod 400 /data/keyfile.key && \
    chown mongodb:mongodb /data/keyfile.key

# Set environment variables
ENV MONGO_INITDB_ROOT_USERNAME=greysageadmin
ENV MONGO_INITDB_ROOT_PASSWORD=tempPWD123

# Expose MongoDB port
EXPOSE 27017

# Start MongoDB with replica set configuration
ENTRYPOINT ["/bin/bash", "-c", "exec /usr/local/bin/docker-entrypoint.sh mongod --replSet rs0 --keyFile /data/keyfile.key --bind_ip_all --port 27017"]