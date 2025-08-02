// App.js
// App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import GroupListPage from './pages/GroupListPage';
import GroupDetailPage from './pages/GroupDetailPage';
import NewExpensePage from './pages/NewExpensePage';
import SettlementPage from './pages/SettlementPage';
import HomePage from './pages/HomePage';
import MyPage from './pages/MyPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* レイアウト付きページはここにまとめる */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/groups" element={<GroupListPage />} />
          <Route path="/groups/:id" element={<GroupDetailPage />} />
          <Route path="/groups/:id/new-expense" element={<NewExpensePage />} />
          <Route path="/groups/:id/settlement" element={<SettlementPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
