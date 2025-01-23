import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db, auth } from '../App';
import { sendEmail } from '../composants/utils/sendEmail.js';

const CalendarPage = () => {
  const [date, setDate] = useState(new Date());
  const [timeSlot, setTimeSlot] = useState('');
  const [name, setName] = useState('');
  const [events, setEvents] = useState([]);
  const [userData, setUserData] = useState(null);

  // Récupérer les données utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.error('Utilisateur non connecté.');
          return;
        }

        const usersQuery = query(collection(db, 'users'), where('email', '==', user.email));
        const querySnapshot = await getDocs(usersQuery);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0].data();
          setUserData(userDoc);
        } else {
          console.error('Aucun utilisateur trouvé dans Firestore.');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur :', error.message);
      }
    };

    fetchUserData();
  }, []);

  // Récupérer les événements
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (!userData) return;

        let eventsQuery;

        if (userData.role === 'superAdmin') {
          eventsQuery = query(
            collection(db, 'events'),
            where('adminEmails', 'array-contains', userData.email)
          );
        } else if (userData.role === 'client') {
          eventsQuery = query(
            collection(db, 'events'),
            where('clientEmail', '==', userData.email)
          );
        }

        if (eventsQuery) {
          const querySnapshot = await getDocs(eventsQuery);
          const fetchedEvents = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setEvents(fetchedEvents);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des événements :', error.message);
      }
    };

    fetchEvents();
  }, [userData]);

  const addEvent = async () => {
    if (!timeSlot || !name) {
      alert('Veuillez sélectionner un horaire et entrer votre nom.');
      return;
    }

    if (!userData) {
      alert('Impossible de récupérer les informations utilisateur.');
      return;
    }

    const targetAdmin = userData.adminEmails ? userData.adminEmails[0] : null; // Cible unique
    if (!targetAdmin) {
      console.error("Aucun admin cible défini pour cet utilisateur.");
      alert("Aucun administrateur assigné.");
      return;
    }

    const newEvent = {
      date: date.toISOString().split('T')[0],
      timeSlot,
      name,
      createdByClient: userData.role === 'client' ? userData.email : null,
      createdByAdmin: userData.role === 'superAdmin' ? userData.email : null,
      clientEmail: userData.role === 'client' ? userData.email : null,
      adminEmails: userData.role === 'client' ? userData.adminEmails || [] : [], // Vérifiez que c'est un tableau
      targetAdmin: targetAdmin, // Ajout explicite de la cible
    };

    try {
      // Ajouter l'événement dans Firestore
      await addDoc(collection(db, 'events'), newEvent);

      // Mettre à jour l'affichage local
      setEvents((prevEvents) => [...prevEvents, newEvent]);

      // Envoyer un email uniquement au targetAdmin
      if (userData.role === 'client' && targetAdmin) {
        console.log(`Envoi de mail à : ${targetAdmin}`);
        await sendEmail({
          to: targetAdmin,
          subject: 'Nouvelle réservation',
          body: `Un rendez-vous a été créé par ${name} le ${newEvent.date} à ${newEvent.timeSlot}.`,
        });
      }

      // Envoyer un email au client si créé par un superAdmin
      if (userData.role === 'superAdmin' && newEvent.clientEmail) {
        console.log(`Envoi de mail au client : ${newEvent.clientEmail}`);
        await sendEmail({
          to: newEvent.clientEmail,
          subject: 'Confirmation de réservation',
          body: `Votre rendez-vous a été confirmé pour le ${newEvent.date} à ${newEvent.timeSlot}.`,
        });
      }

      alert('Événement ajouté avec succès et notification envoyée.');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'événement :', error.message);
    }
  };

  const timeSlots = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        {userData?.role === 'superAdmin' ? 'Rendez-vous des clients' : 'Mes rendez-vous'}
      </h2>
      <Calendar onChange={setDate} value={date} />
      {userData?.role === 'client' && (
        <>
          <div className="mt-4">
            <label className="block mb-2">Choisissez un horaire :</label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="border p-2 w-full"
            >
              <option value="">-- Sélectionner un horaire --</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4">
            <label className="block mb-2">Entrez votre nom :</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
              className="border p-2 w-full"
            />
          </div>
          <button
            onClick={addEvent}
            className="bg-blue-500 text-white px-4 py-2 mt-4"
          >
            Ajouter un événement
          </button>
        </>
      )}
      <h3 className="text-xl font-bold mt-6">Événements programmés :</h3>
      <ul className="mt-4">
        {events.map((event, index) => (
          <li key={index}>
            {event.date} à {event.timeSlot} - {event.name}
            {event.createdByClient ? ` (Créé par le client)` : ` (Créé par l'administrateur)`}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CalendarPage;
