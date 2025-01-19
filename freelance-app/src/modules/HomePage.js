import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../App';

const HomePage = () => {
  const navigate = useNavigate(); // Hook pour naviguer entre les pages

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out');
      navigate('/'); // Redirige vers la page d'accueil ou de connexion
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div>
      <h1>Welcome to My Freelance Services</h1>
      <p>I specialize in Cypress automation, Gherkin integration, and tailored QA solutions.</p>
      <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 mt-4">
        Logout
      </button>
    </div>
  );
};

export default HomePage;
