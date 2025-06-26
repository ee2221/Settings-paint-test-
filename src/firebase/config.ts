import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAsjDj-HGu9F7OANRo33hhUoj7_VwwulVE",
  authDomain: "steam-ic-3d-modeling-prototype.firebaseapp.com",
  projectId: "steam-ic-3d-modeling-prototype",
  storageBucket: "steam-ic-3d-modeling-prototype.firebasestorage.app",
  messagingSenderId: "686994464456",
  appId: "1:686994464456:web:fbad4bf48ae1cb51bd8ffd",
  measurementId: "G-6M9L7VPTY6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

export default app;