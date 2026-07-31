import admin from "firebase-admin";

const firebaseKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!firebaseKey) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not defined");
}

const serviceAccount = JSON.parse(firebaseKey);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;