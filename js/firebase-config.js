import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBdVgeMqQKtuJEQxrPFz8xB7XmUN6cFlMQ",
  authDomain: "kh-donghua.firebaseapp.com",
  databaseURL: "https://kh-donghua-default-rtdb.firebaseio.com",
  projectId: "kh-donghua",
  storageBucket: "kh-donghua.appspot.com",
  messagingSenderId: "119897892431",
  appId: "1:119897892431:web:ad31196e8a9692b63e6c3a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
