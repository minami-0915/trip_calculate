// src/pages/SettingsPage.js

import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import './SettingsPage.css'; // ← 忘れずに追加！

function SettingsPage() {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      setDisplayName(currentUser.displayName || '');
      setPhotoURL(currentUser.photoURL || '');
    }
  }, []);

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      // Firebase Auth 更新
      await updateProfile(user, {
        displayName,
        photoURL,
      });

      // Firestore にも保存（任意）
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { displayName, photoURL });

      alert('プロフィールを更新しました');
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
      alert('プロフィールの更新に失敗しました');
    }
  };

  return (
    <div className="settings-container">
        <div className="page-title">
           <h2>設定</h2>
        </div>

      <div>
        <label>表示名：</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>

      <div>
        <label>アイコンURL：</label>
        <input
          type="text"
          value={photoURL}
          onChange={(e) => setPhotoURL(e.target.value)}
        />
      </div>

      <button onClick={handleUpdateProfile}>プロフィールを更新</button>

      <div className="settings-profile">
        <div className="profile-box"> {/* ← このdivを追加 */}
            <h3>現在のプロフィール</h3>
            <p>名前：{user?.displayName}</p>
            <img
            src={user?.photoURL || '/default-icon.png'}
            alt="アイコン"
            />
        </div>
    </div>

    </div>
  );
}

export default SettingsPage;
