import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auth } from '../App';
import { signOut } from 'firebase/auth';
import '../css/navbar.css';

const Navbar = () => {
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Successfully logged out.");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="navbar">
      <ul>
        <li className={location.pathname === "/" ? "active" : ""}>
          <Link to="/">Accueil</Link>
        </li>
        <li className={location.pathname === "/calendar" ? "active" : ""}>
          <Link to="/calendar">Calendrier</Link>
        </li>
        <li className={location.pathname === "/kanban" ? "active" : ""}>
          <Link to="/kanban">Tableau de Bord</Link>
        </li>
        <li className={location.pathname === "/payment" ? "active" : ""}>
          <Link to="/payment">Paiement</Link>
        </li>
      </ul>
      <button onClick={handleLogout} className="logout-btn">
        Deconnexion
      </button>
    </nav>
  );
};

export default Navbar;
