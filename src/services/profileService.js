import { supabase } from "../lib/supabase";

const AVATAR_BUCKET = "avatars";

const PROFILE_SELECT = `
  id,
  first_name,
  nickname,
  initials,
  role,
  bio,
  avatar_url,
  avatar_path,
  birth_date,
  created_at,
  updated_at
`;

function mapProfile(profile) {
  if (!profile) {
    return null;
  }

  return {
    id: profile.id,

    firstName:
      profile.first_name ?? "",

    nickname:
      profile.nickname ??
      profile.first_name ??
      "Membre",

    initials:
      profile.initials ??
      profile.nickname
        ?.slice(0, 2)
        .toUpperCase() ??
      profile.first_name
        ?.slice(0, 2)
        .toUpperCase() ??
      "CP",

    role:
      profile.role ?? "member",

    bio:
      profile.bio ?? "",

    avatarUrl:
      profile.avatar_url ?? null,

    avatarPath:
      profile.avatar_path ?? null,

    birthDate:
      profile.birth_date ?? "",

    createdAt:
      profile.created_at ?? null,

    updatedAt:
      profile.updated_at ?? null,
  };
}

function sanitizeFileName(fileName) {
  return fileName
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .replace(
      /[^a-zA-Z0-9._-]/g,
      "-",
    )
    .replace(/-+/g, "-")
    .toLowerCase();
}

function createAvatarPath({
  profileId,
  file,
}) {
  const extension =
    file.name.split(".").pop() ??
    "jpg";

  const fileName =
    sanitizeFileName(
      file.name.replace(
        /\.[^/.]+$/,
        "",
      ),
    );

  return `${profileId}/${crypto.randomUUID()}-${fileName}.${extension}`;
}

export async function getProfile(
  profileId,
) {
  if (!profileId) {
    throw new Error(
      "Identifiant du profil manquant.",
    );
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", profileId)
    .single();

  if (error) {
    throw error;
  }

  return mapProfile(data);
}

export async function getProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .order("nickname");

  if (error) {
    throw error;
  }

  return data.map(mapProfile);
}

export async function updateProfile(
  profileId,
  {
    firstName,
    nickname,
    initials,
    bio,
    birthDate,
  },
) {
  if (!profileId) {
    throw new Error(
      "Identifiant du profil manquant.",
    );
  }

  const cleanedFirstName =
    firstName?.trim() ?? "";

  const cleanedNickname =
    nickname?.trim() ?? "";

  const cleanedInitials =
    initials
      ?.trim()
      .slice(0, 3)
      .toUpperCase() ?? "";

  const cleanedBio =
    bio?.trim() ?? "";

  const cleanedBirthDate =
    birthDate?.trim() ?? "";

  if (
    cleanedBirthDate &&
    !/^\d{4}-\d{2}-\d{2}$/.test(
      cleanedBirthDate,
    )
  ) {
    throw new Error(
      "La date de naissance est invalide.",
    );
  }

  if (cleanedBirthDate) {
    const birthDateValue =
      new Date(
        `${cleanedBirthDate}T00:00:00`,
      );

    const today = new Date();

    if (
      Number.isNaN(
        birthDateValue.getTime(),
      ) ||
      birthDateValue > today
    ) {
      throw new Error(
        "La date de naissance ne peut pas être dans le futur.",
      );
    }
  }

  if (!cleanedFirstName) {
    throw new Error(
      "Le prénom est obligatoire.",
    );
  }

  if (!cleanedNickname) {
    throw new Error(
      "Le pseudo est obligatoire.",
    );
  }

  if (!cleanedInitials) {
    throw new Error(
      "Les initiales sont obligatoires.",
    );
  }

  if (cleanedBio.length > 300) {
    throw new Error(
      "La bio ne peut pas dépasser 300 caractères.",
    );
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      first_name:
        cleanedFirstName,

      nickname:
        cleanedNickname,

      initials:
        cleanedInitials,

      bio:
        cleanedBio || null,

      birth_date:
        cleanedBirthDate || null,
    })
    .eq("id", profileId)
    .select(PROFILE_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return mapProfile(data);
}

export async function uploadAvatar({
  profileId,
  file,
  previousAvatarPath = null,
}) {
  if (!profileId) {
    throw new Error(
      "Identifiant du profil manquant.",
    );
  }

  if (!file) {
    throw new Error(
      "Aucune image sélectionnée.",
    );
  }

  const acceptedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (
    !acceptedTypes.includes(
      file.type,
    )
  ) {
    throw new Error(
      "Le format de l’image doit être JPEG, PNG ou WebP.",
    );
  }

  const maxFileSize =
    5 * 1024 * 1024;

  if (
    file.size >
    maxFileSize
  ) {
    throw new Error(
      "L’image ne doit pas dépasser 5 Mo.",
    );
  }

  const avatarPath =
    createAvatarPath({
      profileId,
      file,
    });

  const { error: uploadError } =
    await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(
        avatarPath,
        file,
        {
          contentType:
            file.type,
          cacheControl:
            "3600",
          upsert: false,
        },
      );

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: publicUrlData,
  } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(
      avatarPath,
    );

  const avatarUrl =
    publicUrlData.publicUrl;

  try {
    const { data, error } =
      await supabase
        .from("profiles")
        .update({
          avatar_path:
            avatarPath,

          avatar_url:
            avatarUrl,
        })
        .eq(
          "id",
          profileId,
        )
        .select(
          PROFILE_SELECT,
        )
        .single();

    if (error) {
      throw error;
    }

    if (
      previousAvatarPath &&
      previousAvatarPath !==
        avatarPath
    ) {
      const {
        error:
          deletePreviousError,
      } = await supabase.storage
        .from(
          AVATAR_BUCKET,
        )
        .remove([
          previousAvatarPath,
        ]);

      if (
        deletePreviousError
      ) {
        console.error(
          "Impossible de supprimer l’ancien avatar :",
          deletePreviousError,
        );
      }
    }

    return mapProfile(data);
  } catch (error) {
    await supabase.storage
      .from(AVATAR_BUCKET)
      .remove([
        avatarPath,
      ]);

    throw error;
  }
}

