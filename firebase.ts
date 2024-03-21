// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { collection, onSnapshot, doc, setDoc, query, orderBy } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzesqPF5pc9qpH3dxczJAkf4HuF8c39oc",
  authDomain: "earthx-terriamap.firebaseapp.com",
  projectId: "earthx-terriamap",
  storageBucket: "earthx-terriamap.appspot.com",
  messagingSenderId: "940001236247",
  appId: "1:940001236247:web:b7bfcc3df981ac7c091352"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const collectionRef = collection;
export const onSnapshotRef = onSnapshot;
export const queryRef = query;
export const orderByRef = orderBy;