// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "findmenow-un3ia",
  "appId": "1:351430922906:web:a4af664a8c05e03e148523",
  "storageBucket": "demo1-65776.firebasestorage.app",
  "apiKey": "AIzaSyBMhZb0NlYLHPDNYGSPeDNLrFHfRHsGv6Q",
  "authDomain": "findmenow-un3ia.firebaseapp.com",
  "messagingSenderId": "351430922906"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
