import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Suas chaves do projeto AnjoAnimal2
const firebaseConfig = {
  apiKey: "AIzaSyBKp4pFvOlprA-whOteoEqvTKfMWSYIh5U",
  authDomain: "anjoanimal2.firebaseapp.com",
  projectId: "anjoanimal2",
  storageBucket: "anjoanimal2.firebasestorage.app",
  messagingSenderId: "585654906580",
  appId: "1:585654906580:web:83f1fedf3e5ac361b21541"
};

let app;
let auth;

// Verifica se o Firebase já foi inicializado para evitar erro no Reload
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  
  // Inicializa o Auth com persistência (mantém logado ao fechar o app)
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} else {
  // Se já estiver inicializado, apenas recupera as instâncias
  app = getApp();
  auth = getAuth(app);
}

const db = getFirestore(app);

export { db, auth };