// App.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import GroupListPage from './pages/GroupListPage';
import GroupDetailPage from './pages/GroupDetailPage';
import NewExpensePage from './pages/NewExpensePage';
import SettlementPage from './pages/SettlementPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/groups" element={<GroupListPage />} />
        <Route path="/groups/:id" element={<GroupDetailPage />} />
        <Route path="/groups/:id/new-expense" element={<NewExpensePage />} />
        <Route path="/groups/:id/settlement" element={<SettlementPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