export async function deleteAvatar({
  profileId,
  avatarPath,
}) {
  if (!profileId) {
    throw new Error(
      "Identifiant du profil manquant.",
    );
  }

  if (avatarPath) {
    const {
      error: storageError,
    } = await supabase.storage
      .from(AVATAR_BUCKET)
      .remove([
        avatarPath,
      ]);

    if (storageError) {
      throw storageError;
    }
  }

  const { data, error } =
    await supabase
      .from("profiles")
      .update({
        avatar_path:
          null,

        avatar_url:
          null,
      })
      .eq(
        "id",
        profileId,
      )
      .select(
        PROFILE_SELECT,
      )
      .single();

  if (error) {
    throw error;
  }

  return mapProfile(data);
}

export async function changePassword(
  newPassword,
) {
  if (!newPassword) {
    throw new Error(
      "Le nouveau mot de passe est obligatoire.",
    );
  }

  if (
    newPassword.length < 8
  ) {
    throw new Error(
      "Le mot de passe doit contenir au moins 8 caractères.",
    );
  }

  const { error } =
    await supabase.auth.updateUser({
      password:
        newPassword,
    });

  if (error) {
    throw error;
  }
}

export async function getProfileStatistics(profileId) {
  if (!profileId) {
    throw new Error(
      "Identifiant du profil manquant.",
    );
  }

  const [
    tennisResult,
    bikeResult,
    photoResult,
    likesResult,
  ] = await Promise.all([
    supabase
      .from("tennis_matches")
      .select("*")
      .or(
        [
          `player_one_id.eq.${profileId}`,
          `player_two_id.eq.${profileId}`,
          `player_three_id.eq.${profileId}`,
          `player_four_id.eq.${profileId}`,
        ].join(","),
      ),

    supabase
      .from("bike_ride_participants")
      .select(`
        ride_id,
        bike_rides (
          id,
          distance_km,
          elevation_m,
          status
        )
      `)
      .eq("profile_id", profileId),

    supabase
      .from("gallery_photos")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("uploaded_by", profileId),

    supabase
      .from("gallery_likes")
      .select(`
        photo_id,
        gallery_photos!inner (
          uploaded_by
        )
      `, {
        count: "exact",
      })
      .eq(
        "gallery_photos.uploaded_by",
        profileId,
      ),
  ]);

  if (tennisResult.error) {
    throw tennisResult.error;
  }

  if (bikeResult.error) {
    throw bikeResult.error;
  }

  if (photoResult.error) {
    throw photoResult.error;
  }

  if (likesResult.error) {
    throw likesResult.error;
  }

  const tennisRows =
    tennisResult.data ?? [];

  const bikeRows =
    bikeResult.data ?? [];

  const tennisWins = tennisRows.filter(
    (match) => {
      const playerIsTeamOne =
        match.player_one_id === profileId ||
        match.player_two_id === profileId;

      const playerIsTeamTwo =
        match.player_three_id === profileId ||
        match.player_four_id === profileId;

      return (
        (playerIsTeamOne &&
          Number(match.winner_team) === 1) ||
        (playerIsTeamTwo &&
          Number(match.winner_team) === 2)
      );
    },
  ).length;

  const completedBikeRides =
    bikeRows.filter(
      (row) =>
        row.bike_rides?.status ===
        "completed",
    );

  const bikeDistance =
    completedBikeRides.reduce(
      (total, row) =>
        total +
        Number(
          row.bike_rides?.distance_km ?? 0,
        ),
      0,
    );

  const bikeElevation =
    completedBikeRides.reduce(
      (total, row) =>
        total +
        Number(
          row.bike_rides?.elevation_m ?? 0,
        ),
      0,
    );

  return {
    tennisMatches: tennisRows.length,

    tennisWins,

    tennisWinRate:
      tennisRows.length > 0
        ? Math.round(
            (tennisWins /
              tennisRows.length) *
              100,
          )
        : 0,

    bikeRideCount:
      completedBikeRides.length,

    bikeDistance,
    bikeElevation,

    photoCount:
      photoResult.count ?? 0,

    receivedLikeCount:
      likesResult.count ?? 0,
  };
}