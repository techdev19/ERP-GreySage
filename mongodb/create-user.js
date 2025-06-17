print("Creating admin user...");
db = connect("mongodb://localhost:27017/admin");
db.createUser({
    user: "greysageadmin",
    pwd: "tempPWD123",
    roles: [{ role: "root", db: "admin" }]
});
print("Admin user created successfully");