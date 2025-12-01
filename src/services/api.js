import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore'; // <--- IMPORTANTE: arrayUnion
import { auth, db } from './firebaseConfig';

export const api = {
    
  // --- LOGIN ---
  login: async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { user: { email } }; 
    } catch (error) {
      let msg = "Erro ao fazer login.";
      if (error.code === 'auth/invalid-email') msg = "E-mail inválido.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') msg = "E-mail ou senha errados.";
      if (error.code === 'auth/wrong-password') msg = "Senha incorreta.";
      return { error: msg };
    }
  },

  // --- RECUPERAR SENHA ---
  resetPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { error: "Erro ao enviar e-mail." };
    }
  },

  // --- LISTAR DENÚNCIAS ---
  getReports: async () => {
    try {
      const reportsCol = collection(db, 'reports');
      const q = query(reportsCol, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Erro ao buscar:", error);
      return [];
    }
  },

  // --- CRIAR DENÚNCIA ---
  createReport: async (data, imagesArray) => {
    try {
      const newReport = {
        ...data,
        images: imagesArray || [], 
        visits: [], // <--- Inicializa o histórico vazio para novas denúncias
        protocol: new Date().getFullYear() + Math.floor(Math.random() * 10000).toString(),
        date: new Date().toISOString(),
        status: 'Pendente',
      };
      const docRef = await addDoc(collection(db, 'reports'), newReport);
      return { ...newReport, id: docRef.id };
    } catch (error) {
      console.error("Erro ao criar:", error);
      return null;
    }
  },

  // --- ATUALIZAR STATUS ---
  updateStatus: async (id, newStatus) => {
    try {
      const docRef = doc(db, 'reports', id);
      await updateDoc(docRef, { status: newStatus });
      return true;
    } catch (error) {
      return false;
    }
  },

  // --- NOVA FUNÇÃO: ADICIONAR VISITA/TRATATIVA ---
  addVisit: async (id, text, authorEmail) => {
    try {
      const docRef = doc(db, 'reports', id);
      const newVisit = {
        date: new Date().toISOString(),
        description: text,
        author: authorEmail
      };
      // O comando arrayUnion adiciona o item na lista sem apagar os anteriores
      await updateDoc(docRef, { 
        visits: arrayUnion(newVisit) 
      });
      return { success: true, visit: newVisit };
    } catch (error) {
      console.error("Erro ao adicionar visita:", error);
      return { success: false };
    }
  },

  // --- EXCLUIR DENÚNCIA ---
  deleteReport: async (id) => {
    try {
      const docRef = doc(db, 'reports', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      return false;
    }
  },

  // --- NOVA FUNÇÃO: REMOVER VISITA ---
  removeVisit: async (id, visitObject) => {
    try {
      const docRef = doc(db, 'reports', id);
      // 'arrayRemove' busca exatamente esse objeto na lista e o apaga
      await updateDoc(docRef, { 
        visits: arrayRemove(visitObject) 
      });
      return true;
    } catch (error) {
      console.error("Erro ao remover visita:", error);
      return false;
    }
  },
}; 