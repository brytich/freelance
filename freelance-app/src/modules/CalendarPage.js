import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../App';
import { sendEmail } from '../composants/utils/sendEmail.js';

const CalendarPage = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());
  const [timeSlot, setTimeSlot] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [service, setService] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const services = ['Consultation', 'Formation', 'Audit', 'Support technique'];
  const durations = ['30 minutes', '1 heure', '2 heures'];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  const addEvent = async () => {
    if (!timeSlot || !name || !duration || !service || !description) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    const email = isAuthenticated ? auth.currentUser?.email : 'guest@example.com';
    const targetAdmin = 'bryan.catiche@gmail.com';

    const newEvent = {
      date: date.toISOString().split('T')[0],
      timeSlot,
      name,
      description,
      duration,
      service,
      clientEmail: email,
      adminEmails: [targetAdmin],
    };

    try {
      await addDoc(collection(db, 'events'), newEvent);
      await sendEmail({
        to: targetAdmin,
        subject: 'Nouvelle réservation',
        body: `Un rendez-vous a été créé par ${name}.
        Service : ${service}
        Durée : ${duration}
        Description : ${description}
        Date : ${newEvent.date}
        Horaire : ${newEvent.timeSlot}`,
      });
      alert('Événement ajouté avec succès.');
    } catch (error) {
      console.error('Error:', error.message);
      alert("Erreur lors de l'ajout de l'événement.");
    }
  };

  const timeSlots = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e293b] text-white">
      <div className="bg-[#24334a] p-8 rounded-lg shadow-lg w-full max-w-5xl">
        <h2 className="text-3xl font-bold mb-6 text-center">Réserver un rendez-vous</h2>
        {!isAuthenticated && (
          <button
            className="bg-gray-500 text-white px-4 py-2 mb-6"
            onClick={() => navigate('/')}
          >
            Retour à la page de connexion
          </button>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendrier */}
          <div className="bg-gray-800 p-4 rounded-lg shadow">
          <Calendar
  onChange={setDate}
  value={date}
  className="border rounded-lg shadow-lg bg-white text-gray-900"
  tileClassName={({ date, view }) => {
    if (view === "month" && date.getDay() === 0) {
      return "text-red-500"; // Dimanches en rouge
    }
  }}
  tileContent={({ date, view }) => {
    if (view === "month" && date.getDate() === new Date().getDate()) {
      return <div className="bg-blue-200 text-blue-800 rounded-full p-1">•</div>; // Ajout d'un point sur la date actuelle
    }
  }}
/>

          </div>

          {/* Formulaire */}
          <div>
            <div className="mb-4">
              <label className="block mb-2 font-semibold">Choisissez un service :</label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="bg-gray-800 text-white border-none p-3 rounded w-full"
              >
                <option value="">-- Sélectionner un service --</option>
                {services.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-semibold">Durée :</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="bg-gray-800 text-white border-none p-3 rounded w-full"
              >
                <option value="">-- Sélectionner une durée --</option>
                {durations.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-semibold">Choisissez un horaire :</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="bg-gray-800 text-white border-none p-3 rounded w-full"
              >
                <option value="">-- Sélectionner un horaire --</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
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
                className="bg-gray-800 text-white border-none p-3 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-semibold">Description :</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description de votre demande"
                className="bg-gray-800 text-white border-none p-3 rounded w-full"
              />
            </div>
            <button
              onClick={addEvent}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded w-full"
            >
              Confirmer le rendez-vous
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
