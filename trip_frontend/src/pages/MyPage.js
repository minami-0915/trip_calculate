// src/pages/MyPage.js
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './MyPage.css';

function MyPage() {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchGroups = async () => {
      const groupsSnapshot = await getDocs(collection(db, 'groups'));
      const userGroups = [];

      for (const docSnap of groupsSnapshot.docs) {
        const memberDoc = await getDoc(doc(db, 'groups', docSnap.id, 'members', user.uid));
        if (memberDoc.exists()) {
          userGroups.push({ id: docSnap.id, ...docSnap.data() });
        }
      }
      setGroups(userGroups);
    };

    const fetchFriends = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        const friendUIDs = data.friends || [];

        const friendsData = await Promise.all(friendUIDs.map(async (uid) => {
          const friendDoc = await getDoc(doc(db, 'users', uid));
          return friendDoc.exists() ? { uid, ...friendDoc.data() } : { uid };
        }));
        setFriends(friendsData);
      }
    };

    fetchGroups();
    fetchFriends();
  }, [user]);

  return (
    <div className="mypage-container">
      <h2>マイページ</h2>

      {user && (
        <div className="profile-box">
          <p><strong>あなたのUID：</strong> <code>{user.uid}</code></p>
          <p><strong>表示名：</strong> {user.displayName || '未設定'}</p>
          <img
            src={user.photoURL || '/default-icon.png'}
            alt="アイコン"
            className="profile-icon"
          />
        </div>
      )}

      <div className="group-section">
        <h3>参加中のグループ</h3>
        {groups.length === 0 ? (
          <p>参加中のグループはありません。</p>
        ) : (
          groups.map((g) => (
            <div key={g.id} className="group-card">
              <p>{g.name}</p>
              <button onClick={() => navigate(`/groups/${g.id}`)}>詳細へ</button>
            </div>
          ))
        )}
      </div>

      <div className="friend-section">
        <h3>つながったことのある友達</h3>
        {friends.length === 0 ? (
          <p>まだ友達はいません。</p>
        ) : (
          friends.map((f) => (
            <div key={f.uid} className="friend-card">
              <p>{f.displayName || '未登録ユーザー'}（{f.uid}）</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MyPage;
