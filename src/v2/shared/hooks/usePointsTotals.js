import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { supabase } from "../../../lib/supabase";

function normalizeTotal(row) {
  return {
    profileId:
      row.profile_id,

    totalPoints:
      Number(
        row.total_points ?? 0,
      ),
  };
}

export function usePointsTotals() {
  const [totals, setTotals] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const fetchTotals =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      const {
        data,
        error: fetchError,
      } = await supabase
        .from(
          "profile_points_totals",
        )
        .select(`
          profile_id,
          total_points
        `)
        .order("total_points", {
          ascending: false,
        });

      if (fetchError) {
        console.error(
          "Impossible de charger les points :",
          fetchError,
        );

        setError(
          fetchError.message ??
            "Impossible de charger les points.",
        );

        setLoading(false);
        return;
      }

      setTotals(
        (data ?? []).map(
          normalizeTotal,
        ),
      );

      setLoading(false);
    }, []);

  useEffect(() => {
    fetchTotals();
  }, [fetchTotals]);

  useEffect(() => {
    const channel = supabase
      .channel(
        "points-transactions",
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
          fetchTotals();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTotals]);

  return {
    totals,
    loading,
    error,
    refreshPointsTotals:
      fetchTotals,
  };
}

export default usePointsTotals;