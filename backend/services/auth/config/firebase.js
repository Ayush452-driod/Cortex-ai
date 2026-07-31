import admin from "firebase-admin";
import fs from "fs";

const serviceAccountPath = "/etc/secrets/serviceAccountKey.json";

if (!fs.existsSync(serviceAccountPath)) {
  throw new Error(
    `Firebase service account file not found: ${serviceAccountPath}`
  );
}

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, "utf8")
);

const app = admin.apps.length
  ? admin.app()
  : admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

export { app };
export default admin;