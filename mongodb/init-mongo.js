print("Starting replica set initialization...");

// Connect to admin database with authentication
db = connect("mongodb://greysageadmin:tempPWD123@localhost:27017/admin?tls=false");

let maxAttempts = 10;
let attempt = 1;
while (attempt <= maxAttempts) {
  try {
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
    sleep(1000); // Wait 1 second before retrying
    attempt++;
  }
}