// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNB-ZXm5Uj9K2d-LQpyZyw2ENKKWmCop8",
  authDomain: "nail-polish-picker.firebaseapp.com",
  projectId: "nail-polish-picker",
  storageBucket: "nail-polish-picker.firebasestorage.app",
  messagingSenderId: "936823412682",
  appId: "1:936823412682:web:614d9d5d1ae23b02b8e133"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
