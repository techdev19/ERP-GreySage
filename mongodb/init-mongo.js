print("Starting replica set initialization...");
let maxAttempts = 5;
let attempt = 1;
let mongoHost = process.env.MONGO_HOST || "localhost";
sleep(15000); // Wait 15 seconds
while (attempt <= maxAttempts) {
    try {
        print(`Attempt ${attempt}: Connecting to admin database...`);
        db = connect(`mongodb://greysageadmin:tempPWD123@${mongoHost}:27017/admin?authSource=admin&ssl=true`);
        print("Connected to admin database");
        rs.initiate({
            _id: "rs0",
            members: [{ _id: 0, host: `${mongoHost}:27017` }]
        });
        print("Replica set initiated successfully");
        break;
    } catch (e) {
        print(`Attempt ${attempt} failed: ${e}`);
        if (attempt === maxAttempts) {
            print("Max attempts reached. Exiting with error.");
            throw e;
        }
        sleep(5000);
        attempt++;
    }
}