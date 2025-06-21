FROM mongo:7.0

# Generate keyfile and set permissions
RUN mkdir -p /data && \
    openssl rand -base64 756 > /data/keyfile.key && \
    chmod 400 /data/keyfile.key && \
    chown mongodb:mongodb /data/keyfile.key

# Expose MongoDB port
EXPOSE 27017

# Environment variables for root user
ENV MONGO_INITDB_ROOT_USERNAME=greysageadmin \
    MONGO_INITDB_ROOT_PASSWORD=tempPWD123

# Healthcheck to verify replica set status
HEALTHCHECK --interval=5s --timeout=30s --start-period=10s --start-interval=1s --retries=3 \
    CMD echo "try { rs.status() } catch (err) { rs.initiate({_id:'rs0',members:[{_id:0,host:'${DB_HOST:-mongodb}:27017'}]}) }" | mongosh --port 27017 --quiet --nossl

# Define volumes
VOLUME /data/db /data/configdb

# Copy initialization script
COPY ./init-mongo.js /docker-entrypoint-initdb.d/init-mongo.js

# Explicit entrypoint
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["mongod", "--replSet", "rs0", "--keyFile", "/data/keyfile.key", "--bind_ip_all", "--port", "27017"]