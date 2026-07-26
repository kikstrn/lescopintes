import { motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import Login from "../pages/Login";
import { useEffect, useState } from "react";
import SetPassword from "../pages/SetPassword";

function ApplicationLoader() {
  return (
    <main className="auth-loading-screen">
      <motion.div
        className="auth-loading-screen__content"
        initial={{
          opacity: 0,
          scale: 0.96,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
      >
        <div className="auth-loading-screen__logo">
          CP
        </div>

        <LoaderCircle
          className="auth-loading-screen__spinner"
          size={28}
        />

        <strong>Les Co’Pintes</strong>
        <span>Chargement de ton espace…</span>
      </motion.div>
    </main>
  );
}

function ProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useAuth();
  const [passwordSetupRequired, setPasswordSetupRequired] =
    useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));

    const type =
      params.get("type") ??
      new URLSearchParams(window.location.search).get("type");

    if (
      type === "invite" ||
      type === "recovery"
    ) {
      setPasswordSetupRequired(true);
    }
  }, []);

  if (loading) {
    return <ApplicationLoader />;
  }

  if (passwordSetupRequired && isAuthenticated) {
    return (
      <SetPassword
        onCompleted={() => {
          setPasswordSetupRequired(false);

          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        }}
      />
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return children;
}

export default ProtectedRoute;