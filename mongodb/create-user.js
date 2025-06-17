print("Creating admin user...");
db = connect("mongodb://localhost:27017/admin?ssl=false");

let userExists = db.getUser("greysageadmin");
if (!userExists) {
    db.createUser({
        user: "greysageadmin",
        pwd: "tempPWD123",
        roles: [{ role: "root", db: "admin" }]
    });
    print("Admin user created successfully");
} else {
    print("Admin user already exists");
}