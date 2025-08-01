import './GroupDetailPage_UI.css';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';

function GroupDetailPage() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [nameMap, setNameMap] = useState({});
  const [newMemberUid, setNewMemberUid] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchExpenses();
    fetchMembers();
  }, [groupId]);

  const fetchExpenses = async () => {
    const expensesRef = collection(db, 'groups', groupId, 'expenses');
    const snapshot = await getDocs(expensesRef);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setExpenses(data);
  };

  const fetchMembers = async () => {
    const membersRef = collection(db, 'groups', groupId, 'members');
    const snapshot = await getDocs(membersRef);
    const data = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));
    setMembers(data);

    const map = {};
    data.forEach(member => {
      map[member.uid] = member.name || member.uid;
    });
    setNameMap(map);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberUid) return alert('UIDを入力してください');
    try {
      const memberRef = doc(db, 'groups', groupId, 'members', newMemberUid);
      await setDoc(memberRef, {
        name: newMemberName || ''
      });
      alert('メンバーを追加しました');
      setNewMemberUid('');
      setNewMemberName('');
      fetchMembers();
    } catch (error) {
      console.error('メンバー追加失敗:', error);
      alert('追加に失敗しました');
    }
  };

  const deleteMember = async (uid) => {
    if (!window.confirm('本当にこのメンバーを削除しますか？')) return;
    try {
      await deleteDoc(doc(db, 'groups', groupId, 'members', uid));
      fetchMembers();
    } catch (err) {
      console.error('削除に失敗:', err);
      alert('削除できませんでした');
    }
  };

  const deleteExpense = async (expenseId) => {
    if (!window.confirm('この支払いを削除しますか？')) return;
    try {
      await deleteDoc(doc(db, 'groups', groupId, 'expenses', expenseId));
      fetchExpenses();
    } catch (error) {
      console.error('支払い削除失敗:', error);
      alert('削除できませんでした');
    }
  };

  return (
    <div className="group-detail-container">
      <h2>グループ詳細</h2>

      {currentUser && (
        <div style={{ fontSize: '0.9rem', color: '#555', marginBottom: '1rem' }}>
          あなたのUID：<code style={{ userSelect: 'all' }}>{currentUser.uid}</code>
          {nameMap[currentUser.uid] && `（${nameMap[currentUser.uid]}）`}
          <button
            onClick={() => {
              navigator.clipboard.writeText(currentUser.uid);
              alert('UIDをコピーしました');
            }}
            style={{
              marginLeft: '8px',
              padding: '0.2rem 0.5rem',
              fontSize: '0.8rem',
              backgroundColor: '#eee',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            コピー
          </button>
        </div>
      )}

      <div className="detail-section">
        <h3>支払い履歴</h3>
        <div className="expense-list">
          {expenses.map((expense) => (
            <div key={expense.id} className="expense-card">
              {expense.description} - ¥{expense.amount}（{nameMap[expense.payer] || expense.payer} が支払った）
              <button
                style={{
                  marginLeft: '10px',
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.8rem',
                  backgroundColor: '#ffefef',
                  border: '1px solid #dd6666',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => deleteExpense(expense.id)}
              >
                削除
              </button>
            </div>
          ))}
        </div>

        <div className="group-detail-actions">
          <button className="action-button" onClick={() => navigate(`/groups/${groupId}/new-expense`)}>
            支払いを追加する
          </button>

          <button className="action-button" onClick={() => navigate(`/groups/${groupId}/settlement`)}>
            清算状況を見る
          </button>
        </div>
      </div>

      <div className="detail-section">
        <h3>メンバー一覧</h3>
        <ul>
          {members.map((m) => (
            <li key={m.uid}>
              {m.name || m.uid}
              {m.uid !== currentUser?.uid && (
                <button
                  style={{
                    marginLeft: '10px',
                    padding: '0.2rem 0.6rem',
                    fontSize: '0.8rem',
                    backgroundColor: '#ffdddd',
                    border: '1px solid #ff8888',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={() => deleteMember(m.uid)}
                >
                  削除
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="detail-section">
        <h3>メンバーを追加</h3>
        <form className="member-form" onSubmit={handleAddMember}>
          <input
            type="text"
            placeholder="ユーザーUID"
            value={newMemberUid}
            onChange={(e) => setNewMemberUid(e.target.value)}
          />
          <input
            type="text"
            placeholder="名前（任意）"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
          />
          <button type="submit">追加</button>
        </form>
      </div>

      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate('/groups')}>
          ← グループ一覧へ戻る
        </button>
      </div>
    </div>
  );
}

export default GroupDetailPage;
