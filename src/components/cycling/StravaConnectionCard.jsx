import {
  Bike,
  CheckCircle2,
  ExternalLink,
  Link2,
  RefreshCw,
  ShieldCheck,
  Unlink,
} from "lucide-react";

import useStravaConnection from "../../hooks/useStravaConnection";

function formatConnectedDate(
  value,
) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",
    },
  ).format(
    new Date(value),
  );
}

function StravaConnectionCard() {
  const strava =
    useStravaConnection();

  if (strava.loading) {
    return (
      <section className="strava-connection-card strava-connection-card--loading">
        <RefreshCw
          size={22}
          className="strava-connection-card__spinner"
        />

        <span>
          Vérification de la connexion Strava…
        </span>
      </section>
    );
  }

  return (
    <section
      className={[
        "strava-connection-card",
        strava.connected
          ? "strava-connection-card--connected"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="strava-connection-card__brand">
        <span className="strava-connection-card__brand-icon">
          <Bike size={25} />
        </span>

        <div>
          <span className="section-heading__eyebrow">
            Synchronisation
          </span>

          <h2>
            {strava.connected
              ? "Strava connecté"
              : "Connecter ton compte Strava"}
          </h2>
        </div>
      </div>

      {strava.connected ? (
        <>
          <div className="strava-connection-card__athlete">
            {strava.connection
              ?.athlete_profile_medium ? (
              <img
                src={
                  strava.connection
                    .athlete_profile_medium
                }
                alt=""
              />
            ) : (
              <span className="strava-connection-card__athlete-placeholder">
                <Bike size={20} />
              </span>
            )}

            <div>
              <strong>
                {[
                  strava.connection
                    ?.athlete_firstname,
                  strava.connection
                    ?.athlete_lastname,
                ]
                  .filter(Boolean)
                  .join(" ") ||
                  "Athlète Strava"}
              </strong>

              <span>
                Identifiant Strava :{" "}
                {
                  strava.connection
                    ?.strava_athlete_id
                }
              </span>

              <small>
                Connecté le{" "}
                {formatConnectedDate(
                  strava.connection
                    ?.connected_at,
                )}
              </small>
            </div>

            <CheckCircle2
              size={22}
              className="strava-connection-card__connected-icon"
            />
          </div>

          <div className="strava-connection-card__scope">
            <ShieldCheck
              size={18}
            />

            <div>
              <strong>
                Accès accordé
              </strong>

              <span>
                Lecture du profil et des activités sportives autorisées.
              </span>
            </div>
          </div>

          <div className="strava-connection-card__actions">
            <a
              href="https://www.strava.com/dashboard"
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink
                size={16}
              />
              Ouvrir Strava
            </a>

            <button
              type="button"
              className="strava-connection-card__disconnect"
              disabled={
                strava.disconnecting
              }
              onClick={
                strava.disconnect
              }
            >
              <Unlink size={16} />

              {strava.disconnecting
                ? "Déconnexion…"
                : "Déconnecter"}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="strava-connection-card__description">
            Lie ton compte pour importer prochainement tes sorties vélo, tes kilomètres, ton dénivelé et tes statistiques personnelles.
          </p>

          <div className="strava-connection-card__privacy">
            <ShieldCheck
              size={19}
            />

            <div>
              <strong>
                Connexion sécurisée
              </strong>

              <span>
                Ton mot de passe Strava n’est jamais transmis à Les Co’Pintes. Les jetons restent uniquement côté Supabase.
              </span>
            </div>
          </div>

          <button
            type="button"
            className="strava-connection-card__connect"
            disabled={
              strava.connecting
            }
            onClick={
              strava.connect
            }
          >
            <Link2 size={18} />

            {strava.connecting
              ? "Redirection vers Strava…"
              : "Connecter avec Strava"}
          </button>
        </>
      )}

      {strava.notice && (
        <p className="strava-connection-card__notice">
          <CheckCircle2
            size={16}
          />
          {strava.notice}
        </p>
      )}

      {strava.error && (
        <p className="strava-connection-card__error">
          {strava.error}
        </p>
      )}
    </section>
  );
}

export default StravaConnectionCard;
