import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../src/App'; // Import l'auth depuis `App.js`
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../App';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleAuth = async () => {
    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
  
        // Crée une entrée utilisateur dans Firestore
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          kanban: [],
          calendar: [],
        });
  
        alert('Registration successful!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert('Login successful!');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">{isRegister ? 'Register' : 'Login'}</h2>
      <input
        type="email"
        placeholder="Email"
        className="block border p-2 mt-4"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="block border p-2 mt-4"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleAuth} className="bg-blue-500 text-white px-4 py-2 mt-4">
        {isRegister ? 'Register' : 'Login'}
      </button>
      <p className="mt-4 text-sm">
        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
        <span
          className="text-blue-500 cursor-pointer"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? 'Login' : 'Register'}
        </span>
      </p>
    </div>
  );
};

export default LoginPage;
