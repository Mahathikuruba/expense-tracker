import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyATURdPG6YTFcKIOlmRip7pQnPhUpEO-v0",
  authDomain: "student-career-tracker-974bd.firebaseapp.com",
  projectId: "student-career-tracker-974bd",
  storageBucket: "student-career-tracker-974bd.firebasestorage.app",
  messagingSenderId: "782462511401",
  appId: "1:782462511401:web:887df0fd86180e34c62f38",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
