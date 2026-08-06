import { supabase } from "../lib/supabase";

const SESSION_SELECT = `
  id,
  profile_id,
  title,
  started_at,
  ended_at,
  notes,
  created_at,
  updated_at,

  profile:profiles!workout_sessions_profile_id_fkey (
    id,
    first_name,
    nickname,
    initials,
    avatar_url
  ),

  exercises:workout_session_exercises (
    id,
    exercise_id,
    position,
    notes,

    exercise:workout_exercises (
      id,
      name,
      muscle_group,
      equipment
    ),

    sets:workout_sets (
      id,
      set_number,
      weight_kg,
      repetitions,
      duration_seconds,
      distance_meters,
      completed
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
  };
}

function mapSet(set) {
  return {
    id: set.id,
    setNumber: Number(set.set_number ?? 1),
    weightKg:
      set.weight_kg === null
        ? null
        : Number(set.weight_kg),
    repetitions:
      set.repetitions === null
        ? null
        : Number(set.repetitions),
    durationSeconds:
      set.duration_seconds === null
        ? null
        : Number(set.duration_seconds),
    distanceMeters:
      set.distance_meters === null
        ? null
        : Number(set.distance_meters),
    completed: Boolean(set.completed),
  };
}

function mapSessionExercise(item) {
  return {
    id: item.id,
    exerciseId: item.exercise_id,
    position: Number(item.position ?? 0),
    notes: item.notes ?? "",
    exercise: {
      id: item.exercise?.id ?? item.exercise_id,
      name: item.exercise?.name ?? "Exercice",
      muscleGroup:
        item.exercise?.muscle_group ?? "Autre",
      equipment:
        item.exercise?.equipment ?? null,
    },
    sets: (item.sets ?? [])
      .map(mapSet)
      .sort(
        (first, second) =>
          first.setNumber - second.setNumber,
      ),
  };
}

export function mapWorkoutSession(session) {
  if (!session) {
    return null;
  }

  const exercises = (session.exercises ?? [])
    .map(mapSessionExercise)
    .sort(
      (first, second) =>
        first.position - second.position,
    );

  const totalVolume = exercises.reduce(
    (sessionTotal, item) =>
      sessionTotal +
      item.sets.reduce(
        (exerciseTotal, set) =>
          exerciseTotal +
          Number(set.weightKg ?? 0) *
            Number(set.repetitions ?? 0),
        0,
      ),
    0,
  );

  const completedSets = exercises.reduce(
    (total, item) =>
      total +
      item.sets.filter(
        (set) => set.completed,
      ).length,
    0,
  );

  const startedAt = session.started_at
    ? new Date(session.started_at)
    : null;

  const endedAt = session.ended_at
    ? new Date(session.ended_at)
    : null;

  const durationMinutes =
    startedAt && endedAt
      ? Math.max(
          0,
          Math.round(
            (endedAt.getTime() -
              startedAt.getTime()) /
              60000,
          ),
        )
      : null;

  return {
    id: session.id,
    profileId: session.profile_id,
    title: session.title,
    startedAt: session.started_at,
    endedAt: session.ended_at,
    notes: session.notes ?? "",
    profile: mapProfile(session.profile),
    exercises,
    totalVolume,
    completedSets,
    durationMinutes,
    createdAt: session.created_at,
    updatedAt: session.updated_at,
  };
}

export async function getWorkoutExercises() {
  const { data, error } = await supabase
    .from("workout_exercises")
    .select(
      `
        id,
        name,
        muscle_group,
        equipment,
        is_active,
        created_at
      `,
    )
    .eq("is_active", true)
    .order("muscle_group")
    .order("name");

  if (error) {
    throw error;
  }

  return (data ?? []).map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    muscleGroup: exercise.muscle_group,
    equipment: exercise.equipment ?? null,
    isActive: Boolean(exercise.is_active),
    createdAt: exercise.created_at,
  }));
}

export async function getWorkoutSessions({
  limit = 100,
} = {}) {
  const { data, error } = await supabase
    .from("workout_sessions")
    .select(SESSION_SELECT)
    .order("started_at", {
      ascending: false,
    })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapWorkoutSession);
}

export async function createWorkoutSession({
  profileId,
  title,
  startedAt,
  endedAt,
  notes,
  exercises = [],
}) {
  if (!profileId) {
    throw new Error(
      "Le profil connecté est introuvable.",
    );
  }

  if (!title?.trim()) {
    throw new Error(
      "Le nom de la séance est obligatoire.",
    );
  }

  const { data: session, error } = await supabase
    .from("workout_sessions")
    .insert({
      profile_id: profileId,
      title: title.trim(),
      started_at:
        startedAt ?? new Date().toISOString(),
      ended_at:
        endedAt ?? new Date().toISOString(),
      notes: notes?.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  for (
    let position = 0;
    position < exercises.length;
    position += 1
  ) {
    const item = exercises[position];

    const {
      data: sessionExercise,
      error: exerciseError,
    } = await supabase
      .from("workout_session_exercises")
      .insert({
        session_id: session.id,
        exercise_id: item.exerciseId,
        position,
        notes: item.notes?.trim() || null,
      })
      .select("id")
      .single();

    if (exerciseError) {
      throw exerciseError;
    }

    const setRows = (item.sets ?? []).map(
      (set, setIndex) => ({
        session_exercise_id:
          sessionExercise.id,
        set_number: setIndex + 1,
        weight_kg:
          set.weightKg === ""
            ? null
            : Number(set.weightKg ?? 0),
        repetitions:
          set.repetitions === ""
            ? null
            : Number(set.repetitions ?? 0),
        completed:
          set.completed !== false,
      }),
    );

    if (setRows.length > 0) {
      const { error: setsError } =
        await supabase
          .from("workout_sets")
          .insert(setRows);

      if (setsError) {
        throw setsError;
      }
    }
  }

  return getWorkoutSessionById(session.id);
}

export async function getWorkoutSessionById(
  sessionId,
) {
  const { data, error } = await supabase
    .from("workout_sessions")
    .select(SESSION_SELECT)
    .eq("id", sessionId)
    .single();

  if (error) {
    throw error;
  }

  return mapWorkoutSession(data);
}

export async function deleteWorkoutSession({
  sessionId,
  profileId,
  isAdmin = false,
}) {
  if (!sessionId) {
    throw new Error(
      "La séance à supprimer est introuvable.",
    );
  }

  let query = supabase
    .from("workout_sessions")
    .delete()
    .eq("id", sessionId);

  if (!isAdmin) {
    query = query.eq(
      "profile_id",
      profileId,
    );
  }

  const { error } = await query;

  if (error) {
    throw error;
  }
}
