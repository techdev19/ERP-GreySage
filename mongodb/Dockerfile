FROM mongo:7.0

# Install openssl and gosu
RUN apt-get update && apt-get install -y openssl gosu && rm -rf /var/lib/apt/lists/*

# Create directories for data and keyfile
RUN mkdir -p /data/db /data/configdb && chown mongodb:mongodb /data/db /data/configdb

# Copy initialization scripts and configuration
COPY create-user.js /docker-entrypoint-initdb.d/01-create-user.js
COPY init-mongo.js /docker-entrypoint-initdb.d/02-init-mongo.js
COPY entrypoint.sh /entrypoint.sh
COPY mongod.conf /etc/mongod.conf

# Generate keyfile and set permissions
RUN openssl rand -base64 756 > /data/keyfile.key && \
    chmod 400 /data/keyfile.key && \
    chown mongodb:mongodb /data/keyfile.key

# Set execute permissions for entrypoint
RUN chmod +x /entrypoint.sh

# Expose MongoDB port
EXPOSE 27017

# Use custom entrypoint
ENTRYPOINT ["/entrypoint.sh"]