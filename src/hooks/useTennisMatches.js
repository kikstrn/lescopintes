import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { supabase } from "../lib/supabase";
import {
  getTennisMatches,
  recordTennisMatch,
} from "../services/tennisService";

export function useTennisMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const refreshTimeoutRef = useRef(null);

  const loadMatches = useCallback(
    async ({ showLoading = true } = {}) => {
      if (showLoading) {
        setLoading(true);
      }

      setError(null);

      try {
        const matchList =
          await getTennisMatches();

        setMatches(matchList);
      } catch (requestError) {
        console.error(
          "Impossible de charger les matchs :",
          requestError,
        );

        setError(
          requestError?.message ??
            "Impossible de charger les matchs.",
        );
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [],
  );

  const scheduleRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      window.clearTimeout(
        refreshTimeoutRef.current,
      );
    }

    refreshTimeoutRef.current =
      window.setTimeout(() => {
        loadMatches({
          showLoading: false,
        });
      }, 150);
  }, [loadMatches]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  useEffect(() => {
    const channel = supabase
      .channel("copintes-tennis-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tennis_matches",
        },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tennis_sets",
        },
        scheduleRefresh,
      )
      .subscribe();

    return () => {
      if (refreshTimeoutRef.current) {
        window.clearTimeout(
          refreshTimeoutRef.current,
        );
      }

      supabase.removeChannel(channel);
    };
  }, [scheduleRefresh]);

  const addMatch = useCallback(
    async (matchData) => {
      setSaving(true);
      setError(null);

      try {
        const match =
          await recordTennisMatch(matchData);

        await loadMatches({
          showLoading: false,
        });

        return match;
      } catch (requestError) {
        console.error(
          "Impossible d’enregistrer le match :",
          requestError,
        );

        setError(
          requestError?.message ??
            "Impossible d’enregistrer le match.",
        );

        throw requestError;
      } finally {
        setSaving(false);
      }
    },
    [loadMatches],
  );

  return {
    matches,
    loading,
    saving,
    error,
    refreshMatches: loadMatches,
    addMatch,
  };
}