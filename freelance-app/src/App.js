import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

// Import des modules
import HomePage from './modules/HomePage';
import CalendarPage from './modules/CalendarPage';
import KanbanPage from './modules/KanbanPage';
import PaymentPage from './modules/PaymentPage';
import LoginPage from './modules/LoginPage';

// Import des composants
import Navbar from './composants/Navbar';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyD03CnbJOuGOCb4yX_flBTKzbUX6QNK-9U",
  authDomain: "lanceur-franc.firebaseapp.com",
  projectId: "lanceur-franc",
  storageBucket: "lanceur-franc.firebasestorage.app",
  messagingSenderId: "143656869475",
  appId: "1:143656869475:web:9cc639dbf6761885706256",
  measurementId: "G-HNRLJX94G2",
};

// Initialise Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const App = () => {
  const [user, setUser] = useState(null); // État pour l'utilisateur connecté
  const [userRole, setUserRole] = useState(null); // État pour le rôle utilisateur

  // Écoute des changements d'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userQuery = query(
            collection(db, 'users'),
            where('email', '==', currentUser.email) // Correction ici
          );
          const userSnapshot = await getDocs(userQuery);
          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();
            setUserRole(userData.role);
          } else {
            console.error('Utilisateur introuvable dans Firestore.');
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des données utilisateur :', error.message);
        }
      } else {
        setUserRole(null);
      }
    });
  
    return () => unsubscribe();
  }, []);
  

  return (
    <Router>
      {/* Affiche la barre de navigation uniquement si l'utilisateur est connecté */}
      {user && <Navbar userRole={userRole} />}
      <Routes>
  {/* Route accessible même sans connexion */}
  <Route path="/calendar" element={<CalendarPage />} />
  
  {!user ? (
    <>
      {/* Page de connexion pour les utilisateurs non connectés */}
      <Route path="*" element={<LoginPage />} />
    </>
  ) : (
    <>
      {/* Routes pour les utilisateurs connectés */}
      <Route path="/" element={<HomePage />} />
      <Route path="/kanban" element={<KanbanPage userRole={userRole} />} />
      <Route path="/payment" element={<PaymentPage />} />
    </>
  )}
</Routes>

    </Router>
  );
};

export default App;
