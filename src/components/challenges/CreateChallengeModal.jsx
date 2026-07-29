import { useState } from "react";

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
];

function CreateChallengeModal({
  open,
  onClose,
  onCreate,
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    challenge_type: "bike_distance",
    target_value: 100,
    reward: "",
    start_date: "",
    end_date: "",
  });

  if (!open) return null;

  function update(name, value) {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function submit(event) {
    event.preventDefault();

    await onCreate({
      ...form,
      season: new Date().getFullYear(),
      status: "active",
    });

    onClose();
  }

  return (
    <div className="modal-overlay">

      <div className="challenge-modal glass-panel">

        <h2>
          Nouveau défi
        </h2>

        <form onSubmit={submit}>

          <input
            placeholder="Titre"
            value={form.title}
            onChange={(event) =>
              update(
                "title",
                event.target.value,
              )
            }
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(event) =>
              update(
                "description",
                event.target.value,
              )
            }
          />

          <select
            value={form.challenge_type}
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

          <input
            type="number"
            placeholder="Objectif"
            value={form.target_value}
            onChange={(event) =>
              update(
                "target_value",
                Number(
                  event.target.value,
                ),
              )
            }
          />

          <input
            placeholder="Récompense"
            value={form.reward}
            onChange={(event) =>
              update(
                "reward",
                event.target.value,
              )
            }
          />

          <input
            type="date"
            value={form.start_date}
            onChange={(event) =>
              update(
                "start_date",
                event.target.value,
              )
            }
          />

          <input
            type="date"
            value={form.end_date}
            onChange={(event) =>
              update(
                "end_date",
                event.target.value,
              )
            }
          />

          <div className="challenge-modal__actions">

            <button
              type="button"
              onClick={onClose}
            >
              Annuler
            </button>

            <button
              className="primary-button"
              type="submit"
            >
              Créer le défi
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default CreateChallengeModal;