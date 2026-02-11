import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";

export async function followUser(myUid, targetUid) {
  await updateDoc(doc(db, "users", myUid), {
    following: arrayUnion(targetUid),
  });

  await updateDoc(doc(db, "users", targetUid), {
    followers: arrayUnion(myUid),
  });
}

export async function unfollowUser(myUid, targetUid) {
  await updateDoc(doc(db, "users", myUid), {
    following: arrayRemove(targetUid),
  });

  await updateDoc(doc(db, "users", targetUid), {
    followers: arrayRemove(myUid),
  });
}
