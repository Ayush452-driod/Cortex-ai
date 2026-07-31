import admin from "firebase-admin";
import fs from "fs";

const serviceAccountPath = "/etc/secrets/serviceAccountKey.json";

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, "utf8")
);

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export { app };
export default admin;