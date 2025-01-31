import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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
  const [loading, setLoading] = useState(true); // Ajout d'un état de chargement pour éviter les écrans blancs

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userSnapshot = await getDoc(userDocRef);

          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            setUserRole(userData.role);
            console.log("🔥 Rôle récupéré :", userData.role);
          } else {
            console.error("❌ Utilisateur introuvable dans Firestore.");
            setUserRole("client");
          }
        } catch (error) {
          console.error("❌ Erreur lors de la récupération des données utilisateur :", error);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading-screen">Chargement...</div>;
  }

  return (
    <Router>
      {user && <Navbar userRole={userRole} />}
      <Routes>
        <Route path="/calendar" element={<CalendarPage />} />
        {!user ? (
          <Route path="*" element={<LoginPage />} />
        ) : (
          <>
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
