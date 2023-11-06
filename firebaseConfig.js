import { initializeFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyB_h8fvb2J3XFdP6TGlynRsNV_79fxlZvU",
  authDomain: "finalproject-9e9c9.firebaseapp.com",
  projectId: "finalproject-9e9c9",
  storageBucket: "finalproject-9e9c9.appspot.com",
  messagingSenderId: "111093244594",
  appId: "1:111093244594:web:6f138df7685f0f61abdfab"
};


// Initialize Firebase    
const app = initializeApp(firebaseConfig);

const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
})
export { db }