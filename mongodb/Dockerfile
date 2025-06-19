FROM mongo:7.0.21
RUN mkdir -p /data/db /data/configdb && chown mongodb:mongodb /data/db /data/configdb
COPY create-user.js /docker-entrypoint-initdb.d/01-create-user.js
COPY init-mongo.js /docker-entrypoint-initdb.d/02-init-mongo.js
COPY entrypoint.sh /entrypoint.sh
COPY mongod.conf /etc/mongod.conf
COPY mongodb.pem /etc/ssl/mongodb.pem
RUN openssl rand -base64 756 > /data/keyfile.key && \
    chmod 400 /data/keyfile.key && \
    chown mongodb:mongodb /data/keyfile.key
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]