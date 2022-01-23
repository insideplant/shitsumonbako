import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { User } from "../models/User";
import { atom, useRecoilState } from "recoil";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { useEffect } from "react";

const userState = atom<User>({
  key: "user",
  default: null,
});


export function useAuthentication() {
  const [user, setUser] = useRecoilState(userState);

  async function createUserIfNotFound(user: User) {
    const db = getFirestore();
    const usersCollection = collection(db, "users");
    const userRef = doc(usersCollection, user.uid);
    const document = await getDoc(userRef);
    if (document.exists()) {
      // 書き込みの方が高いので！
      return;
    }
  
    await setDoc(userRef, {
      name: "taro" + new Date().getTime(),
    });
  }
  

  useEffect(() => {
    if (user !== null) {
      return;
    }

    const auth = getAuth();

    console.log("Start useEffect");

    signInAnonymously(auth).catch(function (error) {
      let errorCode = error.errorCode;
      let errorMessage = error.message;
    });

    onAuthStateChanged(auth, function (firebaseUser) {
      if (firebaseUser) {
        const loginUser: User = {
          uid: firebaseUser.uid,
          isAnonymous: firebaseUser.isAnonymous,
          name: ''
        };
        setUser(loginUser);
        createUserIfNotFound(loginUser);
      } else {
        setUser(null);
      }
    });
  }, []);

  return { user };
}
