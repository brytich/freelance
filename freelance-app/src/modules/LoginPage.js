import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../App';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-6">
          {isRegister ? 'Créer un compte' : 'Bienvenue'}
        </h2>
        <p className="text-gray-400 text-sm text-center mb-4">
          {isRegister
            ? 'Inscrivez-vous pour accéder à votre tableau de bord'
            : 'Connectez-vous pour accéder à votre tableau de bord'}
        </p>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Saisissez votre e-mail"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Saisissez votre password"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          onClick={handleAuth}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
        >
          {isRegister ? 'Inscription' : 'Connexion'}
        </button>
        <p className="mt-4 text-center text-sm text-gray-400">
          {isRegister ? 'Vous avez déjà un compte ?' : "Vous n'avez pas de compte ?"}{' '}
          <span
            className="text-blue-500 cursor-pointer hover:underline"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? 'Connexion' : 'Inscription'}
          </span>
        </p>
        <div className="my-6 flex items-center">
          <div className="flex-grow h-px bg-gray-600"></div>
          <span className="px-4 text-gray-400 text-sm">OR</span>
          <div className="flex-grow h-px bg-gray-600"></div>
        </div>
        <button
          onClick={() => navigate('/calendar')}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
        >
          Prise de rendez-vous sans compte
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
