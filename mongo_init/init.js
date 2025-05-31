// Create admin user and enforce authentication
db.getSiblingDB("admin").createUser({
  user: "${MONGO_INITDB_ROOT_USERNAME}",
  pwd: "${MONGO_INITDB_ROOT_PASSWORD}",
  roles: [{ role: "root", db: "admin" }]
});

// Create sales_accounting database and a user
db.getSiblingDB("sales_accounting").createUser({
  user: "${MONGO_INITDB_ROOT_USERNAME}",
  pwd: "${MONGO_INITDB_ROOT_PASSWORD}",
  roles: [{ role: "dbOwner", db: "sales_accounting" }]
});