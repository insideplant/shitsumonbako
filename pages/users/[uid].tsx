import { FormEvent, useEffect, useState } from "react";
import { User } from "../../models/User";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { useAuthentication } from "../../hooks/authentication";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
} from 'firebase/firestore'

type Query = {
  uid: string;
};



export default function UserShow() {
  const [user, setUser] = useState<User>(null);
  const router = useRouter();
  const query = router.query as Query;
  const { user: currentUser } = useAuthentication();
  const [body, setBody] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
  
    const db = getFirestore()
  
    await addDoc(collection(db, 'questions'), {
      senderUid: currentUser.uid,
      receiverUid: user.uid,
      body,
      isReplied: false,
      createdAt: serverTimestamp(),
    })
  
    setBody('')
    alert('質問を送信しました。')
  }

  useEffect(() => {
    if (query.uid === undefined) {
      return;
    }
    async function loadUser() {
      const db = getFirestore();
      const ref = doc(collection(db, "users"), query.uid);
      const userDoc = await getDoc(ref);

      if (!userDoc.exists()) {
        return;
      }

      const gotUser = userDoc.data() as User;
      gotUser.uid = userDoc.id;
      setUser(gotUser);
    }
    loadUser();
  }, [query.uid]);

  return (
    <Layout>
      <div className="container">
        {user && (
          <div className="text-center">
            <h1 className="h4">{user.name}さんのページ</h1>
            <div className="m-5">{user.name}さんに質問しよう！</div>
            <div className="row justify-content-center mb-3">
              <div className="col-12 col-md-6">
                <form onSubmit={onSubmit}>
                  <textarea
                    className="form-control"
                    placeholder="おげんきですか？"
                    rows={6}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                  ></textarea>
                  <div className="m-3">
                    <button type="submit" className="btn btn-primary">
                      質問を送信する
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
