import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  fetchNotificationPreferences,
  saveNotificationPreferences,
} from "../services/notificationPreferencesService";

function useNotificationPreferences(
  profileId,
) {
  const [
    preferences,
    setPreferences,
  ] = useState({
    ...DEFAULT_NOTIFICATION_PREFERENCES,
  });

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    savingKey,
    setSavingKey,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState(null);

  const load =
    useCallback(async () => {
      if (!profileId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result =
          await fetchNotificationPreferences(
            profileId,
          );

        setPreferences(
          result,
        );
      } catch (requestError) {
        setError(
          requestError?.message ??
            "Impossible de charger les préférences.",
        );
      } finally {
        setLoading(false);
      }
    }, [profileId]);

  useEffect(() => {
    load();
  }, [load]);

  const updatePreference =
    useCallback(
      async (
        key,
        enabled,
      ) => {
        const previous =
          preferences;

        const next = {
          ...preferences,
          [key]:
            enabled,
        };

        setPreferences(next);
        setSavingKey(key);
        setError(null);

        try {
          const saved =
            await saveNotificationPreferences({
              profileId,
              preferences:
                next,
            });

          setPreferences(
            saved,
          );
        } catch (requestError) {
          setPreferences(
            previous,
          );

          setError(
            requestError?.message ??
              "Impossible d’enregistrer cette préférence.",
          );

          throw requestError;
        } finally {
          setSavingKey(null);
        }
      },
      [
        preferences,
        profileId,
      ],
    );

  const enableAll =
    useCallback(async () => {
      const next =
        Object.fromEntries(
          Object.keys(
            DEFAULT_NOTIFICATION_PREFERENCES,
          ).map(
            (key) => [
              key,
              true,
            ],
          ),
        );

      setSavingKey("all");
      setError(null);

      try {
        const saved =
          await saveNotificationPreferences({
            profileId,
            preferences:
              next,
          });

        setPreferences(
          saved,
        );
      } catch (requestError) {
        setError(
          requestError?.message ??
            "Impossible d’activer toutes les notifications.",
        );
      } finally {
        setSavingKey(null);
      }
    }, [profileId]);

  const disableAll =
    useCallback(async () => {
      const next =
        Object.fromEntries(
          Object.keys(
            DEFAULT_NOTIFICATION_PREFERENCES,
          ).map(
            (key) => [
              key,
              false,
            ],
          ),
        );

      setSavingKey("all");
      setError(null);

      try {
        const saved =
          await saveNotificationPreferences({
            profileId,
            preferences:
              next,
          });

        setPreferences(
          saved,
        );
      } catch (requestError) {
        setError(
          requestError?.message ??
            "Impossible de désactiver toutes les notifications.",
        );
      } finally {
        setSavingKey(null);
      }
    }, [profileId]);

  return {
    preferences,
    loading,
    savingKey,
    error,

    updatePreference,
    enableAll,
    disableAll,
    refresh:
      load,
  };
}

export default useNotificationPreferences;
