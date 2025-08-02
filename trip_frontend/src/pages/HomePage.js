import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './HomePage.css';

function HomePage() {
  const [user, setUser] = useState(null);
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

const openAddEventModal = () => {
  alert("ここで予定追加モーダルを開く予定です。");
};

const filteredEvents = events.filter(
  (e) => e.date.toDateString() === date.toDateString()
);

  useEffect(() => {
    if (!user) return;

    const fetchEvents = async () => {
      const groupSnapshot = await getDocs(collection(db, 'groups'));
      const result = [];

      for (const groupDoc of groupSnapshot.docs) {
        const memberDoc = await getDoc(doc(db, 'groups', groupDoc.id, 'members', user.uid));
        if (!memberDoc.exists()) continue;

        const eventsRef = collection(db, 'groups', groupDoc.id, 'events');
        const eventSnapshot = await getDocs(eventsRef);

        eventSnapshot.forEach((eventDoc) => {
          const eventData = eventDoc.data();
          result.push({
            id: eventDoc.id,
            title: eventData.title,
            date: new Date(eventData.date.toDate ? eventData.date.toDate() : eventData.date),
            groupId: groupDoc.id,
            groupName: groupDoc.data().name || '(名称なし)',
          });
        });
      }

      setEvents(result);
    };

    fetchEvents();
  }, [user]);

  return (
    <div className="calendar-section">
  <h3>予定カレンダー</h3>
  <Calendar onChange={setDate} value={date} />
  
  <button onClick={openAddEventModal} className="add-event-btn">+ 新しい予定を追加</button>

  <div className="event-list">
    <h4>{date.toLocaleDateString()} の予定</h4>
    {filteredEvents.length === 0 ? (
      <p>予定はありません</p>
    ) : (
      <ul>
        {filteredEvents.map((e) => (
          <li key={e.id} className="event-item">
            <strong>{e.title}</strong>（{e.groupName}）
            <br />
            📍 {e.location || '場所未定'}
          </li>
        ))}
      </ul>
    )}
  </div>
</div>

  );
}

export default HomePage;
