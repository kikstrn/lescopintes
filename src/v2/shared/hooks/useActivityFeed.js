import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../../../lib/supabase";

function sortActivities(items) {
  return [...items].sort((first, second) => {
    return (
      new Date(second.created_at).getTime() -
      new Date(first.created_at).getTime()
    );
  });
}

function normalizeActivity(activity) {
  return {
    id: activity.id,
    actorId:
      activity.actor_id ??
      null,

    activityType:
      activity.activity_type ??
      "general",

    title:
      activity.title ??
      "Nouvelle activité",

    message:
      activity.message ??
      null,

    entityType:
      activity.entity_type ??
      null,

    entityId:
      activity.entity_id ??
      null,

    pageId:
      activity.page_id ??
      "home",

    metadata:
      activity.metadata ??
      {},

    createdAt:
      activity.created_at,

    actor:
      activity.actor ?? null,
  };
}

export function useActivityFeed({
  limit = 30,
} = {}) {
  const [activities, setActivities] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const fetchActivities =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      const {
        data,
        error: fetchError,
      } = await supabase
        .from("activity_feed")
        .select(`
          id,
          actor_id,
          activity_type,
          title,
          message,
          entity_type,
          entity_id,
          page_id,
          metadata,
          created_at,
          actor:profiles!activity_feed_actor_id_fkey (
            id,
            nickname,
            first_name,
            initials,
            avatar_url
          )
        `)
        .order("created_at", {
          ascending: false,
        })
        .limit(limit);

      if (fetchError) {
        console.error(
          "Impossible de charger le flux d’activité :",
          fetchError,
        );

        setError(
          fetchError.message ??
            "Impossible de charger le flux d’activité.",
        );

        setLoading(false);
        return;
      }

      setActivities(
        sortActivities(
          data ?? [],
        ).map(normalizeActivity),
      );

      setLoading(false);
    }, [limit]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    const channel = supabase
      .channel("activity-feed")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activity_feed",
        },
        async (payload) => {
          const newActivity =
            payload.new;

          /*
           * Les données Realtime ne contiennent pas
           * automatiquement la relation actor:profiles.
           * On récupère donc l’entrée complète.
           */
          const {
            data,
            error: fetchError,
          } = await supabase
            .from("activity_feed")
            .select(`
              id,
              actor_id,
              activity_type,
              title,
              message,
              entity_type,
              entity_id,
              page_id,
              metadata,
              created_at,
              actor:profiles!activity_feed_actor_id_fkey (
                id,
                nickname,
                first_name,
                initials,
                avatar_url
              )
            `)
            .eq(
              "id",
              newActivity.id,
            )
            .maybeSingle();

          if (fetchError) {
            console.error(
              "Impossible de récupérer la nouvelle activité :",
              fetchError,
            );

            return;
          }

          if (!data) {
            return;
          }

          const normalized =
            normalizeActivity(data);

          setActivities(
            (currentActivities) => {
              const alreadyExists =
                currentActivities.some(
                  (activity) =>
                    activity.id ===
                    normalized.id,
                );

              if (alreadyExists) {
                return currentActivities;
              }

              return sortActivities([
                normalized,
                ...currentActivities,
              ]).slice(0, limit);
            },
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "activity_feed",
        },
        (payload) => {
          const updatedActivity =
            normalizeActivity(
              payload.new,
            );

          setActivities(
            (currentActivities) =>
              currentActivities.map(
                (activity) =>
                  activity.id ===
                  updatedActivity.id
                    ? {
                        ...activity,
                        ...updatedActivity,
                        actor:
                          activity.actor ??
                          null,
                      }
                    : activity,
              ),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "activity_feed",
        },
        (payload) => {
          const deletedId =
            payload.old?.id;

          if (!deletedId) {
            return;
          }

          setActivities(
            (currentActivities) =>
              currentActivities.filter(
                (activity) =>
                  activity.id !==
                  deletedId,
              ),
          );
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error(
            "Erreur Realtime du flux d’activité.",
          );
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  const recentActivities =
    useMemo(() => {
      return activities.slice(0, limit);
    }, [
      activities,
      limit,
    ]);

  return {
    activities: recentActivities,
    loading,
    error,

    refreshActivityFeed:
      fetchActivities,
  };
}

export default useActivityFeed;