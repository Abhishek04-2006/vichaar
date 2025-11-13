import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // ✅ Add this

const firebaseConfig = {
  apiKey: "AIzaSyARIN49NrNJ94rUKje7IocM3asDwVXSwuU",
  authDomain: "vichaar-app.firebaseapp.com",
  projectId: "vichaar-app",
  storageBucket: "vichaar-app.firebasestorage.app",
  messagingSenderId: "373620033937",
  appId: "1:373620033937:web:17aa048aebf28191f3b230"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // ✅ Export storage
