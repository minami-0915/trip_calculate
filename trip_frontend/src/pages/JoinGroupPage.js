import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion
} from 'firebase/firestore';

function JoinGroupPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('処理中...');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setStatus('ログインしてください');
        return;
      }

      try {
        // 🔽 グループ情報取得
        const groupRef = doc(db, 'groups', groupId);
        const groupSnap = await getDoc(groupRef);

        if (!groupSnap.exists()) {
          setStatus('グループが存在しません');
          return;
        }

        const groupData = groupSnap.data();

        // 🔍 すでにmembersに含まれている場合（重複参加防止）
        if (Array.isArray(groupData.members) && groupData.members.includes(user.uid)) {
          setStatus('すでにこのグループに参加しています。グループページへ移動します。');
          setTimeout(() => navigate(`/groups/${groupId}`), 2000);
          return;
        }

        // 🔽 Firestoreのmembers配列にユーザーを追加
        await updateDoc(groupRef, {
          members: arrayUnion(user.uid)
        });

        // 🔽 サブコレクションにもユーザー名登録
        const memberRef = doc(db, 'groups', groupId, 'members', user.uid);
        await setDoc(memberRef, { name: user.displayName || '' });

        // 🔽 オプション：joinedGroupsフィールドに追加（使わないならこのままでもOK）
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          joinedGroups: arrayUnion(groupId)
        }, { merge: true });

        setStatus('グループに参加しました！');
        setTimeout(() => navigate(`/groups/${groupId}`), 2000);
      } catch (error) {
        console.error(error);
        setStatus('参加に失敗しました');
      }
    });

    return () => unsubscribe();
  }, [groupId, navigate]);

  return <div>{status}</div>;
}

export default JoinGroupPage;
