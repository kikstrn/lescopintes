import { supabase } from "../lib/supabase";

const EVENT_SELECT = `
  id,
  created_by,
  title,
  description,
  event_type,
  location,
  starts_at,
  ends_at,
  distance_km,
  elevation_m,
  status,
  created_at,
  updated_at,
  creator:profiles!events_created_by_fkey (
    id,
    first_name,
    nickname,
    initials,
    role
  ),
  participants:event_participants (
    id,
    profile_id,
    attendance_status,
    created_at,
    profile:profiles!event_participants_profile_id_fkey (
      id,
      first_name,
      nickname,
      initials,
      avatar_url
    )
  )
`;

const EVENT_TYPE_LABELS = {
  tennis: "Tennis",
  bike: "Cyclisme",
  party: "Apéro",
  barbecue: "Barbecue",
  other: "Autre",
};

const EVENT_ACCENTS = {
  tennis: "green",
  bike: "blue",
  party: "amber",
  barbecue: "orange",
  other: "purple",
};

const STATUS_LABELS = {
  draft: "Brouillon",
  confirmed: "Confirmé",
  cancelled: "Annulé",
  completed: "Terminé",
};

function formatEventDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(value));
}

function formatEventTime(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function mapParticipant(participant) {
  return {
    id: participant.id,
    profileId: participant.profile_id,
    attendanceStatus: participant.attendance_status,
    createdAt: participant.created_at,
    profile: participant.profile
      ? {
          id: participant.profile.id,
          firstName: participant.profile.first_name,
          nickname: participant.profile.nickname,
          initials:
            participant.profile.initials ??
            participant.profile.nickname?.slice(0, 2).toUpperCase() ??
            "CP",
          avatarUrl: participant.profile.avatar_url,
        }
      : null,
  };
}

export function mapEvent(event) {
  if (!event) {
    return null;
  }

  const participantDetails = (event.participants ?? []).map(
    mapParticipant,
  );

  const goingParticipants = participantDetails.filter(
    (participant) => participant.attendanceStatus === "going",
  );

  return {
    id: event.id,
    createdBy: event.created_by,
    title: event.title,
    description: event.description ?? "",
    type: event.event_type,
    typeLabel:
      EVENT_TYPE_LABELS[event.event_type] ?? "Événement",
    location: event.location ?? "",
    startsAt: event.starts_at,
    endsAt: event.ends_at,
    distance: Number(event.distance_km ?? 0),
    elevation: Number(event.elevation_m ?? 0),
    status: event.status,
    statusLabel:
      STATUS_LABELS[event.status] ?? event.status,
    accent:
      EVENT_ACCENTS[event.event_type] ?? "purple",
    date: formatEventDate(event.starts_at),
    time: formatEventTime(event.starts_at),
    endTime: formatEventTime(event.ends_at),
    creator: event.creator
      ? {
          id: event.creator.id,
          firstName: event.creator.first_name,
          nickname: event.creator.nickname,
          initials:
            event.creator.initials ??
            event.creator.nickname?.slice(0, 2).toUpperCase() ??
            "CP",
          role: event.creator.role,
        }
      : null,
    participantDetails,
    participants: goingParticipants
      .map((participant) => participant.profile?.nickname)
      .filter(Boolean),
    goingCount: goingParticipants.length,
    maybeCount: participantDetails.filter(
      (participant) =>
        participant.attendanceStatus === "maybe",
    ).length,
    notGoingCount: participantDetails.filter(
      (participant) =>
        participant.attendanceStatus === "not_going",
    ).length,
    createdAt: event.created_at,
    updatedAt: event.updated_at,
  };
}

export async function getEvents() {
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .order("starts_at", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapEvent);
}

export async function getEventById(eventId) {
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("id", eventId)
    .single();

  if (error) {
    throw error;
  }

  return mapEvent(data);
}

export async function createEvent({
  createdBy,
  title,
  description,
  eventType,
  location,
  startsAt,
  endsAt,
  distanceKm,
  elevationM,
  status = "confirmed",
}) {
  if (!createdBy) {
    throw new Error("Utilisateur connecté introuvable.");
  }

  const payload = {
    created_by: createdBy,
    title: title.trim(),
    description: description?.trim() || null,
    event_type: eventType,
    location: location?.trim() || null,
    starts_at: startsAt,
    ends_at: endsAt || null,
    distance_km:
      eventType === "bike" && distanceKm !== ""
        ? Number(distanceKm)
        : null,
    elevation_m:
      eventType === "bike" && elevationM !== ""
        ? Number(elevationM)
        : null,
    status,
  };

  const { data, error } = await supabase
    .from("events")
    .insert(payload)
    .select(EVENT_SELECT)
    .single();

  if (error) {
    throw error;
  }

  /*
   * L’organisateur est automatiquement inscrit comme présent.
   */
  const { error: participantError } = await supabase
    .from("event_participants")
    .upsert(
      {
        event_id: data.id,
        profile_id: createdBy,
        attendance_status: "going",
      },
      {
        onConflict: "event_id,profile_id",
      },
    );

  if (participantError) {
    console.error(
      "L’événement a été créé, mais la participation automatique a échoué :",
      participantError,
    );
  }

  return getEventById(data.id);
}

export async function updateEvent(eventId, updates) {
  const payload = {
    title: updates.title.trim(),
    description: updates.description?.trim() || null,
    event_type: updates.eventType,
    location: updates.location?.trim() || null,
    starts_at: updates.startsAt,
    ends_at: updates.endsAt || null,
    distance_km:
      updates.eventType === "bike" &&
      updates.distanceKm !== ""
        ? Number(updates.distanceKm)
        : null,
    elevation_m:
      updates.eventType === "bike" &&
      updates.elevationM !== ""
        ? Number(updates.elevationM)
        : null,
    status: updates.status ?? "confirmed",
  };

  const { data, error } = await supabase
    .from("events")
    .update(payload)
    .eq("id", eventId)
    .select(EVENT_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return mapEvent(data);
}

export async function deleteEvent(eventId) {
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId);

  if (error) {
    throw error;
  }
}

export async function setAttendance({
  eventId,
  profileId,
  attendanceStatus,
}) {
  if (!profileId) {
    throw new Error("Profil utilisateur introuvable.");
  }

  const { data, error } = await supabase
    .from("event_participants")
    .upsert(
      {
        event_id: eventId,
        profile_id: profileId,
        attendance_status: attendanceStatus,
      },
      {
        onConflict: "event_id,profile_id",
      },
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function removeAttendance({
  eventId,
  profileId,
}) {
  const { error } = await supabase
    .from("event_participants")
    .delete()
    .eq("event_id", eventId)
    .eq("profile_id", profileId);

  if (error) {
    throw error;
  }
}