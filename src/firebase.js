import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
    apiKey: "AIzaSyB-r5foQTv6-nOVgF8tt-0n5NqZpzo5InE",
    authDomain: "fyp---car-dealership.firebaseapp.com",
    databaseURL: "https://fyp---car-dealership-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "fyp---car-dealership",
    storageBucket: "fyp---car-dealership.appspot.com",
    messagingSenderId: "660528174336",
    appId: "1:660528174336:web:bf79f3e930909c9b9c8fe5",
    measurementId: "G-9BMQ29FHND"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };
export const auth = getAuth(app);

export const getUserEmail = (auth) => {

}