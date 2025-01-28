import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../App';
import '../css/loginStyle.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async () => {
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('Inscription réussie');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert('Connexion réussie');
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
          <label htmlFor="password" className="login-label">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Saisissez votre password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button onClick={handleAuth} className="login-button">
          {isRegister ? 'Inscription' : 'Connexion'}
        </button>
        <p className="mt-4 text-center">
          {isRegister ? 'Vous avez déjà un compte ?' : "Vous n'avez pas de compte ?"}{' '}
          <span className="login-link" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Connexion' : 'Inscription'}
          </span>
        </p>
        <div className="login-divider">OU</div>
        <button onClick={() => navigate('/calendar')} className="login-alt-button">
          Prise de rendez-vous sans compte
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
