import { useCallback, useEffect, useRef, useState } from "react";

import { supabase } from "../lib/supabase";

import {
  createBikeRide,
  deleteBikeRide,
  getBikeRides,
  joinBikeRide,
  leaveBikeRide,
  updateBikeRide,
} from "../services/bikeService";

export function useBikeRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const refreshTimeoutRef = useRef(null);

  const loadRides = useCallback(
    async ({ showLoading = true } = {}) => {
      if (showLoading) {
        setLoading(true);
      }

      setError(null);

      try {
        const rideList = await getBikeRides();
        setRides(rideList);
      } catch (err) {
        console.error(err);

        setError(
          err?.message ??
            "Impossible de charger les sorties vélo."
        );
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    []
  );

  const scheduleRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    refreshTimeoutRef.current = setTimeout(() => {
      loadRides({
        showLoading: false,
      });
    }, 150);
  }, [loadRides]);

  useEffect(() => {
    loadRides();
  }, [loadRides]);

  useEffect(() => {
    const channel = supabase
      .channel("bike-rides")

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bike_rides",
        },
        scheduleRefresh
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bike_ride_participants",
        },
        scheduleRefresh
      )

      .subscribe();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      supabase.removeChannel(channel);
    };
  }, [scheduleRefresh]);

  const addRide = useCallback(
    async (rideData) => {
      setSaving(true);
      setError(null);

      try {
        const ride = await createBikeRide(rideData);

        await loadRides({
          showLoading: false,
        });

        return ride;
      } catch (err) {
        console.error(err);

        setError(
          err?.message ??
            "Impossible de créer la sortie."
        );

        throw err;
      } finally {
        setSaving(false);
      }
    },
    [loadRides]
  );

  const editRide = useCallback(
    async (rideId, rideData) => {
      setSaving(true);
      setError(null);

      try {
        const ride = await updateBikeRide(
          rideId,
          rideData
        );

        await loadRides({
          showLoading: false,
        });

        return ride;
      } catch (err) {
        console.error(err);

        setError(
          err?.message ??
            "Impossible de modifier la sortie."
        );

        throw err;
      } finally {
        setSaving(false);
      }
    },
    [loadRides]
  );

  const removeRide = useCallback(async (rideId) => {
    setSaving(true);
    setError(null);

    try {
      await deleteBikeRide(rideId);

      setRides((current) =>
        current.filter(
          (ride) => ride.id !== rideId
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err?.message ??
          "Impossible de supprimer cette sortie."
      );

      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const joinRide = useCallback(
    async ({ rideId, profileId }) => {
      setError(null);

      try {
        await joinBikeRide({
          rideId,
          profileId,
        });

        await loadRides({
          showLoading: false,
        });
      } catch (err) {
        setError(
          err?.message ??
            "Impossible de rejoindre la sortie."
        );

        throw err;
      }
    },
    [loadRides]
  );

  const leaveRide = useCallback(
    async ({ rideId, profileId }) => {
      setError(null);

      try {
        await leaveBikeRide({
          rideId,
          profileId,
        });

        await loadRides({
          showLoading: false,
        });
      } catch (err) {
        setError(
          err?.message ??
            "Impossible de quitter la sortie."
        );

        throw err;
      }
    },
    [loadRides]
  );

  return {
    rides,

    loading,

    saving,

    error,

    refreshRides: loadRides,

    addRide,

    editRide,

    removeRide,

    joinRide,

    leaveRide,
  };
}