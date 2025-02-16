// src/firebase.js
import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, doc, setDoc, getDoc, updateDoc, deleteDoc, addDoc, getDocs, query, where,
  onSnapshot // ✅ Import onSnapshot for real-time updates
} from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBBHxlENYS533zr4VCfTPIzE4PWp4yXG1I",
  authDomain: "pharmacy-95e79.firebaseapp.com",
  projectId: "pharmacy-95e79",
  storageBucket: "pharmacy-95e79.appspot.com",
  messagingSenderId: "561110150365",
  appId: "1:561110150365:web:1aac0722e3cd843a65ff34",
  measurementId: "G-3V3J7F8FXK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ Export onSnapshot for real-time functionality
export { db, setDoc, collection, doc, getDoc, updateDoc, deleteDoc, addDoc, getDocs, onSnapshot, query, where };
