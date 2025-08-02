import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import { auth } from '../firebase';

function Sidebar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('ログアウトに失敗しました:', error);
    }
  };

  return (
    <div className="sidebar">
      {user && (
        <div className="user-icon-container">
          <img
            src={user.photoURL || '/default-icon.png'}
            alt="ユーザーアイコン"
            className="user-icon"
          />
        </div>
      )}

      <h3>メニュー</h3>
      <ul>
        <li onClick={() => navigate('/home')}>ホーム</li>
        <li onClick={() => navigate('/mypage')}>マイページ</li>
        <li onClick={() => navigate('/groups')}>グループ一覧</li>
        <li onClick={() => navigate('/settings')}>設定</li>
        <li>
          <button className="logout-button" onClick={handleLogout}>
            ログアウト
          </button>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
