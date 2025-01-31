import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../App'; // Ajout de db pour Firestore
import { setDoc, doc, getDoc } from "firebase/firestore"; // Ajout pour enregistrer l'utilisateur
import '../css/loginStyle.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading ] = useState(false);
  const [errorMessage ] = useState('');
  const navigate = useNavigate();

  const fetchUserRole = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userSnapshot = await getDoc(userDocRef);
  
      if (userSnapshot.exists()) {
        return userSnapshot.data().role;
      } else {
        console.error("❌ Utilisateur introuvable dans Firestore.");
        return "client";
      }
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des données utilisateur :", error);
      return "client";
    }
  };

  const handleAuth = async () => {
    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
  
        await setDoc(doc(db, "users", newUser.uid), {
          email: newUser.email,
          role: "client",
          createdAt: new Date()
        });
  
        alert("Inscription réussie !");
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const loggedUser = userCredential.user;
  
        console.log("🔥 Utilisateur connecté :", loggedUser.uid, loggedUser.email);
  
        // 🔥 Correction : on récupère maintenant le rôle
        const role = await fetchUserRole(loggedUser.uid);
        console.log("✅ Rôle récupéré :", role);
      }
    } catch (error) {
      alert(error.message);
    }
  };
  
  
  
  

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">{isRegister ? 'Créer un compte' : 'Bienvenue'}</h2>
        <p className="login-subtitle">
          {isRegister
            ? 'Inscrivez-vous pour accéder à votre tableau de bord'
            : 'Connectez-vous pour accéder à votre tableau de bord'}
        </p>
        
        {errorMessage && <p className="login-error">{errorMessage}</p>} {/* Affichage des erreurs */}

        <div className="mb-4">
          <label htmlFor="email" className="login-label">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Saisissez votre e-mail"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="login-label">Mot de passe</label>
          <input
            id="password"
            type="password"
            placeholder="Saisissez votre mot de passe"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button 
          onClick={handleAuth} 
          className="login-button" 
          disabled={loading}
        >
          {loading ? "Chargement..." : isRegister ? 'Inscription' : 'Connexion'}
        </button>

        <p className="mt-4 text-center">
          {isRegister ? 'Vous avez déjà un compte ?' : "Vous n'avez pas de compte ?"}{' '}
          <span className="login-link" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Connexion' : 'Inscription'}
          </span>
        </p>

        <div className="login-divider">OU</div>

        <button 
          onClick={() => navigate('/calendar')} 
          className="login-alt-button"
          disabled={loading}
        >
          Prise de rendez-vous sans compte
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
