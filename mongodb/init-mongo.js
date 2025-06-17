print("Starting replica set initialization...");

// Connect to admin database with authentication
db = connect("mongodb://greysageadmin:tempPWD123@localhost:27017/admin?authSource=admin");

// Check server status
print("Server status:", JSON.stringify(db.serverStatus().repl, null, 2));

// Check if replica set is already initialized
let rsStatus;
try {
    rsStatus = rs.status();
    print("Replica set status:", JSON.stringify(rsStatus, null, 2));
    if (rsStatus.ok === 1) {
        print("Replica set already initialized");
        quit(0);
    }
} catch (e) {
    print("Replica set not yet initialized:", e);
}

let maxAttempts = 10;
let attempt = 1;
while (attempt <= maxAttempts) {
    try {
        print("Attempting to initiate replica set...");
        rs.initiate({
            _id: "rs0",
            members: [{ _id: 0, host: "localhost:27017" }]
        });
        print("Replica set initiated successfully");
        print("Replica set status:", JSON.stringify(rs.status(), null, 2));
        break;
    } catch (e) {
        print(`Attempt ${attempt} failed: ${e}`);
        if (attempt === maxAttempts) {
            print("Failed to initiate replica set after maximum attempts");
            throw e;
        }
        sleep(2000); // Wait 2 seconds before retrying
        attempt++;
    }
}