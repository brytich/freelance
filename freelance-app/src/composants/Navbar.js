import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auth } from '../App';
import { signOut } from 'firebase/auth';
import '../css/navbar.css';
import { FaHome, FaCalendarAlt, FaTasks, FaSignOutAlt } from 'react-icons/fa';

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
          <Link to="/">
            <FaHome />
            <span>Accueil</span>
          </Link>
        </li>
        <li className={location.pathname === "/calendar" ? "active" : ""}>
          <Link to="/calendar">
            <FaCalendarAlt />
            <span>Calendrier</span>
          </Link>
        </li>
        <li className={location.pathname === "/kanban" ? "active" : ""}>
          <Link to="/kanban">
            <FaTasks />
            <span>Tableau de Bord</span>
          </Link>
        </li>
        {/*<li className={location.pathname === "/payment" ? "active" : ""}>
          <Link to="/payment">
            <FaMoneyBillWave />
            <span>Paiement</span>
          </Link>
        </li>*/}
      </ul>
      <button onClick={handleLogout} className="logout-btn">
        <FaSignOutAlt />
        <span>Déconnexion</span>
      </button>
    </nav>
  );
};

export default Navbar;