rs.initiate({
  _id: "rs0",
  members: [{ _id: 0, host: process.env.DB_HOST || "mongodb:27017" }]
});