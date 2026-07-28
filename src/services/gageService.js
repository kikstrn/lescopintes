import { supabase } from "../lib/supabase";

const GAGES_TABLE = "gages";
const GAGE_PROOFS_TABLE = "gage_proofs";
const GAGE_BUCKET = "gage-proofs";

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

    assignedProfile: normalizeProfile(
      row.assignedProfile,
    ),

    createdByProfile: normalizeProfile(
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
      allProofs.map(async (proof) => {
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
      }),
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
  const { data, error } =
    await supabase
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
  const { data, error } =
    await supabase
      .from(GAGES_TABLE)
      .insert({
        assigned_profile_id:
          payload.assignedProfileId,

        created_by:
          payload.createdBy,

        title:
          payload.title.trim(),

        description:
          payload.description.trim(),

        due_date:
          payload.dueDate || null,

        status:
          payload.status ?? "pending",
      })
      .select()
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
  const updatePayload = {
    status,
  };

  if (status === "in_progress") {
    updatePayload.started_at =
      new Date().toISOString();
  }

  if (status === "completed") {
    updatePayload.completed_at =
      new Date().toISOString();
  }

  if (status === "validated") {
    updatePayload.validated_at =
      new Date().toISOString();
  }

  if (status === "cancelled") {
    updatePayload.cancelled_at =
      new Date().toISOString();
  }

  const { data, error } =
    await supabase
      .from(GAGES_TABLE)
      .update(updatePayload)
      .eq("id", gageId)
      .select()
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

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Le fichier doit être une image JPEG, PNG ou WebP.",
    );
  }

  const maxFileSize =
    10 * 1024 * 1024;

  if (file.size > maxFileSize) {
    throw new Error(
      "L’image ne doit pas dépasser 10 Mo.",
    );
  }

  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() || "jpg";

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
        contentType: file.type,
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
      gage_id: gageId,
      uploaded_by: profileId,
      storage_path: storagePath,
      file_name: file.name,
      mime_type: file.type,
      file_size: file.size,
    })
    .select()
    .single();

  if (insertError) {
    await supabase.storage
      .from(GAGE_BUCKET)
      .remove([storagePath]);

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
      .remove([storagePath]);

    if (storageError) {
      throw storageError;
    }
  }

  const { error } =
    await supabase
      .from(GAGE_PROOFS_TABLE)
      .delete()
      .eq("id", proofId);

  if (error) {
    throw error;
  }
}

export async function deleteGage(
  gageId,
) {
  const { data: proofs } =
    await supabase
      .from(GAGE_PROOFS_TABLE)
      .select(
        "storage_path",
      )
      .eq("gage_id", gageId);

  const storagePaths =
    (proofs ?? [])
      .map(
        (proof) =>
          proof.storage_path,
      )
      .filter(Boolean);

  if (storagePaths.length > 0) {
    const {
      error: storageError,
    } = await supabase.storage
      .from(GAGE_BUCKET)
      .remove(storagePaths);

    if (storageError) {
      throw storageError;
    }
  }

  const { error } =
    await supabase
      .from(GAGES_TABLE)
      .delete()
      .eq("id", gageId);

  if (error) {
    throw error;
  }
}