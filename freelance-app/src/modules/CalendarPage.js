import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../App';
import { sendEmail } from '../composants/utils/sendEmail.js';
import { FaSun, FaMoon } from 'react-icons/fa';
import '../css/calendarStyle/calendar.css';


const CalendarPage = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());
  const [name, setName] = useState('');
  const [service, setService] = useState('');
  const [timeSlot, setTimeSlot] = useState(''); // Ajout de l'état pour l'horaire
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const services = ['Consultation', 'Formation', 'Audit', 'Support technique'];

  // Vérifie l'authentification Firebase
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);
  

  // Gère le mode sombre en stockage local
  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', darkMode);
    document.documentElement.classList.toggle('light-mode', !darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const addEvent = async () => {
    if (!name || !service || !timeSlot) {
      alert('❌ Veuillez remplir tous les champs.');
      return;
    }
  
    if (loading) return;
    setLoading(true);
    setMessage(null);
  
    const email = isAuthenticated ? auth.currentUser?.email : 'guest@example.com';
    const targetAdmin = 'bryan.catiche@gmail.com';
  
    try {
      const newEvent = {
        date: date.toISOString().split('T')[0],
        timeSlot, // Ajout de l'horaire ici 🕒
        name,
        service,
        clientEmail: email,
        adminEmails: [targetAdmin],
      };
  
      await addDoc(collection(db, 'events'), newEvent);
      console.log('✅ Événement ajouté avec succès :', newEvent);
  
      await sendEmail({
        to: targetAdmin,
        subject: 'Nouvelle réservation',
        body: `📅 Un rendez-vous a été créé par ${name}.\n
        🏷️ Service : ${service}\n
        📆 Date : ${newEvent.date}\n
        ⏰ Horaire : ${newEvent.timeSlot}\n
        📧 Email du client : ${email}`,
      });
  
      setMessage('✅ Réservation confirmée ! Un email a été envoyé.');
    } catch (error) {
      console.error('❌ Erreur :', error);
      setMessage("❌ Une erreur s'est produite. Réessayez.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className={`min-h-screen flex items-center justify-center transition-all ${darkMode ? 'bg-[#0f172a] text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className={`p-8 rounded-lg shadow-xl w-full max-w-4xl transition-all duration-300 ${darkMode ? 'bg-[#1e293b] shadow-blue-500/50' : 'bg-white shadow-lg'}`}>
  
        {/* Toggle Mode */}
        <div className="flex justify-end">
          <button onClick={() => setDarkMode(!darkMode)} className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-all">
            {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-blue-500" />}
          </button>
        </div>
  
        <h2 className="text-3xl font-bold mb-6 text-center">Réserver un rendez-vous</h2>
  
        {!isAuthenticated && (
          <button className="bg-gray-500 text-white px-4 py-2 mb-6 rounded hover:bg-gray-600 transition" onClick={() => navigate('/')}>
            Retour à la page de connexion
          </button>
        )}
  
        {/* Message de confirmation */}
        {message && <p className="text-center text-lg font-semibold text-green-400 my-4">{message}</p>}
  
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
{/* Calendrier moderne centré et agrandi, adaptatif au mode dark/light */}
<div className="calendar-container">
  <div className={`p-8 rounded-lg shadow-lg transition-all duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-200'} w-full max-w-xl`}>
    <DatePicker
      selected={date}
      onChange={(date) => setDate(date)}
      className={`w-full p-4 text-lg rounded-lg shadow-md transition-all duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
      calendarClassName="react-datepicker"
      dateFormat="dd/MM/yyyy"
      minDate={new Date()} 
      inline
    />
  </div>
</div>


  
          {/* Formulaire */}
          <div>
            <div className="mb-4">
              <label className="block mb-2 font-semibold">Choisissez un service :</label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className={`border-none p-3 rounded w-full transition-all shadow-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}
              >
                <option value="">-- Sélectionner un service --</option>
                {services.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Sélection de l'horaire */}
<div className="mb-4">
  <label className="block mb-2 font-semibold">Choisissez un horaire :</label>
  <select
    value={timeSlot}
    onChange={(e) => setTimeSlot(e.target.value)}
    className={`border-none p-3 rounded w-full transition-all shadow-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}
  >
    <option value="">-- Sélectionner un horaire --</option>
    {['10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30'
    ].map((slot) => (
      <option key={slot} value={slot}>{slot}</option>
    ))}
  </select>
</div>

  
            <div className="mb-4">
              <label className="block mb-2 font-semibold">Entrez votre nom :</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom"
                className={`border-none p-3 rounded w-full transition-all shadow-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}
              />
            </div>
  
            <button onClick={addEvent} disabled={loading} 
              className={`bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded w-full transition-all shadow-md hover:shadow-blue-500/50 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {loading ? '⏳ Envoi en cours...' : '✅ Confirmer le rendez-vous'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
};

export default CalendarPage;
