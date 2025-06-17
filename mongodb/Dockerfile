FROM mongo:7.0

# Install openssl for keyfile generation
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Create directories for data and keyfile
RUN mkdir -p /data/db /data/configdb && chown mongodb:mongodb /data/db /data/configdb

# Copy initialization scripts
COPY create-user.js /docker-entrypoint-initdb.d/01-create-user.js
COPY init-mongo.js /docker-entrypoint-initdb.d/02-init-mongo.js

# Generate keyfile and set permissions
RUN openssl rand -base64 756 > /data/keyfile.key && \
    chmod 400 /data/keyfile.key && \
    chown mongodb:mongodb /data/keyfile.key

# Expose MongoDB port
EXPOSE 27017

# Start MongoDB with replica set and authentication
CMD ["mongod", "--replSet", "rs0", "--keyFile", "/data/keyfile.key", "--auth", "--bind_ip_all", "--port", "27017"]