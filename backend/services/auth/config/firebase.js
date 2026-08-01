import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { initializeApp, cert } from "firebase-admin/app";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serviceAccount;

// Render
if (process.env.RENDER) {
  serviceAccount = JSON.parse(
    fs.readFileSync("/etc/secrets/serviceAccountKey.json", "utf8")
  );
} else {
  // Local development
  const localPath = path.join(__dirname, "../serviceAccountKey.json");
  serviceAccount = JSON.parse(fs.readFileSync(localPath, "utf8"));
}

const app = initializeApp({
  credential: cert(serviceAccount),
});

export { app };