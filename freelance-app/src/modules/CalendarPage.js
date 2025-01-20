import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../App';

const CalendarPage = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setEvents(userDoc.data().calendar || []);
        }
      } catch (error) {
        console.error('Error fetching calendar data:', error.message);
      }
    };

    fetchCalendar();
  }, []);

  const addEvent = async (newDate) => {
    try {
      const updatedEvents = [...events, newDate];
      setEvents(updatedEvents);

      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { calendar: updatedEvents });
      }
    } catch (error) {
      console.error('Error adding event to calendar:', error.message);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Booking Calendar</h2>
      <Calendar
        onChange={(date) => {
          setDate(date);
          addEvent(date.toISOString());
        }}
        value={date}
      />
      <ul>
        {events.map((event, index) => (
          <li key={index}>Event: {new Date(event).toDateString()}</li>
        ))}
      </ul>
    </div>
  );
};

export default CalendarPage;
