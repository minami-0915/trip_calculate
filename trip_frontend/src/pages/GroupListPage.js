import { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './GroupListPage_UI.css';

function GroupListPage() {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);
      const q = query(collection(db, 'groups'), where('members', 'array-contains', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const groupList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGroups(groupList);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleCreateGroup = async () => {
    if (!groupName.trim() || !user) return;

    const docRef = await addDoc(collection(db, 'groups'), {
      name: groupName,
      members: [user.uid],
    });

    navigate(`/groups/${docRef.id}`);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('ログアウトに失敗しました:', error);
      alert('ログアウトできませんでした');
    }
  };

  return (
    <div className="group-list-container">
      <div style={{ textAlign: 'right' }}>
        <button className="logout-button" onClick={handleLogout}>ログアウト</button>
      </div>

      <h2>グループ一覧</h2>

      <div style={{ marginTop: '2rem' }}>
        {groups.map((group) => (
          <div
            className="group-card"
            key={group.id}
            onClick={() => navigate(`/groups/${group.id}`)}
          >
            {group.name}
          </div>
        ))}
      </div>

      <div className="group-form">
        <input
          type="text"
          placeholder="グループ名を入力"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <button onClick={handleCreateGroup}>グループを作成</button>
      </div>


    </div>
  );
}

export default GroupListPage;
