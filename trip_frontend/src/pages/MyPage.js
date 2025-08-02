import { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './MyPage.css';

function GroupListPage() {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [user, setUser] = useState(null);
  const [otherUsers, setOtherUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);
      await fetchGroups(currentUser);
      await fetchUserFriends(currentUser);
      await fetchOtherUsers(currentUser);
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchGroups = async (currentUser) => {
    const q = query(
      collection(db, 'groups'),
      where('members', 'array-contains', currentUser.uid)
    );
    const querySnapshot = await getDocs(q);
    const groupList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setGroups(groupList);
  };

  const fetchUserFriends = async (currentUser) => {
    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const data = userDoc.data();
      setFriends(data.friends || []);
    } else {
      setFriends([]);
    }
  };

  const fetchOtherUsers = async (currentUser) => {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const others = usersSnapshot.docs
      .filter(doc => doc.id !== currentUser.uid)
      .map(doc => ({ uid: doc.id, ...doc.data() }));
    setOtherUsers(others);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || !user) return;
    try {
      const docRef = await addDoc(collection(db, 'groups'), {
        name: groupName,
        members: [user.uid]
      });
      navigate(`/groups/${docRef.id}`);
    } catch (error) {
      console.error('グループ作成に失敗しました:', error);
    }
  };

  const deleteGroup = async (groupId) => {
    if (!window.confirm('このグループを本当に削除しますか？')) return;
    try {
      await deleteDoc(doc(db, 'groups', groupId));
      setGroups((prev) => prev.filter((group) => group.id !== groupId));
    } catch (error) {
      console.error('グループ削除に失敗しました:', error);
      alert('削除できませんでした');
    }
  };

  const handleAddFriend = async (friendUid, friendName) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const currentData = userDoc.exists() ? userDoc.data() : {};
      const currentFriends = currentData.friends || [];

      if (!currentFriends.includes(friendUid)) {
        await setDoc(userRef, {
          ...currentData,
          displayName: user.displayName || '',
          friends: [...currentFriends, friendUid]
        });
        setFriends([...currentFriends, friendUid]);
        alert(`${friendName} を友達に追加しました！`);
      } else {
        alert('すでに友達です。');
      }
    } catch (e) {
      console.error('友達追加に失敗:', e);
    }
  };

  return (
    <div>
      <div className="group-list-container">
       <div className="page-header">
          <h2 >マイページ</h2>
      </div>
      <h3>参加中のグループ</h3>
      <div style={{ marginTop: '2rem' }}>
        {groups.map((group) => (
          <div className="group-card" key={group.id}>
            <div className="group-name">{group.name}</div>
            <button
              className="action-button"
              onClick={() => navigate(`/groups/${group.id}`)}
            >
              詳細
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h3>他のユーザー</h3>
        {otherUsers.filter(u => !friends.includes(u.uid)).length === 0 ? (
          <p>追加できるユーザーはいません。</p>
        ) : (
          otherUsers.filter(u => !friends.includes(u.uid)).map((u) => (
            <div key={u.uid} className="group-card">
              <p>{u.displayName || '名無し'}（{u.uid}）</p>
              <button
                className="action-button"
                onClick={() => handleAddFriend(u.uid, u.displayName || '名無し')}
              >
                + 友達に追加
              </button>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h3>既に友達のユーザー</h3>
        {otherUsers.filter(u => friends.includes(u.uid)).map((u) => (
          <div key={u.uid} className="group-card">
            <p>{u.displayName || '名無し'}（{u.uid}）</p>
            <button className="already-friend-button" disabled>
              友達済み
            </button>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}

export default GroupListPage;
