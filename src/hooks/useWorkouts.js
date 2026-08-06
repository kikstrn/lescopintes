import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

import {
  createWorkoutSession,
  deleteWorkoutSession,
  getWorkoutExercises,
  getWorkoutSessions,
} from "../services/workoutService";

export function useWorkouts({
  profileId,
  isAdmin = false,
} = {}) {
  const [sessions, setSessions] =
    useState([]);

  const [exercises, setExercises] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState(null);

  const refreshTimeoutRef =
    useRef(null);

  const load = useCallback(
    async ({
      showLoading = true,
    } = {}) => {
      if (showLoading) {
        setLoading(true);
      }

      setError(null);

      try {
        const [
          sessionList,
          exerciseList,
        ] = await Promise.all([
          getWorkoutSessions(),
          getWorkoutExercises(),
        ]);

        setSessions(sessionList);
        setExercises(exerciseList);
      } catch (err) {
        console.error(err);

        setError(
          err?.message ??
            "Impossible de charger les données de musculation.",
        );
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [],
  );

  const scheduleRefresh =
    useCallback(() => {
      if (refreshTimeoutRef.current) {
        clearTimeout(
          refreshTimeoutRef.current,
        );
      }

      refreshTimeoutRef.current =
        setTimeout(() => {
          load({
            showLoading: false,
          });
        }, 180);
    }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const channel = supabase
      .channel("workout-module")

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workout_sessions",
        },
        scheduleRefresh,
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table:
            "workout_session_exercises",
        },
        scheduleRefresh,
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workout_sets",
        },
        scheduleRefresh,
      )

      .subscribe();

    return () => {
      if (
        refreshTimeoutRef.current
      ) {
        clearTimeout(
          refreshTimeoutRef.current,
        );
      }

      supabase.removeChannel(channel);
    };
  }, [scheduleRefresh]);

  const addSession = useCallback(
    async (values) => {
      setSaving(true);
      setError(null);

      try {
        const session =
          await createWorkoutSession({
            profileId,
            ...values,
          });

        await load({
          showLoading: false,
        });

        return session;
      } catch (err) {
        console.error(err);

        setError(
          err?.message ??
            "Impossible d’enregistrer la séance.",
        );

        throw err;
      } finally {
        setSaving(false);
      }
    },
    [load, profileId],
  );

  const removeSession =
    useCallback(
      async (sessionId) => {
        setSaving(true);
        setError(null);

        try {
          await deleteWorkoutSession({
            sessionId,
            profileId,
            isAdmin,
          });

          setSessions((current) =>
            current.filter(
              (session) =>
                session.id !== sessionId,
            ),
          );
        } catch (err) {
          console.error(err);

          setError(
            err?.message ??
              "Impossible de supprimer la séance.",
          );

          throw err;
        } finally {
          setSaving(false);
        }
      },
      [
        profileId,
        isAdmin,
      ],
    );

  const statistics = useMemo(() => {
    const now = new Date();

    const weekStart = new Date(now);
    weekStart.setDate(
      now.getDate() -
        ((now.getDay() + 6) % 7),
    );
    weekStart.setHours(0, 0, 0, 0);

    const weeklySessions =
      sessions.filter((session) => {
        const date = new Date(
          session.startedAt,
        );

        return date >= weekStart;
      });

    const totalVolume =
      weeklySessions.reduce(
        (total, session) =>
          total +
          Number(
            session.totalVolume ?? 0,
          ),
        0,
      );

    const totalMinutes =
      weeklySessions.reduce(
        (total, session) =>
          total +
          Number(
            session.durationMinutes ?? 0,
          ),
        0,
      );

    return {
      weeklySessions:
        weeklySessions.length,
      weeklyVolume: totalVolume,
      weeklyMinutes: totalMinutes,
      totalSessions: sessions.length,
    };
  }, [sessions]);

  return {
    sessions,
    exercises,
    statistics,
    loading,
    saving,
    error,
    refresh: load,
    addSession,
    removeSession,
  };
}

export default useWorkouts;
