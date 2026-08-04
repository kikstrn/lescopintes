import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../../../lib/supabase";

function normalizeBadge(row) {
  return {
    id: row.id,
    profileId:
      row.profile_id,

    badgeId:
      row.badge_id,

    code:
      row.code,

    name:
      row.name,

    description:
      row.description ?? "",

    category:
      row.category,

    icon:
      row.icon ?? "award",

    threshold:
      Number(
        row.threshold ?? 0,
      ),

    awardedAt:
      row.awarded_at,

    metadata:
      row.metadata ?? {},
  };
}

function getBadgeCurrentValue(
  badge,
  progress,
) {
  if (!progress) {
    return 0;
  }

  const valuesByCode = {
    points_100:
      progress.total_points,

    points_500:
      progress.total_points,

    points_1000:
      progress.total_points,

    tennis_first_match:
      progress.tennis_matches,

    tennis_10_matches:
      progress.tennis_matches,

    tennis_first_win:
      progress.tennis_wins,

    tennis_10_wins:
      progress.tennis_wins,

    tennis_1600_elo:
      progress.tennis_elo,

    bike_first_ride:
      progress.bike_rides,

    bike_10_rides:
      progress.bike_rides,

    bike_100_km:
      progress.bike_distance,

    bike_500_km:
      progress.bike_distance,

    bike_1000_km:
      progress.bike_distance,

    bike_single_100_km:
      progress.bike_longest_ride,

    event_first:
      progress.event_attended,

    event_5:
      progress.event_attended,

    event_20:
      progress.event_attended,

    event_first_created:
      progress.event_created,

    event_10_created:
      progress.event_created,

    gage_first:
      progress.validated_gages,

    gage_5:
      progress.validated_gages,

    challenge_first:
      progress.validated_challenges,

    challenge_5:
      progress.validated_challenges,

    walking_first_day:
      progress.walking_days,

    walking_100k:
      progress.walking_total_steps,

    walking_500k:
      progress.walking_total_steps,

    walking_1m:
      progress.walking_total_steps,

    walking_10k_day:
      progress.walking_best_day,

    walking_20k_day:
      progress.walking_best_day,
  };

  return Number(
    valuesByCode[badge.code] ??
    0,
  );
}

export function useProfileBadges(
  profileId,
) {
  const [badges, setBadges] =
    useState([]);

  const [allBadges, setAllBadges] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [progress, setProgress] =
    useState(null);

  const fetchBadges =
    useCallback(async () => {
      if (!profileId) {
        setBadges([]);
        setAllBadges([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [
          awardedResult,
          progressResult,
          allResult,
          walkingProgressResult,
        ] = await Promise.all([
          supabase
            .from(
              "profile_badges_details",
            )
            .select(`
              id,
              profile_id,
              badge_id,
              awarded_at,
              metadata,
              code,
              name,
              description,
              category,
              icon,
              threshold
            `)
            .eq(
              "profile_id",
              profileId,
            )
            .order(
              "awarded_at",
              {
                ascending: false,
              },
            ),
          supabase
            .from("profile_badge_progress")
            .select("*")
            .eq("profile_id", profileId)
            .maybeSingle(),
          supabase
            .from("badges")
            .select(`
              id,
              code,
              name,
              description,
              category,
              icon,
              threshold
            `)
            .eq(
              "is_active",
              true,
            )
            .order(
              "category",
              {
                ascending: true,
              },
            )
            .order(
              "threshold",
              {
                ascending: true,
              },
            ),
          supabase.rpc(
            "get_profile_walking_badge_progress",
            {
              p_profile_id:
                profileId,
            },
          ),
        ]);

        if (
          awardedResult.error
        ) {
          throw awardedResult.error;
        }

        if (progressResult.error) {
          throw progressResult.error;
        }

        if (allResult.error) {
          throw allResult.error;
        }

        if (
          walkingProgressResult.error
        ) {
          throw walkingProgressResult.error;
        }

        setBadges(
          (
            awardedResult.data ??
            []
          ).map(normalizeBadge),
        );

        const walkingProgress =
          Array.isArray(
            walkingProgressResult.data,
          )
            ? walkingProgressResult
                .data[0] ??
              {}
            : walkingProgressResult
                .data ??
              {};

        setProgress({
          ...(
            progressResult.data ??
            {}
          ),

          walking_days:
            Number(
              walkingProgress
                .walking_days ??
              0,
            ),

          walking_total_steps:
            Number(
              walkingProgress
                .walking_total_steps ??
              0,
            ),

          walking_best_day:
            Number(
              walkingProgress
                .walking_best_day ??
              0,
            ),
        });

        setAllBadges(
          (
            allResult.data ??
            []
          ).map(
            (badge) => ({
              id: badge.id,
              code: badge.code,
              name: badge.name,
              description:
                badge.description ??
                "",
              category:
                badge.category,
              icon:
                badge.icon ??
                "award",
              threshold:
                Number(
                  badge.threshold ??
                  0,
                ),
            }),
          ),
        );
      } catch (requestError) {
        console.error(
          "Impossible de charger les badges :",
          requestError,
        );

        setError(
          requestError?.message ??
          "Impossible de charger les badges.",
        );
      } finally {
        setLoading(false);
      }
    }, [profileId]);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  useEffect(() => {
    if (!profileId) {
      return undefined;
    }

    const channel = supabase
      .channel(
        `profile-badges-${profileId}`,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table:
            "profile_badges",
          filter:
            `profile_id=eq.${profileId}`,
        },
        () => {
          fetchBadges();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(
        channel,
      );
    };
  }, [
    profileId,
    fetchBadges,
  ]);

  const unlockedCodes =
    useMemo(
      () =>
        new Set(
          badges.map(
            (badge) =>
              badge.code,
          ),
        ),
      [badges],
    );

  const badgesWithStatus =
    useMemo(
      () =>
        allBadges.map(
          (badge) => {
            const currentValue =
              getBadgeCurrentValue(
                badge,
                progress,
              );

            const targetValue =
              Number(
                badge.threshold ?? 0,
              );

            const progressPercent =
              targetValue > 0
                ? Math.min(
                  100,
                  Math.round(
                    (
                      currentValue /
                      targetValue
                    ) * 100,
                  ),
                )
                : 0;

            return {
              ...badge,

              unlocked:
                unlockedCodes.has(
                  badge.code,
                ),

              awardedBadge:
                badges.find(
                  (item) =>
                    item.code ===
                    badge.code,
                ) ?? null,

              currentValue,
              targetValue,
              progressPercent,
            };
          },
        ),
      [
        allBadges,
        badges,
        unlockedCodes,
        progress,
      ],
    );

  return {
    badges,
    allBadges:
      badgesWithStatus,

    unlockedCount:
      badges.length,

    totalCount:
      allBadges.length,

    loading,
    error,

    refreshProfileBadges:
      fetchBadges,
  };
}

export default useProfileBadges;