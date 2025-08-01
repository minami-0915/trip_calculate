import './GroupDetailPage_UI.css';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useEffect, useState } from 'react';


function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const ref = query(
      collection(db, `groups/${id}/expenses`),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => doc.data()));
    });
    return unsubscribe;
  }, [id]);

return (
  <div className="group-detail-container">
    <h2>グループ履歴</h2>

    <div className="expense-list">
      {expenses.length === 0 ? (
        <p>まだ支払い記録がありません。</p>
      ) : (
        expenses.map((e, i) => (
          <div key={i} className="expense-card">
            <strong>{e.payer}</strong> が「{e.description}」{e.amount.toLocaleString()}円を支払い<br />
            対象：{e.participants.length}人
          </div>
        ))
      )}
    </div>

    <div className="group-detail-actions">
      <Link to={`/groups/${id}/new-expense`} className="action-button">＋ 支払いを追加</Link>
      <Link to={`/groups/${id}/settlement`} className="action-button">清算状況を見る</Link>
    </div>

    {/* ✅ ← 一番下に追加！ */}
    <div className="back-button-container">
      <button
        type="button"
        onClick={() => navigate('/groups')}
        className="back-button"
      >
        ← グループ一覧に戻る
      </button>
    </div>
  </div>
);

}

export default GroupDetailPage;
