import './SettlementPage_UI.css';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';

function SettlementPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const ref = collection(db, `groups/${id}/expenses`);
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => doc.data()));
    });
    return unsubscribe;
  }, [id]);

  const settlements = useMemo(() => {
    const balanceMap = {};

    expenses.forEach(exp => {
      const share = exp.amount / exp.participants.length;
      exp.participants.forEach(p => {
        if (p === exp.payer) return;
        balanceMap[p] = (balanceMap[p] || 0) - share;
        balanceMap[exp.payer] = (balanceMap[exp.payer] || 0) + share;
      });
    });

    const fromTo = [];
    const credit = [], debit = [];

    for (const [uid, balance] of Object.entries(balanceMap)) {
      if (balance > 0) credit.push({ uid, amount: balance });
      if (balance < 0) debit.push({ uid, amount: -balance });
    }

    let i = 0, j = 0;
    while (i < debit.length && j < credit.length) {
      const d = debit[i];
      const c = credit[j];
      const min = Math.min(d.amount, c.amount);
      fromTo.push({ from: d.uid, to: c.uid, amount: min });

      d.amount -= min;
      c.amount -= min;
      if (d.amount === 0) i++;
      if (c.amount === 0) j++;
    }

    return fromTo;
  }, [expenses]);

  return (
    <div className="settlement-container">
      <h2>清算結果</h2>
      {settlements.length === 0 ? (
        <p>清算が必要な支払いがありません。</p>
      ) : (
        <ul className="settlement-list">
          {settlements.map((s, i) => (
            <li key={i}>
              <strong>{s.from}</strong> → <strong>{s.to}</strong>：¥{s.amount.toLocaleString()}
            </li>
          ))}
        </ul>
      )}

      <div className="back-button-container">
        <button
          type="button"
          onClick={() => navigate(`/groups/${id}`)}
          className="back-button"
        >
          ← グループ詳細に戻る
        </button>
      </div>
    </div>
  );
}

export default SettlementPage;
