import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../../../lib/supabase";

const PROOF_BUCKET = "challenge-proofs";
const SIGNED_URL_DURATION = 60 * 60;

function normalizeEntry(entry) {
  return {
    id: entry.id,

    challengeId:
      entry.challenge_id,

    profileId:
      entry.profile_id,

    progressValue:
      Number(
        entry.progress_value ?? 0,
      ),

    proofText:
      entry.proof_text ?? "",

    proofStoragePath:
      entry.proof_storage_path ??
      null,

    proofFileName:
      entry.proof_file_name ??
      null,

    proofMimeType:
      entry.proof_mime_type ??
      null,

    proofUrl:
      entry.proofUrl ??
      null,

    status:
      entry.status ?? "pending",

    submittedAt:
      entry.submitted_at ?? null,

    validatedAt:
      entry.validated_at ?? null,

    validatedBy:
      entry.validated_by ?? null,

    rejectionReason:
      entry.rejection_reason ?? "",

    pointsAwarded:
      Number(
        entry.points_awarded ?? 0,
      ),

    pointsAwardedAt:
      entry.points_awarded_at ??
      null,

    createdAt:
      entry.created_at,

    updatedAt:
      entry.updated_at,

    profile:
      entry.profile ?? null,

    validator:
      entry.validator ?? null,
  };
}

async function addSignedProofUrl(entry) {
  if (!entry.proof_storage_path) {
    return normalizeEntry(entry);
  }

  const {
    data,
    error,
  } = await supabase.storage
    .from(PROOF_BUCKET)
    .createSignedUrl(
      entry.proof_storage_path,
      SIGNED_URL_DURATION,
    );

  if (error) {
    console.error(
      "Impossible de générer l’URL signée de la preuve :",
      error,
    );

    return normalizeEntry(entry);
  }

  return normalizeEntry({
    ...entry,
    proofUrl:
      data?.signedUrl ?? null,
  });
}

function getFileExtension(file) {
  const extension = file?.name
    ?.split(".")
    .pop()
    ?.toLowerCase();

  if (extension) {
    return extension;
  }

  if (file?.type === "image/jpeg") {
    return "jpg";
  }

  if (file?.type === "image/png") {
    return "png";
  }

  return "webp";
}

