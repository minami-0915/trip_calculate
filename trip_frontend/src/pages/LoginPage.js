import './LoginPage_UI.css'; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isNewUser) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/groups');
    } catch (error) {
      console.error('ログイン/登録に失敗しました:', error.message);
      alert(error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) navigate('/groups');
    });
    return unsubscribe;
  }, [navigate]);


  return (
    <div className="login-container">
      <h2>ともたび</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br />
        <button type="submit">{isNewUser ? '新規登録' : 'ログイン'}</button>
      </form>
      <p onClick={() => setIsNewUser(!isNewUser)}>
        {isNewUser ? 'ログインはこちら' : 'アカウントを作成'}
      </p>
    </div>
);

}

export default LoginPage;
