import { useCallback, useEffect, useState } from "react";

import { supabase } from "../lib/supabase";
import { getProfiles } from "../services/profileService";

export function useProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const profileList = await getProfiles();
      setProfiles(profileList);
    } catch (requestError) {
      console.error(
        "Impossible de charger les profils :",
        requestError,
      );

      setError(
        requestError?.message ??
          "Impossible de charger les membres.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  useEffect(() => {
    const channel = supabase
      .channel("profiles-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        () => {
          loadProfiles();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadProfiles]);

  return {
    profiles,
    loading,
    error,
    refreshProfiles: loadProfiles,
  };
}