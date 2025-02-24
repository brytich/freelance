import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../App';
import { sendEmail } from '../composants/utils/sendEmail.js';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import '../css/calendarStyle/calendar.css';

const CalendarPage = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());
  const [name, setName] = useState('');
  const [service, setService] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const services = ['Consultation', 'Formation', 'Audit', 'Support technique'];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

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
        timeSlot,
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
    <div className="calendar-page">
      <div className="calendar-container">



        <h2 className="title">📅 Réserver un rendez-vous</h2>

        {!isAuthenticated && (
          <button className="return-btn" onClick={() => navigate('/')}>
            Retour à la page de connexion
          </button>
        )}

        {message && <p className="message">{message}</p>}

        <div className="calendar-form">
          <div className="calendar-wrapper">
            <DayPicker
              mode="single"
              selected={date}
              onSelect={setDate}
              footer={
                date ? `Date: ${date.toLocaleDateString()}` : "Pick a day."
              }
              classNames={{
                day_selected: "rdp-day-selected",  // 🔹 Applique notre style CSS
                nav: "rdp-nav",
                caption: "rdp-caption"
              }}
            />
          </div>

          {/* Formulaire */}
          <div className="form-wrapper">
            <div className="form-group">
              <label>Choisissez un service :</label>
              <select value={service} onChange={(e) => setService(e.target.value)}>
                <option value="">Sélectionner un service</option>
                {services.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Sélection de l'horaire */}
            <div className="form-group">
              <label>Choisissez un horaire :</label>
              <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
                <option value="">Sélectionner un horaire</option>
                {['10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
                  '16:00', '16:30', '17:00', '17:30'
                ].map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Entrez votre nom :</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom"
              />
            </div>

            <button onClick={addEvent} disabled={loading} className="confirm-btn">
              {loading ? '⏳ Envoi en cours...' : '✅ Confirmer le rendez-vous'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;