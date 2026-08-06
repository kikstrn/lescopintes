import {
  useMemo,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  Dumbbell,
  Minus,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

function emptySet() {
  return {
    weightKg: "",
    repetitions: "",
    completed: true,
  };
}

function WorkoutSessionModal({
  open,
  exercises,
  saving,
  onClose,
  onSave,
}) {
  const [title, setTitle] =
    useState("Séance musculation");

  const [startedAt, setStartedAt] =
    useState(() => {
      const date = new Date();
      date.setMinutes(
        date.getMinutes() -
        date.getTimezoneOffset(),
      );

      return date
        .toISOString()
        .slice(0, 16);
    });

  const [durationHours, setDurationHours] =
    useState(1);

  const [durationMinutes, setDurationMinutes] =
    useState(0);

  const [notes, setNotes] =
    useState("");

  const [items, setItems] =
    useState([]);

  const exerciseSuggestions = useMemo(
    () =>
      [...exercises].sort((first, second) =>
        first.name.localeCompare(
          second.name,
          "fr",
          {
            sensitivity: "base",
          },
        ),
      ),
    [exercises],
  );

  const findExerciseByName = (name) => {
    const normalizedName =
      name.trim().toLocaleLowerCase("fr");

    return exercises.find(
      (exercise) =>
        exercise.name
          .trim()
          .toLocaleLowerCase("fr") ===
        normalizedName,
    );
  };

  const addExercise = () => {
    setItems((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        exerciseId: null,
        exerciseName: "",
        notes: "",
        sets: [
          emptySet(),
          emptySet(),
          emptySet(),
        ],
      },
    ]);
  };

  const updateExerciseName = (
    itemId,
    exerciseName,
  ) => {
    const existingExercise =
      findExerciseByName(exerciseName);

    updateItem(itemId, {
      exerciseName,
      exerciseId:
        existingExercise?.id ?? null,
    });
  };

  const updateItem = (
    itemId,
    changes,
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
            ...item,
            ...changes,
          }
          : item,
      ),
    );
  };

  const removeItem = (itemId) => {
    setItems((current) =>
      current.filter(
        (item) =>
          item.id !== itemId,
      ),
    );
  };

  const updateSet = (
    itemId,
    setIndex,
    changes,
  ) => {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        return {
          ...item,
          sets: item.sets.map(
            (set, index) =>
              index === setIndex
                ? {
                  ...set,
                  ...changes,
                }
                : set,
          ),
        };
      }),
    );
  };

  const addSet = (itemId) => {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
            ...item,
            sets: [
              ...item.sets,
              emptySet(),
            ],
          }
          : item,
      ),
    );
  };

  const removeSet = (
    itemId,
    setIndex,
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
            ...item,
            sets:
              item.sets.length > 1
                ? item.sets.filter(
                  (_, index) =>
                    index !== setIndex,
                )
                : item.sets,
          }
          : item,
      ),
    );
  };

  const submit = async (event) => {
    event.preventDefault();

    const cleanedItems = items.map(
      (item) => ({
        ...item,
        exerciseName:
          item.exerciseName?.trim() ?? "",
      }),
    );

    if (
      cleanedItems.some(
        (item) => !item.exerciseName,
      )
    ) {
      window.alert(
        "Renseigne le nom de chaque exercice.",
      );
      return;
    }

    const startDate = new Date(
      startedAt,
    );

    const totalDurationMinutes =
      Number(durationHours) * 60 +
      Number(durationMinutes);

    const endDate = new Date(
      startDate.getTime() +
      totalDurationMinutes * 60000,
    );

    await onSave({
      title,
      startedAt:
        startDate.toISOString(),
      endedAt:
        endDate.toISOString(),
      notes,
      exercises: cleanedItems,
    });

    setTitle(
      "Séance musculation",
    );
    setNotes("");
    setItems([]);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="workout-modal__overlay"
            aria-label="Fermer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.form
            className="workout-modal"
            onSubmit={submit}
            initial={{
              opacity: 0,
              y: 30,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.97,
            }}
          >
            <header className="workout-modal__header">
              <div>
                <span className="section-heading__eyebrow">
                  Nouvelle séance
                </span>

                <h2>
                  Enregistrer un entraînement
                </h2>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={onClose}
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </header>

            <div className="workout-modal__body">
              <div className="workout-form-grid">
                <label>
                  <span>Nom</span>
                  <input
                    value={title}
                    onChange={(event) =>
                      setTitle(
                        event.target.value,
                      )
                    }
                    required
                  />
                </label>

                <label>
                  <span>Date et heure</span>
                  <input
                    type="datetime-local"
                    value={startedAt}
                    onChange={(event) =>
                      setStartedAt(
                        event.target.value,
                      )
                    }
                    required
                  />
                </label>

                <div className="workout-duration-field">
                  <span>Durée estimée</span>

                  <div className="workout-duration-inputs">
                    <label>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={durationHours}
                        onChange={(event) =>
                          setDurationHours(
                            Math.max(
                              0,
                              Number(event.target.value),
                            ),
                          )
                        }
                      />
                      <span>h</span>
                    </label>

                    <label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={durationMinutes}
                        onChange={(event) =>
                          setDurationMinutes(
                            Math.min(
                              59,
                              Math.max(
                                0,
                                Number(event.target.value),
                              ),
                            ),
                          )
                        }
                      />
                      <span>min</span>
                    </label>
                  </div>
                </div>
              </div>

              <label className="workout-form-notes">
                <span>Notes</span>
                <textarea
                  rows="3"
                  value={notes}
                  onChange={(event) =>
                    setNotes(
                      event.target.value,
                    )
                  }
                  placeholder="Sensations, objectifs, remarques…"
                />
              </label>

              <div className="workout-modal__exercise-heading">
                <div>
                  <span className="section-heading__eyebrow">
                    Exercices
                  </span>
                  <h3>
                    Séries de la séance
                  </h3>
                </div>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={addExercise}
                >
                  <Plus size={17} />
                  Ajouter
                </button>
              </div>

              <div className="workout-editor-list">
                {items.map(
                  (item, itemIndex) => (
                    <article
                      key={item.id}
                      className="workout-editor-card"
                    >
                      <div className="workout-editor-card__header">
                        <span className="workout-editor-card__number">
                          {itemIndex + 1}
                        </span>

                        <input
                          type="text"
                          list="workout-exercise-suggestions"
                          value={
                            item.exerciseName
                          }
                          onChange={(
                            event,
                          ) =>
                            updateExerciseName(
                              item.id,
                              event.target.value,
                            )
                          }
                          placeholder="Nom de l’exercice"
                          autoComplete="off"
                          required
                        />

                        <button
                          type="button"
                          aria-label="Supprimer l’exercice"
                          onClick={() =>
                            removeItem(
                              item.id,
                            )
                          }
                        >
                          <Trash2
                            size={17}
                          />
                        </button>
                      </div>

                      <div className="workout-set-table">
                        <div className="workout-set-table__header">
                          <span>Série</span>
                          <span>Poids</span>
                          <span>Répétitions</span>
                          <span />
                        </div>

                        {item.sets.map(
                          (
                            set,
                            setIndex,
                          ) => (
                            <div
                              key={
                                setIndex
                              }
                              className="workout-set-row"
                            >
                              <strong>
                                {setIndex +
                                  1}
                              </strong>

                              <label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={
                                    set.weightKg
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateSet(
                                      item.id,
                                      setIndex,
                                      {
                                        weightKg:
                                          event
                                            .target
                                            .value,
                                      },
                                    )
                                  }
                                />
                                <span>kg</span>
                              </label>

                              <label>
                                <input
                                  type="number"
                                  min="0"
                                  value={
                                    set.repetitions
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateSet(
                                      item.id,
                                      setIndex,
                                      {
                                        repetitions:
                                          event
                                            .target
                                            .value,
                                      },
                                    )
                                  }
                                />
                                <span>reps</span>
                              </label>

                              <button
                                type="button"
                                aria-label="Supprimer la série"
                                onClick={() =>
                                  removeSet(
                                    item.id,
                                    setIndex,
                                  )
                                }
                              >
                                <Minus
                                  size={16}
                                />
                              </button>
                            </div>
                          ),
                        )}
                      </div>

                      <button
                        type="button"
                        className="workout-editor-card__add-set"
                        onClick={() =>
                          addSet(item.id)
                        }
                      >
                        <Plus size={15} />
                        Ajouter une série
                      </button>
                    </article>
                  ),
                )}

                {items.length === 0 && (
                  <div className="workout-editor-empty">
                    <Dumbbell
                      size={30}
                    />
                    <strong>
                      Aucun exercice
                    </strong>
                    <span>
                      Ajoute les exercices
                      réalisés pendant la séance.
                    </span>
                  </div>
                )}
              </div>
            </div>

            <datalist id="workout-exercise-suggestions">
              {exerciseSuggestions.map(
                (exercise) => (
                  <option
                    key={exercise.id}
                    value={exercise.name}
                  />
                ),
              )}
            </datalist>

            <footer className="workout-modal__footer">
              <button
                type="button"
                className="secondary-button"
                onClick={onClose}
                disabled={saving}
              >
                Annuler
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={
                  saving ||
                  items.length === 0
                }
              >
                <Save size={18} />
                {saving
                  ? "Enregistrement…"
                  : "Enregistrer"}
              </button>
            </footer>
          </motion.form>
        </>
      )}
    </AnimatePresence>
  );
}

export default WorkoutSessionModal;
