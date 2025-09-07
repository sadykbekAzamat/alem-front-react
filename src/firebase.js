import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCFoyvQivtHJtKcq0jjTF4ryCqFGNys7b0",
  authDomain: "alem-repetition.firebaseapp.com",
  projectId: "alem-repetition",
  storageBucket: "alem-repetition.firebasestorage.app",
  appId: "1:1006628150251:web:6e47857cc7eb5e379017ae"
};

const app = initializeApp(firebaseConfig);

const storage = getStorage(app);

export { app, storage };
