import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createGage,
  deleteGage,
  deleteGageProof,
  getGages,
  updateGageStatus,
  uploadGageProof,
} from "../services/gageService";

const DEFAULT_GAGE_POINTS = 10;

function getErrorMessage(error) {
  return (
    error?.message ??
    "Une erreur est survenue dans la gestion des gages."
  );
}

function normalizePointsReward(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return DEFAULT_GAGE_POINTS;
  }

  return Math.max(
    0,
    Math.round(numericValue),
  );
}

function normalizeCreateGagePayload(
  payload = {},
  currentProfileId = null,
) {
  const assignedProfileId =
    payload.assignedProfileId ??
    payload.assigned_profile_id ??
    "";

  const createdBy =
    payload.createdBy ??
    payload.created_by ??
    currentProfileId ??
    "";

  const dueDate =
    payload.dueDate ??
    payload.due_date ??
    null;

  const pointsReward =
    normalizePointsReward(
      payload.pointsReward ??
        payload.points_reward ??
        DEFAULT_GAGE_POINTS,
    );

  return {
    /*
     * Format camelCase conservé pour rester
     * compatible avec le service existant.
     */
    assignedProfileId,
    createdBy,
    title:
      String(payload.title ?? "").trim(),
    description:
      String(
        payload.description ?? "",
      ).trim(),
    dueDate:
      dueDate || null,
    status:
      payload.status ?? "pending",
    pointsReward,

    /*
     * Versions snake_case également transmises.
     * Le service peut ainsi utiliser directement
     * les noms de colonnes Supabase.
     */
    assigned_profile_id:
      assignedProfileId,
    created_by:
      createdBy,
    due_date:
      dueDate || null,
    points_reward:
      pointsReward,
  };
}

function validateCreateGagePayload(payload) {
  if (!payload.assignedProfileId) {
    throw new Error(
      "Sélectionne le membre qui doit réaliser le gage.",
    );
  }

  if (!payload.createdBy) {
    throw new Error(
      "Utilisateur connecté introuvable.",
    );
  }

  if (!payload.title) {
    throw new Error(
      "Le titre du gage est obligatoire.",
    );
  }

  if (!payload.description) {
    throw new Error(
      "La description du gage est obligatoire.",
    );
  }

  if (
    !Number.isFinite(
      payload.pointsReward,
    ) ||
    payload.pointsReward < 0
  ) {
    throw new Error(
      "Le nombre de points attribués est invalide.",
    );
  }
}

