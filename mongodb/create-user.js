print("Creating admin user...");
db = connect("mongodb://localhost:27017/admin?ssl=true");

try {
    db.createUser({
        user: "greysageadmin",
        pwd: "tempPWD123",
        roles: [{ role: "root", db: "admin" }]
    });
    print("Admin user created successfully");
} catch (e) {
    if (e.code === 11000) { // Duplicate user error
        print("Admin user already exists");
    } else {
        print("Error creating admin user: " + e);
        throw e;
    }
}