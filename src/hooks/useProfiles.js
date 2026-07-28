import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getProfiles,
  getProfileStatistics,
} from "../services/profileService";

function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return (
    error?.message ??
    "Impossible de charger les membres."
  );
}

function normalizeMemberStatistics(
  member,
  statistics = {},
) {
  const tennisMatches = Number(
    statistics.tennisMatches ??
      statistics.matches ??
      member.tennisMatches ??
      member.matches ??
      0,
  );

  const tennisWins = Number(
    statistics.tennisWins ??
      statistics.wins ??
      member.tennisWins ??
      member.wins ??
      0,
  );

  const tennisLosses = Number(
    statistics.tennisLosses ??
      statistics.losses ??
      member.tennisLosses ??
      member.losses ??
      Math.max(
        tennisMatches - tennisWins,
        0,
      ),
  );

  const tennisWinRate =
    tennisMatches > 0
      ? Math.round(
          (tennisWins / tennisMatches) *
            100,
        )
      : 0;

  const bikeRideCount = Number(
    statistics.bikeRideCount ??
      statistics.rideCount ??
      member.bikeRideCount ??
      0,
  );

  const bikeDistance = Number(
    statistics.bikeDistance ??
      statistics.bikeKm ??
      member.bikeDistance ??
      member.bikeKm ??
      0,
  );

  const bikeElevation = Number(
    statistics.bikeElevation ??
      statistics.elevationM ??
      member.bikeElevation ??
      0,
  );

  const photoCount = Number(
    statistics.photoCount ??
      statistics.photos ??
      member.photoCount ??
      0,
  );

  const receivedLikeCount = Number(
    statistics.receivedLikeCount ??
      statistics.likesReceived ??
      member.receivedLikeCount ??
      0,
  );

  return {
    ...member,

    statistics: {
      ...statistics,
      tennisMatches,
      tennisWins,
      tennisLosses,
      tennisWinRate,
      bikeRideCount,
      bikeDistance,
      bikeElevation,
      photoCount,
      receivedLikeCount,
    },

    /*
     * Compatibilité avec les composants existants
     * qui lisent encore directement ces propriétés.
     */
    matches: tennisMatches,
    tennisMatches,

    wins: tennisWins,
    tennisWins,

    losses: tennisLosses,
    tennisLosses,

    winRate: tennisWinRate,
    tennisWinRate,

    bikeRideCount,

    bikeKm: bikeDistance,
    bikeDistance,

    bikeElevation,

    photoCount,

    receivedLikeCount,
  };
}

export function useProfiles() {
  const [profiles, setProfiles] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const loadProfiles = useCallback(
    async ({
      showLoading = true,
    } = {}) => {
      if (showLoading) {
        setLoading(true);
      }

      setError(null);

      try {
        const profileRows =
          await getProfiles();

        const safeProfiles =
          Array.isArray(profileRows)
            ? profileRows
            : [];

        /*
         * On charge les statistiques de tous
         * les membres en parallèle.
         *
         * Promise.allSettled évite qu'une erreur
         * sur un membre empêche tous les autres
         * profils de s'afficher.
         */
        const statisticsResults =
          await Promise.allSettled(
            safeProfiles.map((member) =>
              getProfileStatistics(
                member.id,
              ),
            ),
          );

        const enrichedProfiles =
          safeProfiles.map(
            (member, index) => {
              const result =
                statisticsResults[index];

              if (
                result?.status ===
                "fulfilled"
              ) {
                return normalizeMemberStatistics(
                  member,
                  result.value,
                );
              }

              console.error(
                `Impossible de charger les statistiques du membre ${member.id} :`,
                result?.reason,
              );

              return normalizeMemberStatistics(
                member,
              );
            },
          );

        setProfiles(enrichedProfiles);

        return enrichedProfiles;
      } catch (loadError) {
        console.error(
          "Impossible de charger les profils :",
          loadError,
        );

        setProfiles([]);
        setError(
          getErrorMessage(loadError),
        );

        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  return {
    profiles,
    loading,
    error,

    refreshProfiles: () =>
      loadProfiles({
        showLoading: false,
      }),
  };
}

export default useProfiles;