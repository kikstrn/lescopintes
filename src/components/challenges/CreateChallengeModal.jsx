import {
  useEffect,
  useState,
} from "react";

const challengeTypes = [
  {
    value: "bike_distance",
    label: "Distance vélo (km)",
  },
  {
    value: "bike_rides",
    label: "Nombre de sorties vélo",
  },
  {
    value: "tennis_matches",
    label: "Matchs joués",
  },
  {
    value: "tennis_wins",
    label: "Victoires tennis",
  },
  {
    value: "events",
    label: "Participations événements",
  },
  {
    value: "gallery_uploads",
    label: "Photos ajoutées",
  },
  {
    value: "tribunal_votes",
    label: "Votes Tribunal",
  },
  {
    value: "gages_completed",
    label: "Gages réalisés",
  },
  {
    value: "points",
    label: "Points gagnés",
  },
  {
    value: "other",
    label: "Autre",
  },
  {
    value: "bar",
    label: "Bar",
  },
];

const initialForm = {
  title: "",
  description: "",
  challenge_type: "bike_distance",
  target_value: 100,
  reward: "",
  start_date: "",
  end_date: "",
};

function CreateChallengeModal({
  open,
  onClose,
  onCreate,
  currentProfileId = null,
}) {
  const [form, setForm] =
    useState(initialForm);

  const [saving, setSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    document.body.classList.add(
      "modal-is-open",
    );

    setErrorMessage("");

    return () => {
      document.body.classList.remove(
        "modal-is-open",
      );
    };
  }, [open]);

  if (!open) {
    return null;
  }

  function update(name, value) {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrorMessage("");
  }

  function handleClose() {
    if (saving) {
      return;
    }

    onClose?.();
  }

  async function submit(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!currentProfileId) {
      setErrorMessage(
        "Utilisateur connecté introuvable.",
      );

      return;
    }

    if (!form.title.trim()) {
      setErrorMessage(
        "Le titre du défi est obligatoire.",
      );

      return;
    }

    if (!form.start_date) {
      setErrorMessage(
        "La date de début est obligatoire.",
      );

      return;
    }

    if (!form.end_date) {
      setErrorMessage(
        "La date de fin est obligatoire.",
      );

      return;
    }

    if (
      new Date(form.end_date) <
      new Date(form.start_date)
    ) {
      setErrorMessage(
        "La date de fin doit être postérieure à la date de début.",
      );

      return;
    }

    const targetValue =
      Number(form.target_value);

    if (
      !Number.isFinite(targetValue) ||
      targetValue < 0
    ) {
      setErrorMessage(
        "L’objectif doit être un nombre valide.",
      );

      return;
    }

    const payload = {
      title:
        form.title.trim(),

      description:
        form.description.trim() ||
        null,

      challenge_type:
        form.challenge_type,

      category:
        form.challenge_type,

      target_value:
        targetValue,

      reward:
        form.reward.trim() ||
        null,

      start_date:
        form.start_date,

      end_date:
        form.end_date,

      season:
        new Date(
          `${form.start_date}T12:00:00`,
        ).getFullYear(),

      status:
        "active",

      created_by:
        currentProfileId,
    };

    try {
      setSaving(true);

      console.log(
        "Défi envoyé :",
        payload,
      );

      await onCreate?.(payload);

      setForm(initialForm);
      onClose?.();
    } catch (error) {
      console.error(
        "Impossible de créer le défi :",
        error,
      );

      setErrorMessage(
        error?.message ??
          "Impossible de créer le défi.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="challenge-modal glass-panel">
        <h2>Nouveau défi</h2>

        <form onSubmit={submit}>
          <div className="form-field">
            <label htmlFor="challenge-title">
              Titre du défi
            </label>

            <input
              id="challenge-title"
              type="text"
              placeholder="Ex. 100 km cette semaine"
              value={form.title}
              disabled={saving}
              onChange={(event) =>
                update(
                  "title",
                  event.target.value,
                )
              }
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="challenge-description">
              Description
            </label>

            <textarea
              id="challenge-description"
              placeholder="Décris le défi et ses règles…"
              value={form.description}
              disabled={saving}
              onChange={(event) =>
                update(
                  "description",
                  event.target.value,
                )
              }
            />
          </div>

          <div className="form-field">
            <label htmlFor="challenge-category">
              Catégorie
            </label>

            <select
              id="challenge-category"
              value={
                form.challenge_type
              }
              disabled={saving}
              onChange={(event) =>
                update(
                  "challenge_type",
                  event.target.value,
                )
              }
            >
              {challengeTypes.map(
                (type) => (
                  <option
                    key={type.value}
                    value={type.value}
                  >
                    {type.label}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="challenge-target">
              Objectif à atteindre
            </label>

            <input
              id="challenge-target"
              type="number"
              min="0"
              step="0.1"
              placeholder="Objectif"
              value={
                form.target_value
              }
              disabled={saving}
              onChange={(event) =>
                update(
                  "target_value",
                  event.target.value,
                )
              }
            />
          </div>

          <div className="form-field">
            <label htmlFor="challenge-reward">
              Récompense
            </label>

            <input
              id="challenge-reward"
              type="text"
              placeholder="Récompense"
              value={form.reward}
              disabled={saving}
              onChange={(event) =>
                update(
                  "reward",
                  event.target.value,
                )
              }
            />
          </div>

          <div className="form-field">
            <label htmlFor="challenge-start-date">
              Date de début
            </label>

            <input
              id="challenge-start-date"
              type="date"
              value={
                form.start_date
              }
              disabled={saving}
              onChange={(event) =>
                update(
                  "start_date",
                  event.target.value,
                )
              }
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="challenge-end-date">
              Date de fin
            </label>

            <input
              id="challenge-end-date"
              type="date"
              value={
                form.end_date
              }
              min={
                form.start_date ||
                undefined
              }
              disabled={saving}
              onChange={(event) =>
                update(
                  "end_date",
                  event.target.value,
                )
              }
              required
            />
          </div>

          {errorMessage && (
            <p
              className="form-error"
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          <div className="challenge-modal__actions">
            <button
              type="button"
              className="secondary-button"
              disabled={saving}
              onClick={handleClose}
            >
              Annuler
            </button>

            <button
              className="primary-button"
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Création…"
                : "Créer le défi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateChallengeModal;