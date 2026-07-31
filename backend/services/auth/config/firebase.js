import fs from "fs";
import { initializeApp, cert } from "firebase-admin/app";

const serviceAccountPath = "/etc/secrets/serviceAccountKey.json";

if (!fs.existsSync(serviceAccountPath)) {
  throw new Error(
    `Firebase service account file not found: ${serviceAccountPath}`
  );
}

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, "utf8")
);

const app = initializeApp({
  credential: cert(serviceAccount),
});

export { app };