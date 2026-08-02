import { supabase } from "../lib/supabase";

const GAGES_TABLE = "gages";
const GAGE_PROOFS_TABLE = "gage_proofs";
const GAGE_BUCKET = "gage-proofs";
const DEFAULT_GAGE_POINTS = 10;

function normalizeProfile(profile) {
  if (!profile) {
    return null;
  }

  return {
    ...profile,

    avatarUrl:
      profile.avatarUrl ??
      profile.avatar_url ??
      null,

    firstName:
      profile.firstName ??
      profile.first_name ??
      null,
  };
}

function normalizeProof(proof) {
  if (!proof) {
    return null;
  }

  return {
    ...proof,

    gageId:
      proof.gage_id ??
      proof.gageId,

    uploadedBy:
      proof.uploaded_by ??
      proof.uploadedBy,

    storagePath:
      proof.storage_path ??
      proof.storagePath,

    fileName:
      proof.file_name ??
      proof.fileName,

    mimeType:
      proof.mime_type ??
      proof.mimeType,

    fileSize:
      proof.file_size ??
      proof.fileSize,

    createdAt:
      proof.created_at ??
      proof.createdAt,
  };
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

function normalizeGage(row) {
  const proofs = Array.isArray(row.proofs)
    ? row.proofs.map(normalizeProof)
    : [];

  const latestProof =
    proofs
      .slice()
      .sort((proofA, proofB) => {
        return (
          new Date(
            proofB.createdAt ?? 0,
          ).getTime() -
          new Date(
            proofA.createdAt ?? 0,
          ).getTime()
        );
      })[0] ?? null;

  const pointsReward =
    normalizePointsReward(
      row.points_reward ??
        row.pointsReward ??
        DEFAULT_GAGE_POINTS,
    );

  return {
    ...row,

    gageNumber:
      row.gage_number ??
      row.gageNumber,

    assignedProfileId:
      row.assigned_profile_id ??
      row.assignedProfileId,

    createdBy:
      row.created_by ??
      row.createdBy,

    dueDate:
      row.due_date ??
      row.dueDate,

    startedAt:
      row.started_at ??
      row.startedAt,

    completedAt:
      row.completed_at ??
      row.completedAt,

    validatedAt:
      row.validated_at ??
      row.validatedAt,

    cancelledAt:
      row.cancelled_at ??
      row.cancelledAt,

    createdAt:
      row.created_at ??
      row.createdAt,

    updatedAt:
      row.updated_at ??
      row.updatedAt,

    pointsReward,

    points_reward:
      pointsReward,

    assignedProfile:
      normalizeProfile(
        row.assignedProfile,
      ),

    createdByProfile:
      normalizeProfile(
        row.createdByProfile,
      ),

    proofs,

    proofUrl:
      latestProof?.signedUrl ??
      latestProof?.signed_url ??
      null,

    proofFileName:
      latestProof?.fileName ??
      latestProof?.file_name ??
      null,

    proofStoragePath:
      latestProof?.storagePath ??
      latestProof?.storage_path ??
      null,
  };
}

async function addSignedUrlsToProofs(rows) {
  const allProofs = rows.flatMap(
    (row) => row.proofs ?? [],
  );

  const signedUrlEntries =
    await Promise.all(
      allProofs.map(
        async (proof) => {
          const storagePath =
            proof.storage_path ??
            proof.storagePath;

          if (!storagePath) {
            return [
              proof.id,
              null,
            ];
          }

          const {
            data,
            error,
          } = await supabase.storage
            .from(GAGE_BUCKET)
            .createSignedUrl(
              storagePath,
              60 * 60,
            );

          if (error) {
            console.error(
              "Impossible de créer l’URL signée de la preuve :",
              error,
            );

            return [
              proof.id,
              null,
            ];
          }

          return [
            proof.id,
            data?.signedUrl ?? null,
          ];
        },
      ),
    );

  const signedUrlMap =
    new Map(signedUrlEntries);

  return rows.map((row) => ({
    ...row,

    proofs: (row.proofs ?? []).map(
      (proof) => ({
        ...proof,

        signedUrl:
          signedUrlMap.get(
            proof.id,
          ) ?? null,
      }),
    ),
  }));
}

export async function getGages() {
  const {
    data,
    error,
  } = await supabase
    .from(GAGES_TABLE)
    .select(`
      *,
      assignedProfile:profiles!gages_assigned_profile_id_fkey(*),
      createdByProfile:profiles!gages_created_by_fkey(*),
      proofs:gage_proofs(*)
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  const rowsWithSignedUrls =
    await addSignedUrlsToProofs(
      data ?? [],
    );

  return rowsWithSignedUrls.map(
    normalizeGage,
  );
}

export async function createGage(
  payload,
) {
  const assignedProfileId =
    payload.assignedProfileId ??
    payload.assigned_profile_id;

  const createdBy =
    payload.createdBy ??
    payload.created_by;

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

  if (!assignedProfileId) {
    throw new Error(
      "Le membre concerné est introuvable.",
    );
  }

  if (!createdBy) {
    throw new Error(
      "Le créateur du gage est introuvable.",
    );
  }

  const title =
    String(
      payload.title ?? "",
    ).trim();

  const description =
    String(
      payload.description ?? "",
    ).trim();

  if (!title) {
    throw new Error(
      "Le titre du gage est obligatoire.",
    );
  }

  if (!description) {
    throw new Error(
      "La description du gage est obligatoire.",
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from(GAGES_TABLE)
    .insert({
      assigned_profile_id:
        assignedProfileId,

      created_by:
        createdBy,

      title,

      description,

      due_date:
        dueDate || null,

      points_reward:
        pointsReward,

      status:
        payload.status ?? "pending",
    })
    .select(`
      *,
      assignedProfile:profiles!gages_assigned_profile_id_fkey(*),
      createdByProfile:profiles!gages_created_by_fkey(*),
      proofs:gage_proofs(*)
    `)
    .single();

  if (error) {
    throw error;
  }

  return normalizeGage(data);
}

export async function updateGageStatus(
  gageId,
  status,
) {
  if (!gageId) {
    throw new Error(
      "Identifiant du gage manquant.",
    );
  }

  const allowedStatuses = [
    "pending",
    "in_progress",
    "completed",
    "validated",
    "cancelled",
  ];

  if (
    !allowedStatuses.includes(status)
  ) {
    throw new Error(
      "Statut de gage invalide.",
    );
  }

  const updatePayload = {
    status,
  };

  const now =
    new Date().toISOString();

  if (status === "in_progress") {
    updatePayload.started_at = now;
  }

  if (status === "completed") {
    updatePayload.completed_at = now;
  }

  if (status === "validated") {
    updatePayload.validated_at = now;
  }

  if (status === "cancelled") {
    updatePayload.cancelled_at = now;
  }

  const {
    data,
    error,
  } = await supabase
    .from(GAGES_TABLE)
    .update(updatePayload)
    .eq("id", gageId)
    .select(`
      *,
      assignedProfile:profiles!gages_assigned_profile_id_fkey(*),
      createdByProfile:profiles!gages_created_by_fkey(*),
      proofs:gage_proofs(*)
    `)
    .single();

  if (error) {
    throw error;
  }

  return normalizeGage(data);
}

export async function uploadGageProof({
  gageId,
  profileId,
  file,
}) {
  if (!gageId) {
    throw new Error(
      "Identifiant du gage manquant.",
    );
  }

  if (!profileId) {
    throw new Error(
      "Identifiant du membre manquant.",
    );
  }

  if (!file) {
    throw new Error(
      "Aucun fichier sélectionné.",
    );
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (
    !allowedTypes.includes(
      file.type,
    )
  ) {
    throw new Error(
      "Le fichier doit être une image JPEG, PNG ou WebP.",
    );
  }

  const maxFileSize =
    10 * 1024 * 1024;

  if (
    file.size >
    maxFileSize
  ) {
    throw new Error(
      "L’image ne doit pas dépasser 10 Mo.",
    );
  }

  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() ||
    "jpg";

  const storagePath = [
    gageId,
    profileId,
    `${Date.now()}-${crypto.randomUUID()}.${extension}`,
  ].join("/");

  const {
    error: uploadError,
  } = await supabase.storage
    .from(GAGE_BUCKET)
    .upload(
      storagePath,
      file,
      {
        cacheControl: "3600",
        upsert: false,
        contentType:
          file.type,
      },
    );

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: insertedProof,
    error: insertError,
  } = await supabase
    .from(GAGE_PROOFS_TABLE)
    .insert({
      gage_id:
        gageId,

      uploaded_by:
        profileId,

      storage_path:
        storagePath,

      file_name:
        file.name,

      mime_type:
        file.type,

      file_size:
        file.size,
    })
    .select()
    .single();

  if (insertError) {
    await supabase.storage
      .from(GAGE_BUCKET)
      .remove([
        storagePath,
      ]);

    throw insertError;
  }

  const {
    data: signedUrlData,
    error: signedUrlError,
  } = await supabase.storage
    .from(GAGE_BUCKET)
    .createSignedUrl(
      storagePath,
      60 * 60,
    );

  if (signedUrlError) {
    console.error(
      "Impossible de créer l’URL signée :",
      signedUrlError,
    );
  }

  return {
    ...normalizeProof(
      insertedProof,
    ),

    signedUrl:
      signedUrlData?.signedUrl ??
      null,
  };
}

export async function deleteGageProof(
  proof,
) {
  const proofId =
    proof?.id;

  const storagePath =
    proof?.storagePath ??
    proof?.storage_path;

  if (!proofId) {
    throw new Error(
      "Preuve introuvable.",
    );
  }

  if (storagePath) {
    const {
      error: storageError,
    } = await supabase.storage
      .from(GAGE_BUCKET)
      .remove([
        storagePath,
      ]);

    if (storageError) {
      throw storageError;
    }
  }

  const {
    error,
  } = await supabase
    .from(GAGE_PROOFS_TABLE)
    .delete()
    .eq(
      "id",
      proofId,
    );

  if (error) {
    throw error;
  }
}

export async function deleteGage(
  gageId,
) {
  if (!gageId) {
    throw new Error(
      "Identifiant du gage manquant.",
    );
  }

  const {
    data: proofs,
    error: proofsError,
  } = await supabase
    .from(GAGE_PROOFS_TABLE)
    .select(
      "storage_path",
    )
    .eq(
      "gage_id",
      gageId,
    );

  if (proofsError) {
    throw proofsError;
  }

  const storagePaths =
    (proofs ?? [])
      .map(
        (proof) =>
          proof.storage_path,
      )
      .filter(Boolean);

  if (
    storagePaths.length >
    0
  ) {
    const {
      error: storageError,
    } = await supabase.storage
      .from(GAGE_BUCKET)
      .remove(
        storagePaths,
      );

    if (storageError) {
      throw storageError;
    }
  }

  const {
    error,
  } = await supabase
    .from(GAGES_TABLE)
    .delete()
    .eq(
      "id",
      gageId,
    );

  if (error) {
    throw error;
  }
}
