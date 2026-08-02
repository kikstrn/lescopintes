import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../../../lib/supabase";

function normalizeXpTotal(row) {
  if (!row) {
    return null;
  }

  return {
    profileId:
      row.profile_id,

    totalXp:
      Number(
        row.total_xp ?? 0,
      ),

    level:
      Math.max(
        1,
        Number(
          row.level ?? 1,
        ),
      ),

    currentLevelStartXp:
      Number(
        row.current_level_start_xp ??
          0,
      ),

    nextLevelXp:
      Number(
        row.next_level_xp ??
          100,
      ),
  };
}

function normalizeTransaction(row) {
  return {
    id: row.id,

    profileId:
      row.profile_id,

    amount:
      Number(
        row.amount ?? 0,
      ),

    sourceType:
      row.source_type,

    sourceId:
      row.source_id,

    title:
      row.title,

    description:
      row.description ?? "",

    metadata:
      row.metadata ?? {},

    createdAt:
      row.created_at,
  };
}

export function useProfileXp(
  profileId,
) {
  const [xpTotal, setXpTotal] =
    useState(null);

  const [
    transactions,
    setTransactions,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const fetchXp =
    useCallback(async () => {
      if (!profileId) {
        setXpTotal(null);
        setTransactions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [
          totalResult,
          transactionsResult,
        ] = await Promise.all([
          supabase
            .from(
              "profile_xp_totals",
            )
            .select(`
              profile_id,
              total_xp,
              level,
              current_level_start_xp,
              next_level_xp
            `)
            .eq(
              "profile_id",
              profileId,
            )
            .maybeSingle(),

          supabase
            .from(
              "xp_transactions",
            )
            .select(`
              id,
              profile_id,
              amount,
              source_type,
              source_id,
              title,
              description,
              metadata,
              created_at
            `)
            .eq(
              "profile_id",
              profileId,
            )
            .order(
              "created_at",
              {
                ascending: false,
              },
            )
            .limit(12),
        ]);

        if (totalResult.error) {
          throw totalResult.error;
        }

        if (
          transactionsResult.error
        ) {
          throw transactionsResult.error;
        }

        setXpTotal(
          normalizeXpTotal(
            totalResult.data,
          ),
        );

        setTransactions(
          (
            transactionsResult.data ??
            []
          ).map(
            normalizeTransaction,
          ),
        );
      } catch (requestError) {
        console.error(
          "Impossible de charger l’XP :",
          requestError,
        );

        setError(
          requestError?.message ??
            "Impossible de charger l’expérience.",
        );
      } finally {
        setLoading(false);
      }
    }, [profileId]);

  useEffect(() => {
    fetchXp();
  }, [fetchXp]);

  useEffect(() => {
    if (!profileId) {
      return undefined;
    }

    const channel = supabase
      .channel(
        `profile-xp-${profileId}`,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table:
            "xp_transactions",
          filter:
            `profile_id=eq.${profileId}`,
        },
        () => {
          fetchXp();
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
    fetchXp,
  ]);

  const progress =
    useMemo(() => {
      const totalXp =
        xpTotal?.totalXp ?? 0;

      const startXp =
        xpTotal
          ?.currentLevelStartXp ??
        0;

      const nextXp =
        xpTotal?.nextLevelXp ??
        100;

      const xpInLevel =
        Math.max(
          0,
          totalXp - startXp,
        );

      const xpRequired =
        Math.max(
          1,
          nextXp - startXp,
        );

      const progressPercent =
        Math.min(
          100,
          Math.round(
            (
              xpInLevel /
              xpRequired
            ) * 100,
          ),
        );

      return {
        xpInLevel,
        xpRequired,
        remainingXp:
          Math.max(
            0,
            nextXp - totalXp,
          ),
        progressPercent,
      };
    }, [xpTotal]);

  return {
    xpTotal,
    transactions,

    level:
      xpTotal?.level ?? 1,

    totalXp:
      xpTotal?.totalXp ?? 0,

    ...progress,

    loading,
    error,

    refreshProfileXp:
      fetchXp,
  };
}

export default useProfileXp;