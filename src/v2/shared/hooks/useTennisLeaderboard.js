import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { supabase } from "../../../lib/supabase";

function normalizeRow(row) {
  const matchesPlayed =
    Number(
      row.matches_played ?? 0,
    );

  const matchesWon =
    Number(
      row.matches_won ?? 0,
    );

  return {
    profileId:
      row.profile_id,

    tennisPoints:
      Number(
        row.tennis_points ?? 0,
      ),

    matchesPlayed,

    matchesWon,

    winRate:
      matchesPlayed > 0
        ? Math.round(
            (matchesWon /
              matchesPlayed) *
              100,
          )
        : 0,
  };
}

export function useTennisLeaderboard() {
  const [rows, setRows] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const fetchLeaderboard =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const {
          data,
          error: fetchError,
        } = await supabase
          .from(
            "tennis_leaderboard",
          )
          .select(`
            profile_id,
            tennis_points,
            matches_played,
            matches_won
          `)
          .order(
            "tennis_points",
            {
              ascending: false,
            },
          )
          .order(
            "matches_won",
            {
              ascending: false,
            },
          );

        if (fetchError) {
          throw fetchError;
        }

        setRows(
          (data ?? []).map(
            normalizeRow,
          ),
        );
      } catch (requestError) {
        console.error(
          "Impossible de charger le classement tennis :",
          requestError,
        );

        setError(
          requestError?.message ??
            "Impossible de charger le classement tennis.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  useEffect(() => {
    const channel = supabase
      .channel(
        "tennis-leaderboard",
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table:
            "points_transactions",
        },
        () => {
          fetchLeaderboard();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(
        channel,
      );
    };
  }, [fetchLeaderboard]);

  return {
    rows,
    loading,
    error,

    refreshTennisLeaderboard:
      fetchLeaderboard,
  };
}

export default useTennisLeaderboard;