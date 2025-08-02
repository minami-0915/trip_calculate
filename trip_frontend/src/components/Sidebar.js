// src/components/Sidebar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <h3>メニュー</h3>
      <ul>
        <li onClick={() => navigate('/home')}>ホーム</li>
        <li onClick={() => navigate('/mypage')}>マイページ</li>
        <li onClick={() => navigate('/groups')}>グループ一覧</li>
        <li onClick={() => navigate('/settings')}>設定</li>
      </ul>
    </div>
  );
}

export default Sidebar;
