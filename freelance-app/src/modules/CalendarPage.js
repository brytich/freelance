import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../App';

const CalendarPage = () => {
    const [date, setDate] = useState(new Date());
    const [events, setEvents] = useState([]);
  
    useEffect(() => {
      const fetchCalendar = async () => {
        const user = auth.currentUser;
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setEvents(userDoc.data().calendar || []);
        }
      };
  
      fetchCalendar();
    }, []);
  
    const addEvent = async (newDate) => {
      const updatedEvents = [...events, newDate];
      setEvents(updatedEvents);
  
      const user = auth.currentUser;
      await updateDoc(doc(db, 'users', user.uid), { calendar: updatedEvents });
    };
  
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Booking Calendar</h2>
        <Calendar onChange={(date) => {
          setDate(date);
          addEvent(date.toISOString());
        }} value={date} />
        <ul>
          {events.map((event, index) => (
            <li key={index}>Event: {new Date(event).toDateString()}</li>
          ))}
        </ul>
      </div>
    );
  };
  
  export default CalendarPage;
