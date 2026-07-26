import { supabase } from "../lib/supabase";

const BIKE_RIDE_SELECT = `
  id,
  created_by,
  title,
  description,
  ride_date,
  distance_km,
  elevation_m,
  duration_minutes,
  average_speed,
  location,
  route_data,
  status,
  created_at,
  updated_at,

  creator:profiles!bike_rides_created_by_fkey (
    id,
    first_name,
    nickname,
    initials,
    role
  ),

  participants:bike_ride_participants (
    id,
    profile_id,
    created_at,

    profile:profiles!bike_ride_participants_profile_id_fkey (
      id,
      first_name,
      nickname,
      initials,
      avatar_url
    )
  )
`;

function mapProfile(profile) {
  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    firstName: profile.first_name,
    nickname: profile.nickname,
    initials:
      profile.initials ??
      profile.nickname?.slice(0, 2).toUpperCase() ??
      "CP",
    avatarUrl: profile.avatar_url ?? null,
    role: profile.role ?? "member",
  };
}

function mapParticipant(participant) {
  return {
    id: participant.id,
    profileId: participant.profile_id,
    createdAt: participant.created_at,
    profile: mapProfile(participant.profile),
  };
}

export function mapBikeRide(ride) {
  if (!ride) {
    return null;
  }

  const participants = (ride.participants ?? []).map(
    mapParticipant,
  );

  return {
    id: ride.id,
    createdBy: ride.created_by,
    title: ride.title,
    description: ride.description ?? "",
    rideDate: ride.ride_date,
    distanceKm: Number(ride.distance_km ?? 0),
    elevationM: Number(ride.elevation_m ?? 0),
    durationMinutes:
      ride.duration_minutes === null
        ? null
        : Number(ride.duration_minutes),
    averageSpeed:
      ride.average_speed === null
        ? null
        : Number(ride.average_speed),
    location: ride.location ?? "",
    routeData: ride.route_data ?? null,
    status: ride.status ?? "completed",
    creator: mapProfile(ride.creator),
    participants,
    participantIds: participants.map(
      (participant) => participant.profileId,
    ),
    participantProfiles: participants
      .map((participant) => participant.profile)
      .filter(Boolean),
    createdAt: ride.created_at,
    updatedAt: ride.updated_at,
  };
}

export async function getBikeRides() {
  const { data, error } = await supabase
    .from("bike_rides")
    .select(BIKE_RIDE_SELECT)
    .order("ride_date", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapBikeRide);
}

export async function getBikeRideById(rideId) {
  if (!rideId) {
    throw new Error(
      "L’identifiant de la sortie est manquant.",
    );
  }

  const { data, error } = await supabase
    .from("bike_rides")
    .select(BIKE_RIDE_SELECT)
    .eq("id", rideId)
    .single();

  if (error) {
    throw error;
  }

  return mapBikeRide(data);
}

function createRidePayload(values) {
  return {
    title: values.title.trim(),
    description: values.description?.trim() || null,
    ride_date: values.rideDate,
    distance_km: Number(values.distanceKm ?? 0),
    elevation_m: Number(values.elevationM ?? 0),
    duration_minutes:
      values.durationMinutes === "" ||
      values.durationMinutes === null ||
      values.durationMinutes === undefined
        ? null
        : Number(values.durationMinutes),
    average_speed:
      values.averageSpeed === "" ||
      values.averageSpeed === null ||
      values.averageSpeed === undefined
        ? null
        : Number(values.averageSpeed),
    location: values.location?.trim() || null,
    route_data: values.routeData ?? null,
    status: values.status ?? "completed",
  };
}

async function replaceRideParticipants({
  rideId,
  participantIds,
}) {
  const uniqueParticipantIds = [
    ...new Set(participantIds.filter(Boolean)),
  ];

  const { error: deleteError } = await supabase
    .from("bike_ride_participants")
    .delete()
    .eq("ride_id", rideId);

  if (deleteError) {
    throw deleteError;
  }

  if (uniqueParticipantIds.length === 0) {
    return;
  }

  const rows = uniqueParticipantIds.map(
    (profileId) => ({
      ride_id: rideId,
      profile_id: profileId,
    }),
  );

  const { error: insertError } = await supabase
    .from("bike_ride_participants")
    .insert(rows);

  if (insertError) {
    throw insertError;
  }
}

export async function createBikeRide({
  createdBy,
  participantIds = [],
  ...values
}) {
  if (!createdBy) {
    throw new Error(
      "Utilisateur connecté introuvable.",
    );
  }

  if (!values.title?.trim()) {
    throw new Error(
      "Le titre de la sortie est obligatoire.",
    );
  }

  if (!values.rideDate) {
    throw new Error(
      "La date de la sortie est obligatoire.",
    );
  }

  const payload = {
    ...createRidePayload(values),
    created_by: createdBy,
  };

  const { data, error } = await supabase
    .from("bike_rides")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  /*
   * Le créateur est automatiquement ajouté
   * aux participants.
   */
  await replaceRideParticipants({
    rideId: data.id,
    participantIds: [
      createdBy,
      ...participantIds,
    ],
  });

  return getBikeRideById(data.id);
}

export async function updateBikeRide(
  rideId,
  {
    participantIds = [],
    ...values
  },
) {
  if (!rideId) {
    throw new Error(
      "L’identifiant de la sortie est manquant.",
    );
  }

  if (!values.title?.trim()) {
    throw new Error(
      "Le titre de la sortie est obligatoire.",
    );
  }

  const payload = createRidePayload(values);

  const { error } = await supabase
    .from("bike_rides")
    .update(payload)
    .eq("id", rideId);

  if (error) {
    throw error;
  }

  await replaceRideParticipants({
    rideId,
    participantIds,
  });

  return getBikeRideById(rideId);
}

export async function deleteBikeRide(rideId) {
  if (!rideId) {
    throw new Error(
      "L’identifiant de la sortie est manquant.",
    );
  }

  const { error } = await supabase
    .from("bike_rides")
    .delete()
    .eq("id", rideId);

  if (error) {
    throw error;
  }
}

export async function joinBikeRide({
  rideId,
  profileId,
}) {
  if (!rideId || !profileId) {
    throw new Error(
      "La sortie ou le profil est introuvable.",
    );
  }

  const { error } = await supabase
    .from("bike_ride_participants")
    .upsert(
      {
        ride_id: rideId,
        profile_id: profileId,
      },
      {
        onConflict: "ride_id,profile_id",
      },
    );

  if (error) {
    throw error;
  }
}

export async function leaveBikeRide({
  rideId,
  profileId,
}) {
  if (!rideId || !profileId) {
    throw new Error(
      "La sortie ou le profil est introuvable.",
    );
  }

  const { error } = await supabase
    .from("bike_ride_participants")
    .delete()
    .eq("ride_id", rideId)
    .eq("profile_id", profileId);

  if (error) {
    throw error;
  }
}