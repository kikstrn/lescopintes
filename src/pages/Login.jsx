import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function getAuthenticationErrorMessage(error) {
  const message = error?.message?.toLowerCase() ?? "";

  if (
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials")
  ) {
    return "L’adresse e-mail ou le mot de passe est incorrect.";
  }

  if (message.includes("email not confirmed")) {
    return "Cette adresse e-mail n’a pas encore été confirmée.";
  }

  if (message.includes("too many requests")) {
    return "Trop de tentatives. Patiente quelques instants avant de recommencer.";
  }

  return "La connexion a échoué. Vérifie tes informations puis réessaie.";
}

function Login() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage(
        "Renseigne ton adresse e-mail et ton mot de passe.",
      );
      return;
    }

    setSubmitting(true);

    try {
      await login(email, password);
    } catch (error) {
      console.error("Erreur de connexion :", error);
      setErrorMessage(getAuthenticationErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-page__grid" />
      <div className="login-page__orb login-page__orb--one" />
      <div className="login-page__orb login-page__orb--two" />

      <section className="login-page__layout">
        <motion.div
          className="login-page__presentation"
          initial={{
            opacity: 0,
            x: -30,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="login-page__brand">
            <span className="login-page__brand-logo">
              CP
            </span>

            <div>
              <strong>Les Co’Pintes</strong>
              <small>Jeu, set et tournée !</small>
            </div>
          </div>

          <div className="login-page__presentation-content">
            <span className="login-page__season">
              <Sparkles size={15} />
              Saison 2026
            </span>

            <h1>
              Le terrain privé
              <span>des Co’Pintes.</span>
            </h1>

            <p>
              Retrouve les matchs, les sorties vélo, les
              classements et les meilleurs souvenirs de toute
              la bande.
            </p>

            <div className="login-page__features">
              <div>
                <ShieldCheck size={19} />

                <span>
                  <strong>Espace privé</strong>
                  <small>Réservé aux membres du groupe</small>
                </span>
              </div>

              <div>
                <LockKeyhole size={19} />

                <span>
                  <strong>Connexion sécurisée</strong>
                  <small>Propulsée par Supabase Auth</small>
                </span>
              </div>
            </div>
          </div>

          <div className="login-page__visual">
            <img
              src="/images/equipe-copintes.png"
              alt="Les membres des Co’Pintes"
            />

            <div className="login-page__visual-caption">
              <strong>5 membres</strong>
              <span>Une seule équipe</span>
            </div>
          </div>
        </motion.div>

        <motion.section
          className="login-card"
          initial={{
            opacity: 0,
            y: 24,
            scale: 0.98,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            delay: 0.12,
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <header className="login-card__header">
            <span className="section-heading__eyebrow">
              Accès membre
            </span>

            <h2>Bon retour parmi nous 👋</h2>

            <p>
              Connecte-toi avec les identifiants créés pour ton
              compte.
            </p>
          </header>

          <form
            className="login-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <label className="login-field">
              <span>Adresse e-mail</span>

              <div
                className={`login-field__control ${
                  errorMessage
                    ? "login-field__control--error"
                    : ""
                }`}
              >
                <Mail size={19} />

                <input
                  type="email"
                  value={email}
                  placeholder="kiks@copintes.fr"
                  autoComplete="email"
                  disabled={submitting}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setErrorMessage("");
                  }}
                />
              </div>
            </label>

            <label className="login-field">
              <span>Mot de passe</span>

              <div
                className={`login-field__control ${
                  errorMessage
                    ? "login-field__control--error"
                    : ""
                }`}
              >
                <LockKeyhole size={19} />

                <input
                  type={passwordVisible ? "text" : "password"}
                  value={password}
                  placeholder="Ton mot de passe"
                  autoComplete="current-password"
                  disabled={submitting}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setErrorMessage("");
                  }}
                />

                <button
                  type="button"
                  className="login-field__visibility"
                  aria-label={
                    passwordVisible
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                  onClick={() => {
                    setPasswordVisible((current) => !current);
                  }}
                >
                  {passwordVisible ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </label>

            {errorMessage && (
              <motion.div
                className="login-form__error"
                initial={{
                  opacity: 0,
                  y: -5,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                role="alert"
              >
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            <motion.button
              type="submit"
              className="login-form__submit"
              whileTap={{
                scale: 0.98,
              }}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <LoaderCircle
                    className="login-form__spinner"
                    size={19}
                  />
                  Connexion…
                </>
              ) : (
                <>
                  <LogIn size={19} />
                  Se connecter
                </>
              )}
            </motion.button>
          </form>

          <footer className="login-card__footer">
            <ShieldCheck size={16} />

            <p>
              Aucun compte ne peut être créé depuis cette page.
              Les membres sont ajoutés par l’administrateur.
            </p>
          </footer>
        </motion.section>
      </section>
    </main>
  );
}

export default Login;