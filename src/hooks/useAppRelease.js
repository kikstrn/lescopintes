import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  checkForAppUpdate,
  markReleaseAsViewed,
} from "../services/appReleaseService";

export default function useAppRelease(
  profileId,
) {
  const [release, setRelease] =
    useState(null);

  const [showRelease, setShowRelease] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const refresh = useCallback(
    async () => {
      if (!profileId) return;

      setLoading(true);

      try {
        const result =
          await checkForAppUpdate(
            profileId,
          );

        setRelease(
          result?.release ?? null,
        );

        setShowRelease(
          Boolean(
            result?.release &&
            !result?.viewed,
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    [profileId],
  );

  useEffect(() => {
    refresh().catch(console.error);
  }, [refresh]);

  const acknowledge = useCallback(
    async () => {
      if (
        release?.id &&
        profileId
      ) {
        await markReleaseAsViewed(
          release.id,
          profileId,
        );
      }

      setShowRelease(false);
    },
    [release, profileId],
  );

  return {
    release,
    showRelease,
    loading,
    refresh,
    acknowledge,
    openRelease: () =>
      setShowRelease(true),
    closeRelease: () =>
      setShowRelease(false),
  };
}
