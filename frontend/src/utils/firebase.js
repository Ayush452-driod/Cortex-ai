import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "cortexai-60f16.firebaseapp.com",
  projectId: "cortexai-60f16",
  storageBucket: "cortexai-60f16.firebasestorage.app",
  messagingSenderId: "99816326574",
  appId: "1:99816326574:web:44207722efcf94a513343f",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();