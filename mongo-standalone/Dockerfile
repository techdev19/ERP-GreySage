FROM mongo:7.0

ENTRYPOINT ["/bin/bash", "-c", "openssl rand -base64 756 > /data/keyfile.key && chmod 400 /data/keyfile.key && chown mongodb:mongodb /data/keyfile.key && /usr/local/bin/docker-entrypoint.sh mongod --replSet rs0 --keyFile /data/keyfile.key --bind_ip_all"]

CMD ["--replSet", "rs0", "--bind_ip_all", "--port", "27017"]

EXPOSE 27017

ENV MONGO_INITDB_ROOT_USERNAME=greysageadmin \
    MONGO_INITDB_ROOT_PASSWORD=tempPWD123

HEALTHCHECK --interval=5s --timeout=30s --start-period=10s --start-interval=1s --retries=3 \
    CMD echo "try { rs.status() } catch (err) { rs.initiate({_id:'rs0',members:[{_id:0,host:'mongodb:27017'}]}) }" | mongosh --port 27017 --quiet

VOLUME /data/db /data/configdb

COPY ./init-mongo.js /docker-entrypoint-initdb.d/init-mongo.js