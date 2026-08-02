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
          allResult,
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
        ]);

        if (
          awardedResult.error
        ) {
          throw awardedResult.error;
        }

        if (allResult.error) {
          throw allResult.error;
        }

        setBadges(
          (
            awardedResult.data ??
            []
          ).map(normalizeBadge),
        );

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
          (badge) => ({
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
          }),
        ),
      [
        allBadges,
        badges,
        unlockedCodes,
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