import './NewExpensePage_UI.css';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc
} from 'firebase/firestore';


function NewExpensePage() {
  const { id } = useParams(); // groupId
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [participantsText, setParticipantsText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const participants = participantsText
      .split(',')
      .map((uid) => uid.trim())
      .filter(Boolean);

    if (!amount || !description || participants.length === 0) {
      alert('全ての項目を入力してください');
      return;
    }

    try {
      const ref = collection(db, `groups/${id}/expenses`);
      await addDoc(ref, {
        payer: auth.currentUser.displayName || '不明なユーザー',
        amount: parseInt(amount),
        description,
        participants,
        createdAt: serverTimestamp()
      });
      navigate(`/groups/${id}`);
    } catch (err) {
      console.error('支払い追加エラー:', err);
      alert('登録に失敗しました');
    }
  };

  return (
    <div className="expense-form-container">
      <h2>支払いの追加</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="金額（円）"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        /><br />
        <input
          type="text"
          placeholder="費目（例：ホテル代）"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        /><br />
        <input
          type="text"
          placeholder="参加者UID（カンマ区切り）"
          value={participantsText}
          onChange={(e) => setParticipantsText(e.target.value)}
        /><br />
        <button type="submit">支払いを登録</button>
      </form>

            <button
        type="button"
        onClick={() => navigate(`/groups/${id}`)}
        style={{
          marginBottom: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#ccc',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        ← グループ詳細に戻る
      </button>

    </div>
  );
}

export default NewExpensePage;
