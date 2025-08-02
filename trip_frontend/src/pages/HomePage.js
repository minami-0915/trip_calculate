import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './HomePage.css';

function HomePage() {
  const [user, setUser] = useState(null);
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [userGroups, setUserGroups] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchGroupsAndEvents = async () => {
      const groupSnapshot = await getDocs(collection(db, 'groups'));
      const userGroupsList = [];
      const result = [];

      for (const groupDoc of groupSnapshot.docs) {
        const groupData = groupDoc.data();
        const members = groupData.members || [];
        if (!members.includes(user.uid)) continue;

        userGroupsList.push({ id: groupDoc.id, name: groupData.name });

        const eventsRef = collection(db, 'groups', groupDoc.id, 'events');
        const eventSnapshot = await getDocs(eventsRef);

        eventSnapshot.forEach((eventDoc) => {
          const eventData = eventDoc.data();
          result.push({
            id: eventDoc.id,
            title: eventData.title,
            date: new Date(eventData.date.toDate ? eventData.date.toDate() : eventData.date),
            groupId: groupDoc.id,
            groupName: groupData.name || '(名称なし)',
            location: eventData.location || ''
          });
        });
      }

      setUserGroups(userGroupsList);
      setEvents(result);
    };

    fetchGroupsAndEvents();
  }, [user]);

  const filteredEvents = events.filter(
    (e) => e.date.toDateString() === date.toDateString()
  );

  const eventsInMonth = events.filter(
    (e) =>
      e.date.getFullYear() === date.getFullYear() &&
      e.date.getMonth() === date.getMonth()
  );

  const openAddEventModal = () => {
    setShowModal(true);
  };

  const closeAddEventModal = () => {
    setShowModal(false);
    setNewEventTitle('');
    setNewEventLocation('');
    setSelectedGroupId('');
  };

  const handleAddEvent = async () => {
    if (!newEventTitle || !selectedGroupId) {
      alert('タイトルとグループを選択してください。');
      return;
    }

    try {
      await addDoc(collection(db, 'groups', selectedGroupId, 'events'), {
        title: newEventTitle,
        date: date,
        location: newEventLocation
      });

      alert('イベントを追加しました！');
      closeAddEventModal();
    } catch (error) {
      console.error('イベント追加に失敗:', error);
      alert('追加に失敗しました');
    }
  };

  return (
  <div className="calendar-section">
      <div className="calendar-box">
        <h2>予定カレンダー</h2>
        <Calendar onChange={setDate} value={date} />
        <button onClick={openAddEventModal} className="add-event-btn">+ 新しい予定を追加</button>
      </div>
    
    <div className="calendar-layout">
      <div className="daily-event-list">
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
    

    {/* 月内イベント一覧（下部） */}
    <div className="event-list">
      <h4>{date.getFullYear()}年{date.getMonth() + 1}月の予定一覧</h4>
      {eventsInMonth.length === 0 ? (
        <p>今月の予定はありません</p>
      ) : (
        <ul>
          {eventsInMonth.map((e) => (
            <li key={e.id} className="event-item">
              <strong>{e.title}</strong>（{e.groupName}）<br />
              {e.date.toLocaleDateString()} 📍 {e.location || '場所未定'}
            </li>
          ))}
        </ul>
      )}
    </div>
    </div>

    {/* モーダル */}
    {showModal && (
      <div className="modal-overlay">
        <div className="modal">
          <h4>新しい予定を追加</h4>
          <input
            type="text"
            placeholder="タイトル"
            value={newEventTitle}
            onChange={(e) => setNewEventTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="場所（任意）"
            value={newEventLocation}
            onChange={(e) => setNewEventLocation(e.target.value)}
          />
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
          >
            <option value="">グループを選択</option>
            {userGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <button onClick={handleAddEvent}>追加</button>
          <button onClick={closeAddEventModal} className="cancel-btn">キャンセル</button>
        </div>
      </div>
    )}
  </div>
);

}

export default HomePage;
