import {
  CheckCircle2,
  Clock3,
  FileUp,
  Gauge,
  Mountain,
  Route,
  Upload,
  X,
} from "lucide-react";

import {
  useRef,
  useState,
} from "react";

import {
  parseGpxFile,
} from "../../utils/gpxParser";

import {
  importGpxRide,
} from "../../services/gpxImportService";

import GPXRouteMap from "./GPXRouteMap";

function formatDuration(
  seconds,
) {
  if (!seconds) {
    return "Non disponible";
  }

  const minutes =
    Math.round(
      seconds / 60,
    );

  const hours =
    Math.floor(
      minutes / 60,
    );

  const remaining =
    minutes % 60;

  return hours > 0
    ? `${hours} h ${String(
        remaining,
      ).padStart(2, "0")}`
    : `${remaining} min`;
}

function GPXImportCard({
  profileId,
}) {
  const inputRef =
    useRef(null);

  const [
    activity,
    setActivity,
  ] = useState(null);

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    analyzing,
    setAnalyzing,
  ] = useState(false);

  const [
    importing,
    setImporting,
  ] = useState(false);

  const [
    notice,
    setNotice,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState(null);

  const reset =
    () => {
      setActivity(null);
      setTitle("");
      setDescription("");
      setError(null);

      if (
        inputRef.current
      ) {
        inputRef.current.value =
          "";
      }
    };

  const handleFile =
    async (file) => {
      if (!file) {
        return;
      }

      setAnalyzing(true);
      setError(null);
      setNotice(null);

      try {
        const parsed =
          await parseGpxFile(
            file,
          );

        setActivity(
          parsed,
        );

        setTitle(
          parsed.title,
        );

        setDescription(
          parsed.description ??
            "",
        );
      } catch (
        requestError
      ) {
        setError(
          requestError?.message ??
            "Impossible d’analyser ce fichier GPX.",
        );
      } finally {
        setAnalyzing(false);
      }
    };

  const handleImport =
    async () => {
      if (!activity) {
        return;
      }

      setImporting(true);
      setError(null);
      setNotice(null);

      try {
        await importGpxRide({
          profileId,
          activity,
          title,
          description,
        });

        setNotice(
          "La sortie a été importée avec succès.",
        );

        reset();

        /*
         * Recharge les données gérées par AppDataContext
         * sans ajouter une nouvelle dépendance au composant.
         */
        window.setTimeout(
          () =>
            window.location.reload(),
          700,
        );
      } catch (
        requestError
      ) {
        setError(
          requestError?.message ??
            "Impossible d’importer cette sortie.",
        );
      } finally {
        setImporting(false);
      }
    };

  return (
    <section className="gpx-import">
      <header className="gpx-import__header">
        <span className="gpx-import__logo">
          <FileUp size={24} />
        </span>

        <div>
          <span className="section-heading__eyebrow">
            Import gratuit
          </span>

          <h2>
            Ajouter une activité GPX
          </h2>

          <p>
            Compatible avec les exports Strava, Garmin, Wahoo, Komoot, Polar et la plupart des compteurs GPS.
          </p>
        </div>
      </header>

      {!activity ? (
        <button
          type="button"
          className="gpx-import__dropzone"
          disabled={
            analyzing
          }
          onClick={() =>
            inputRef.current
              ?.click()
          }
          onDragOver={(
            event,
          ) =>
            event.preventDefault()
          }
          onDrop={(
            event,
          ) => {
            event.preventDefault();

            handleFile(
              event.dataTransfer
                .files?.[0],
            );
          }}
        >
          <Upload size={27} />

          <strong>
            {analyzing
              ? "Analyse du parcours…"
              : "Choisir ou déposer un fichier GPX"}
          </strong>

          <span>
            Taille maximale : 15 Mo
          </span>
        </button>
      ) : (
        <div className="gpx-import__preview">
          <button
            type="button"
            className="gpx-import__close"
            aria-label="Retirer le fichier"
            onClick={
              reset
            }
          >
            <X size={18} />
          </button>

          <div className="gpx-import__fields">
            <label>
              <span>
                Nom de l’activité
              </span>

              <input
                value={title}
                maxLength={120}
                onChange={(
                  event,
                ) =>
                  setTitle(
                    event.target
                      .value,
                  )
                }
              />
            </label>

            <label>
              <span>
                Description
              </span>

              <textarea
                value={
                  description
                }
                rows={3}
                maxLength={800}
                onChange={(
                  event,
                ) =>
                  setDescription(
                    event.target
                      .value,
                  )
                }
              />
            </label>
          </div>

          <div className="gpx-import__metrics">
            <article>
              <Route size={18} />
              <small>
                Distance
              </small>
              <strong>
                {activity.distanceKm.toFixed(
                  1,
                )}{" "}
                km
              </strong>
            </article>

            <article>
              <Clock3 size={18} />
              <small>
                Temps de parcours
              </small>
              <strong>
                {formatDuration(
                  activity.durationSeconds,
                )}
              </strong>
            </article>

            <article>
              <Mountain
                size={18}
              />
              <small>
                Ascension totale
              </small>
              <strong>
                {
                  activity.elevationGainM
                }{" "}
                m
              </strong>
            </article>

            <article>
              <Gauge size={18} />
              <small>
                Vitesse moyenne
              </small>
              <strong>
                {activity.averageSpeedKmh
                  ? `${activity.averageSpeedKmh.toFixed(
                      1,
                    )} km/h`
                  : "—"}
              </strong>
            </article>
          </div>

          <div className="gpx-import__route-section">
            <div className="gpx-import__route-heading">
              <div>
                <span className="section-heading__eyebrow">
                  Parcours
                </span>

                <h3>
                  Aperçu du tracé
                </h3>
              </div>

              <small>
                {activity.pointCount.toLocaleString(
                  "fr-FR",
                )}{" "}
                points GPS analysés
              </small>
            </div>

            <GPXRouteMap
              routeData={
                activity.routeData
              }
              startPoint={
                activity.startPoint
              }
              endPoint={
                activity.endPoint
              }
            />
          </div>

          <div className="gpx-import__file">
            <span>
              {activity.fileName}
            </span>

            <small>
              {activity.pointCount.toLocaleString(
                "fr-FR",
              )}{" "}
              points GPS
            </small>
          </div>

          <button
            type="button"
            className="gpx-import__submit"
            disabled={
              importing ||
              !title.trim()
            }
            onClick={
              handleImport
            }
          >
            <CheckCircle2
              size={18}
            />

            {importing
              ? "Import en cours…"
              : "Enregistrer l’activité"}
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".gpx,application/gpx+xml"
        hidden
        onChange={(
          event,
        ) =>
          handleFile(
            event.target
              .files?.[0],
          )
        }
      />

      {notice && (
        <p className="gpx-import__notice">
          <CheckCircle2
            size={16}
          />
          {notice}
        </p>
      )}

      {error && (
        <p className="gpx-import__error">
          {error}
        </p>
      )}
    </section>
  );
}

export default GPXImportCard;
