import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav className="bg-blue-500 p-4">
    <ul className="flex justify-around">
      <li><Link to="/" className="text-white">Home</Link></li>
      <li><Link to="/calendar" className="text-white">Calendar</Link></li>
      <li><Link to="/kanban" className="text-white">Kanban</Link></li>
      <li><Link to="/payment" className="text-white">Payment</Link></li>
    </ul>
  </nav>
);

export default Navbar;
