
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

export default function OwnerRoute({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || !user.emailVerified) {
        if (active) setStatus("unauthenticated");
        return;
      }

      try {
        const snapshot = await getDoc(doc(db, "usuarios", user.uid));

        if (!active) return;

        const data = snapshot.data();

        const isOwner =
          snapshot.exists() &&
          data.uid === user.uid &&
          data.email === user.email;

        setStatus(isOwner ? "authorized" : "forbidden");
      } catch (error) {
        console.error("Erro ao verificar proprietário:", error);
        if (active) setStatus("forbidden");
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  if (status === "loading") {
    return <p className="text-center p-4">Verificando acesso...</p>;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  if (status === "forbidden") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
