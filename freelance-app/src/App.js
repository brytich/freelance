import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
  const [user, setUser] = useState(null);

  // Écoute des changements d'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Current User:', currentUser);
      setUser(currentUser);
    });

    return () => unsubscribe(); // Nettoie l'abonnement à l'état d'authentification
  }, []);

  return (
    <Router>
      {/* Affiche la barre de navigation uniquement si l'utilisateur est connecté */}
      {user && <Navbar key="navbar" />}
      <Routes>
        {!user ? (
          // Redirige vers la page de connexion si l'utilisateur n'est pas connecté
          <Route key="login" path="*" element={<LoginPage />} />
        ) : (
          // Charge les routes principales si l'utilisateur est connecté
          <>
            <Route key="home" path="/" element={<HomePage />} />
            <Route key="calendar" path="/calendar" element={<CalendarPage />} />
            <Route key="kanban" path="/kanban" element={<KanbanPage />} />
            <Route key="payment" path="/payment" element={<PaymentPage />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;
