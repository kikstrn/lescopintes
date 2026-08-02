import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { supabase } from "../../../lib/supabase";

function normalizeRow(row) {
  return {
    profileId:
      row.profile_id,

    gagePoints:
      Number(
        row.gage_points ?? 0,
      ),

    validatedGages:
      Number(
        row.validated_gages ?? 0,
      ),
  };
}

export function useGageLeaderboard() {
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
          .from("gage_leaderboard")
          .select(`
            profile_id,
            gage_points,
            validated_gages
          `)
          .order("gage_points", {
            ascending: false,
          })
          .order("validated_gages", {
            ascending: false,
          });

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
          "Impossible de charger le classement des gages :",
          requestError,
        );

        setError(
          requestError?.message ??
            "Impossible de charger le classement des gages.",
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
        "gage-leaderboard-points",
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
    refreshGageLeaderboard:
      fetchLeaderboard,
  };
}

export default useGageLeaderboard;