import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


// Suas chaves do projeto AnjoAnimal2 (Não precisa mudar, são as mesmas)
const firebaseConfig = {
  apiKey: "AIzaSyBKp4pFvOlprA-whOteoEqvTKfMWSYIh5U",
  authDomain: "anjoanimal2.firebaseapp.com",
  projectId: "anjoanimal2",
  storageBucket: "anjoanimal2.firebasestorage.app",
  messagingSenderId: "585654906580",
  appId: "1:585654906580:web:83f1fedf3e5ac361b21541"
};

const app = initializeApp(firebaseConfig);

// Apenas o banco de dados
export const db = getFirestore(app);
export const auth = getAuth(app);