import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";

import { supabase } from "../lib/supabase";

function SetPassword({ onCompleted }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (password.length < 8) {
      setErrorMessage(
        "Le mot de passe doit contenir au moins 8 caractères.",
      );
      return;
    }

    if (password !== confirmation) {
      setErrorMessage(
        "Les deux mots de passe ne correspondent pas.",
      );
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setSubmitting(false);

    if (error) {
      console.error(error);
      setErrorMessage(
        "Impossible d’enregistrer le mot de passe. Le lien est peut-être expiré.",
      );
      return;
    }

    setSuccess(true);

    window.setTimeout(() => {
      onCompleted?.();
    }, 1200);
  };

  return (
    <main className="set-password-page">
      <motion.section
        className="set-password-card"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
      >
        <span className="section-heading__eyebrow">
          Première connexion
        </span>

        <h1>Choisis ton mot de passe</h1>

        <p>
          Crée ton mot de passe personnel pour accéder à
          l’espace privé des Co’Pintes.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="login-field">
            <span>Nouveau mot de passe</span>

            <div className="login-field__control">
              <LockKeyhole size={19} />

              <input
                type={passwordVisible ? "text" : "password"}
                value={password}
                autoComplete="new-password"
                placeholder="8 caractères minimum"
                disabled={submitting}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setErrorMessage("");
                }}
              />

              <button
                type="button"
                className="login-field__visibility"
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

          <label className="login-field">
            <span>Confirmer le mot de passe</span>

            <div className="login-field__control">
              <LockKeyhole size={19} />

              <input
                type={passwordVisible ? "text" : "password"}
                value={confirmation}
                autoComplete="new-password"
                placeholder="Confirme ton mot de passe"
                disabled={submitting}
                onChange={(event) => {
                  setConfirmation(event.target.value);
                  setErrorMessage("");
                }}
              />
            </div>
          </label>

          {errorMessage && (
            <div className="login-form__error">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            className="login-form__submit"
            disabled={submitting || success}
          >
            {submitting && (
              <LoaderCircle
                className="login-form__spinner"
                size={19}
              />
            )}

            {success && <CheckCircle2 size={19} />}

            {!submitting && !success && (
              <LockKeyhole size={19} />
            )}

            {submitting
              ? "Enregistrement…"
              : success
                ? "Mot de passe enregistré"
                : "Créer mon mot de passe"}
          </button>
        </form>
      </motion.section>
    </main>
  );
}

export default SetPassword;