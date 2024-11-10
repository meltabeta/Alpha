import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAyVzoSJAhb63WbAbjSRVRrIRGGifN9AeI",
  authDomain: "movieflix-c8223.firebaseapp.com",
  databaseURL: "https://movieflix-c8223-default-rtdb.firebaseio.com",
  projectId: "movieflix-c8223",
  storageBucket: "movieflix-c8223.firebasestorage.app",
  messagingSenderId: "745071272054",
  appId: "1:745071272054:web:01021955f18bf87a997f57"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app); 