export function useGages(
  currentProfileId,
) {
  const [gages, setGages] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const loadGages = useCallback(
    async ({
      showLoading = true,
    } = {}) => {
      if (showLoading) {
        setLoading(true);
      }

      setError(null);

      try {
        const rows =
          await getGages();

        const normalizedRows =
          Array.isArray(rows)
            ? rows
            : [];

        setGages(
          normalizedRows,
        );

        return normalizedRows;
      } catch (requestError) {
        console.error(
          "Impossible de charger les gages :",
          requestError,
        );

        setError(
          getErrorMessage(
            requestError,
          ),
        );

        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadGages();
  }, [loadGages]);

  const addGage = useCallback(
    async (payload) => {
      setSaving(true);
      setError(null);

      try {
        const normalizedPayload =
          normalizeCreateGagePayload(
            payload,
            currentProfileId,
          );

        validateCreateGagePayload(
          normalizedPayload,
        );

        const createdGage =
          await createGage(
            normalizedPayload,
          );

        await loadGages({
          showLoading: false,
        });

        return createdGage;
      } catch (requestError) {
        console.error(
          "Impossible de créer le gage :",
          requestError,
        );

        setError(
          getErrorMessage(
            requestError,
          ),
        );

        throw requestError;
      } finally {
        setSaving(false);
      }
    },
    [
      currentProfileId,
      loadGages,
    ],
  );

  const startGage = useCallback(
    async (gage) => {
      if (!gage?.id) {
        throw new Error(
          "Gage introuvable.",
        );
      }

      setSaving(true);
      setError(null);

      try {
        const updatedGage =
          await updateGageStatus(
            gage.id,
            "in_progress",
          );

        await loadGages({
          showLoading: false,
        });

        return updatedGage;
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
          ),
        );

        throw requestError;
      } finally {
        setSaving(false);
      }
    },
    [loadGages],
  );

  const completeGage = useCallback(
    async (gage) => {
      if (!gage?.id) {
        throw new Error(
          "Gage introuvable.",
        );
      }

      setSaving(true);
      setError(null);

      try {
        const updatedGage =
          await updateGageStatus(
            gage.id,
            "completed",
          );

        await loadGages({
          showLoading: false,
        });

        return updatedGage;
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
          ),
        );

        throw requestError;
      } finally {
        setSaving(false);
      }
    },
    [loadGages],
  );

  const validateGage = useCallback(
    async (gage) => {
      if (!gage?.id) {
        throw new Error(
          "Gage introuvable.",
        );
      }

      setSaving(true);
      setError(null);

      try {
        /*
         * Le passage au statut "validated"
         * renseigne validated_at dans le service.
         * Le trigger SQL crédite ensuite
         * automatiquement points_reward dans
         * points_transactions.
         */
        const updatedGage =
          await updateGageStatus(
            gage.id,
            "validated",
          );

        await loadGages({
          showLoading: false,
        });

        return updatedGage;
      } catch (requestError) {
        console.error(
          "Impossible de valider le gage :",
          requestError,
        );

        setError(
          getErrorMessage(
            requestError,
          ),
        );

        throw requestError;
      } finally {
        setSaving(false);
      }
    },
    [loadGages],
  );

  const cancelGage = useCallback(
    async (gage) => {
      if (!gage?.id) {
        throw new Error(
          "Gage introuvable.",
        );
      }

      setSaving(true);
      setError(null);

      try {
        const updatedGage =
          await updateGageStatus(
            gage.id,
            "cancelled",
          );

        await loadGages({
          showLoading: false,
        });

        return updatedGage;
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
          ),
        );

        throw requestError;
      } finally {
        setSaving(false);
      }
    },
    [loadGages],
  );

  const uploadProof = useCallback(
    async ({
      gage,
      file,
    }) => {
      if (!currentProfileId) {
        throw new Error(
          "Utilisateur connecté introuvable.",
        );
      }

      if (!gage?.id) {
        throw new Error(
          "Gage introuvable.",
        );
      }

      if (!file) {
        throw new Error(
          "Aucun fichier sélectionné.",
        );
      }

      setUploading(true);
      setError(null);

      try {
        const uploadedProof =
          await uploadGageProof({
            gageId: gage.id,
            profileId:
              currentProfileId,
            file,
          });

        await loadGages({
          showLoading: false,
        });

        return uploadedProof;
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
          ),
        );

        throw requestError;
      } finally {
        setUploading(false);
      }
    },
    [
      currentProfileId,
      loadGages,
    ],
  );

  const removeProof = useCallback(
    async (gage) => {
      const proof =
        gage?.proofs
          ?.slice()
          .sort(
            (
              proofA,
              proofB,
            ) => {
              return (
                new Date(
                  proofB.createdAt ??
                    proofB.created_at ??
                    0,
                ).getTime() -
                new Date(
                  proofA.createdAt ??
                    proofA.created_at ??
                    0,
                ).getTime()
              );
            },
          )[0] ?? null;

      if (!proof) {
        throw new Error(
          "Aucune preuve à supprimer.",
        );
      }

      setUploading(true);
      setError(null);

      try {
        const deletedProof =
          await deleteGageProof(
            proof,
          );

        await loadGages({
          showLoading: false,
        });

        return deletedProof;
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
          ),
        );

        throw requestError;
      } finally {
        setUploading(false);
      }
    },
    [loadGages],
  );

  const removeGage = useCallback(
    async (gage) => {
      if (!gage?.id) {
        throw new Error(
          "Gage introuvable.",
        );
      }

      setSaving(true);
      setError(null);

      try {
        const deletedGage =
          await deleteGage(
            gage.id,
          );

        await loadGages({
          showLoading: false,
        });

        return deletedGage;
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
          ),
        );

        throw requestError;
      } finally {
        setSaving(false);
      }
    },
    [loadGages],
  );

  return {
    gages,
    loading,
    saving,
    uploading,
    error,

    addGage,
    startGage,
    completeGage,
    validateGage,
    cancelGage,
    uploadProof,
    removeProof,
    removeGage,

    refreshGages:
      loadGages,
  };
}

export default useGages;
