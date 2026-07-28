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

function getErrorMessage(error) {
  return (
    error?.message ??
    "Une erreur est survenue dans la gestion des gages."
  );
}

export function useGages(currentProfileId) {
  const [gages, setGages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const loadGages = useCallback(
    async ({
      showLoading = true,
    } = {}) => {
      if (showLoading) {
        setLoading(true);
      }

      setError(null);

      try {
        const rows = await getGages();

        setGages(
          Array.isArray(rows)
            ? rows
            : [],
        );

        return rows;
      } catch (requestError) {
        console.error(
          "Impossible de charger les gages :",
          requestError,
        );

        setError(
          getErrorMessage(requestError),
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

  const addGage = async (payload) => {
    setSaving(true);
    setError(null);

    try {
      await createGage(payload);

      await loadGages({
        showLoading: false,
      });
    } catch (requestError) {
      setError(
        getErrorMessage(requestError),
      );

      throw requestError;
    } finally {
      setSaving(false);
    }
  };

  const startGage = async (gage) => {
    setSaving(true);
    setError(null);

    try {
      await updateGageStatus(
        gage.id,
        "in_progress",
      );

      await loadGages({
        showLoading: false,
      });
    } catch (requestError) {
      setError(
        getErrorMessage(requestError),
      );

      throw requestError;
    } finally {
      setSaving(false);
    }
  };

  const completeGage = async (gage) => {
    setSaving(true);
    setError(null);

    try {
      await updateGageStatus(
        gage.id,
        "completed",
      );

      await loadGages({
        showLoading: false,
      });
    } catch (requestError) {
      setError(
        getErrorMessage(requestError),
      );

      throw requestError;
    } finally {
      setSaving(false);
    }
  };

  const validateGage = async (gage) => {
    setSaving(true);
    setError(null);

    try {
      await updateGageStatus(
        gage.id,
        "validated",
      );

      await loadGages({
        showLoading: false,
      });
    } catch (requestError) {
      setError(
        getErrorMessage(requestError),
      );

      throw requestError;
    } finally {
      setSaving(false);
    }
  };

  const cancelGage = async (gage) => {
    setSaving(true);
    setError(null);

    try {
      await updateGageStatus(
        gage.id,
        "cancelled",
      );

      await loadGages({
        showLoading: false,
      });
    } catch (requestError) {
      setError(
        getErrorMessage(requestError),
      );

      throw requestError;
    } finally {
      setSaving(false);
    }
  };

  const uploadProof = async ({
    gage,
    file,
  }) => {
    if (!currentProfileId) {
      throw new Error(
        "Utilisateur connecté introuvable.",
      );
    }

    setUploading(true);
    setError(null);

    try {
      await uploadGageProof({
        gageId: gage.id,
        profileId: currentProfileId,
        file,
      });

      await loadGages({
        showLoading: false,
      });
    } catch (requestError) {
      setError(
        getErrorMessage(requestError),
      );

      throw requestError;
    } finally {
      setUploading(false);
    }
  };

  const removeProof = async (gage) => {
    const proof =
      gage.proofs
        ?.slice()
        .sort((proofA, proofB) => {
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
        })[0] ?? null;

    if (!proof) {
      throw new Error(
        "Aucune preuve à supprimer.",
      );
    }

    setUploading(true);
    setError(null);

    try {
      await deleteGageProof(proof);

      await loadGages({
        showLoading: false,
      });
    } catch (requestError) {
      setError(
        getErrorMessage(requestError),
      );

      throw requestError;
    } finally {
      setUploading(false);
    }
  };

  const removeGage = async (gage) => {
    setSaving(true);
    setError(null);

    try {
      await deleteGage(gage.id);

      await loadGages({
        showLoading: false,
      });
    } catch (requestError) {
      setError(
        getErrorMessage(requestError),
      );

      throw requestError;
    } finally {
      setSaving(false);
    }
  };

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

    refreshGages: loadGages,
  };
}

export default useGages;