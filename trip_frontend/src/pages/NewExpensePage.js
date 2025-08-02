import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import {
  addDoc,
  collection,
  getDocs,
  doc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import './NewExpensePage_UI.css';

function NewExpensePage() {
  const { id: groupId } = useParams();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [participants, setParticipants] = useState([]);
  const [memberList, setMemberList] = useState([]);
  const [currentUserName, setCurrentUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMembers = async () => {
      const membersRef = collection(db, 'groups', groupId, 'members');
      const snapshot = await getDocs(membersRef);
      const list = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
      setMemberList(list);

      // ログインユーザーの名前も取得して表示
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(membersRef, user.uid));
        if (userDoc.exists()) {
          setCurrentUserName(userDoc.data().name || user.uid);
        } else {
          setCurrentUserName(user.uid); // 名前が未登録ならUID表示
        }
      }
    };

    fetchMembers();
  }, [groupId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !amount || !description || participants.length === 0) return;

    try {
      await addDoc(collection(db, 'groups', groupId, 'expenses'), {
        payer: user.uid,
        amount: Number(amount),
        description,
        participants,
        createdAt: serverTimestamp()
      });
      navigate(`/groups/${groupId}`);
    } catch (error) {
      console.error('支払い追加に失敗しました:', error);
    }
  };

  const handleParticipantChange = (uid) => {
    setParticipants((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  return (
    <div className="expense-form-container">
      <h2>支払い追加</h2>
      <form onSubmit={handleSubmit}>
        <p>支払者：{currentUserName}</p>

        <input
          type="number"
          placeholder="金額（円）"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        /><br />

        <input
          type="text"
          placeholder="内容（例：宿代、食事など）"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        /><br />

        <div className="checkbox-list">
          <p>対象メンバーを選択：</p>
          {memberList.map((member) => (
            <label key={member.uid}>
              <input
                type="checkbox"
                value={member.uid}
                checked={participants.includes(member.uid)}
                onChange={() => handleParticipantChange(member.uid)}
              />
              {member.name || member.uid}
            </label>
          ))}
        </div>

        <button className="submit-button" type="submit">+ 追加</button>
      </form>
      <button className="back-button" onClick={() => navigate(`/groups/${groupId}`)}>
        ← グループ詳細に戻る
      </button>
    </div>
  );
}

export default NewExpensePage;