export function useChallengeEntries({
  challengeId = null,
  currentProfileId = null,
} = {}) {
  const [entries, setEntries] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState(null);

  const fetchEntries =
    useCallback(async () => {
      if (!challengeId) {
        setEntries([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const {
        data,
        error: fetchError,
      } = await supabase
        .from(
          "weekly_challenge_entries",
        )
        .select(`
          id,
          challenge_id,
          profile_id,
          progress_value,
          proof_text,
          proof_storage_path,
          proof_file_name,
          proof_mime_type,
          status,
          submitted_at,
          validated_at,
          validated_by,
          rejection_reason,
          points_awarded,
          points_awarded_at,
          created_at,
          updated_at,

          profile:profiles!weekly_challenge_entries_profile_id_fkey (
            id,
            nickname,
            first_name,
            initials,
            avatar_url
          ),

          validator:profiles!weekly_challenge_entries_validated_by_fkey (
            id,
            nickname,
            first_name
          )
        `)
        .eq(
          "challenge_id",
          challengeId,
        )
        .order("created_at", {
          ascending: true,
        });

      if (fetchError) {
        console.error(
          "Impossible de charger les participations :",
          fetchError,
        );

        setError(
          fetchError.message ??
            "Impossible de charger les participations.",
        );

        setLoading(false);
        return;
      }

      const entriesWithProofUrls =
        await Promise.all(
          (data ?? []).map(
            addSignedProofUrl,
          ),
        );

      setEntries(entriesWithProofUrls);
      setLoading(false);
    }, [challengeId]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    if (!challengeId) {
      return undefined;
    }

    const channel = supabase
      .channel(
        `challenge-entries:${challengeId}`,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table:
            "weekly_challenge_entries",
          filter:
            `challenge_id=eq.${challengeId}`,
        },
        () => {
          fetchEntries();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    challengeId,
    fetchEntries,
  ]);

  const currentEntry = useMemo(() => {
    if (!currentProfileId) {
      return null;
    }

    return (
      entries.find(
        (entry) =>
          String(entry.profileId) ===
          String(currentProfileId),
      ) ?? null
    );
  }, [
    currentProfileId,
    entries,
  ]);

  const submittedEntries =
    useMemo(() => {
      return entries.filter(
        (entry) =>
          entry.status ===
            "submitted" ||
          entry.status ===
            "validated" ||
          entry.status ===
            "rejected",
      );
    }, [entries]);

  const pendingValidationEntries =
    useMemo(() => {
      return entries.filter(
        (entry) =>
          entry.status ===
          "submitted",
      );
    }, [entries]);

  const validatedEntries =
    useMemo(() => {
      return entries.filter(
        (entry) =>
          entry.status ===
          "validated",
      );
    }, [entries]);

  const submitEntry = useCallback(
    async ({
      progressValue = 0,
      proofText = "",
      proofFile = null,
    }) => {
      if (
        !challengeId ||
        !currentProfileId
      ) {
        throw new Error(
          "Défi ou utilisateur introuvable.",
        );
      }

      setSaving(true);
      setError(null);

      let newStoragePath = null;
      const previousStoragePath =
        currentEntry?.proofStoragePath ??
        null;

      try {
        let proofStoragePath =
          previousStoragePath;

        let proofFileName =
          currentEntry?.proofFileName ??
          null;

        let proofMimeType =
          currentEntry?.proofMimeType ??
          null;

        if (proofFile) {
          const extension =
            getFileExtension(proofFile);

          newStoragePath = [
            challengeId,
            currentProfileId,
            `${crypto.randomUUID()}.${extension}`,
          ].join("/");

          const {
            error: uploadError,
          } = await supabase.storage
            .from(PROOF_BUCKET)
            .upload(
              newStoragePath,
              proofFile,
              {
                cacheControl: "3600",
                upsert: false,
                contentType:
                  proofFile.type,
              },
            );

          if (uploadError) {
            throw uploadError;
          }

          proofStoragePath =
            newStoragePath;

          proofFileName =
            proofFile.name;

          proofMimeType =
            proofFile.type;
        }

        const payload = {
          challenge_id:
            challengeId,

          profile_id:
            currentProfileId,

          progress_value:
            Number(progressValue ?? 0),

          proof_text:
            proofText.trim() || null,

          proof_storage_path:
            proofStoragePath,

          proof_file_name:
            proofFileName,

          proof_mime_type:
            proofMimeType,

          status: "submitted",

          submitted_at:
            new Date().toISOString(),

          validated_at: null,
          validated_by: null,
          rejection_reason: null,

          points_awarded: 0,
          points_awarded_at: null,
        };

        const {
          data,
          error: saveError,
        } = await supabase
          .from(
            "weekly_challenge_entries",
          )
          .upsert(payload, {
            onConflict:
              "challenge_id,profile_id",
          })
          .select()
          .single();

        if (saveError) {
          throw saveError;
        }

        if (
          proofFile &&
          previousStoragePath &&
          previousStoragePath !==
            newStoragePath
        ) {
          const {
            error: cleanupError,
          } = await supabase.storage
            .from(PROOF_BUCKET)
            .remove([
              previousStoragePath,
            ]);

          if (cleanupError) {
            console.warn(
              "Ancienne preuve non supprimée :",
              cleanupError,
            );
          }
        }

        await fetchEntries();

        return addSignedProofUrl(data);
      } catch (saveError) {
        if (newStoragePath) {
          await supabase.storage
            .from(PROOF_BUCKET)
            .remove([
              newStoragePath,
            ]);
        }

        console.error(
          "Impossible d’envoyer la participation :",
          saveError,
        );

        setError(
          saveError.message ??
            "Impossible d’envoyer la participation.",
        );

        throw saveError;
      } finally {
        setSaving(false);
      }
    },
    [
      challengeId,
      currentProfileId,
      currentEntry,
      fetchEntries,
    ],
  );

  const validateEntry = useCallback(
    async ({
      entryId,
      validatorId,
      pointsAwarded = 0,
    }) => {
      if (!entryId) {
        throw new Error(
          "Participation introuvable.",
        );
      }

      setSaving(true);
      setError(null);

      try {
        const validatedAt =
          new Date().toISOString();

        const {
          error: updateError,
        } = await supabase
          .from(
            "weekly_challenge_entries",
          )
          .update({
            status: "validated",

            validated_at:
              validatedAt,

            validated_by:
              validatorId,

            rejection_reason: null,

            points_awarded:
              Number(
                pointsAwarded ?? 0,
              ),

            points_awarded_at:
              Number(pointsAwarded) > 0
                ? validatedAt
                : null,
          })
          .eq("id", entryId);

        if (updateError) {
          throw updateError;
        }

        await fetchEntries();
      } catch (updateError) {
        console.error(
          "Impossible de valider la participation :",
          updateError,
        );

        setError(
          updateError.message ??
            "Impossible de valider la participation.",
        );

        throw updateError;
      } finally {
        setSaving(false);
      }
    },
    [fetchEntries],
  );

  const rejectEntry = useCallback(
    async ({
      entryId,
      validatorId,
      reason = "",
    }) => {
      if (!entryId) {
        throw new Error(
          "Participation introuvable.",
        );
      }

      setSaving(true);
      setError(null);

      try {
        const {
          error: updateError,
        } = await supabase
          .from(
            "weekly_challenge_entries",
          )
          .update({
            status: "rejected",

            validated_at:
              new Date().toISOString(),

            validated_by:
              validatorId,

            rejection_reason:
              reason.trim() || null,

            points_awarded: 0,
            points_awarded_at: null,
          })
          .eq("id", entryId);

        if (updateError) {
          throw updateError;
        }

        await fetchEntries();
      } catch (updateError) {
        console.error(
          "Impossible de refuser la participation :",
          updateError,
        );

        setError(
          updateError.message ??
            "Impossible de refuser la participation.",
        );

        throw updateError;
      } finally {
        setSaving(false);
      }
    },
    [fetchEntries],
  );

  const deleteEntry = useCallback(
    async (entryId) => {
      if (!entryId) {
        return;
      }

      setSaving(true);
      setError(null);

      const entry =
        entries.find(
          (item) =>
            item.id === entryId,
        );

      try {
        const {
          error: deleteError,
        } = await supabase
          .from(
            "weekly_challenge_entries",
          )
          .delete()
          .eq("id", entryId);

        if (deleteError) {
          throw deleteError;
        }

        if (entry?.proofStoragePath) {
          await supabase.storage
            .from(PROOF_BUCKET)
            .remove([
              entry.proofStoragePath,
            ]);
        }

        await fetchEntries();
      } catch (deleteError) {
        console.error(
          "Impossible de supprimer la participation :",
          deleteError,
        );

        setError(
          deleteError.message ??
            "Impossible de supprimer la participation.",
        );

        throw deleteError;
      } finally {
        setSaving(false);
      }
    },
    [
      entries,
      fetchEntries,
    ],
  );

  return {
    entries,
    currentEntry,

    submittedEntries,
    pendingValidationEntries,
    validatedEntries,

    loading,
    saving,
    error,

    refreshEntries:
      fetchEntries,

    submitEntry,
    validateEntry,
    rejectEntry,
    deleteEntry,
  };
}

export default useChallengeEntries;
