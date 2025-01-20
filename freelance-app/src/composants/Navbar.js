import React from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../App';
import { signOut } from 'firebase/auth';

const Navbar = ({ userRole }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Successfully logged out.");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="bg-blue-500 p-4">
      <ul className="flex justify-around">
        <li><Link to="/" className="text-white">Home</Link></li>
        <li><Link to="/calendar" className="text-white">Calendar</Link></li>
        <li><Link to="/kanban" className="text-white">Kanban</Link></li>
        <li><Link to="/payment" className="text-white">Payment</Link></li>
        <li>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2">
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
