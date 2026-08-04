import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  beginStravaAuthorization,
  disconnectStrava,
  getStravaConnectionStatus,
} from "../services/stravaService";

function readStravaCallbackState() {
  const params =
    new URLSearchParams(
      window.location.search,
    );

  return {
    status:
      params.get(
        "strava",
      ),

    message:
      params.get(
        "strava_message",
      ),
  };
}

function cleanStravaCallbackState() {
  const url =
    new URL(
      window.location.href,
    );

  url.searchParams.delete(
    "strava",
  );

  url.searchParams.delete(
    "strava_message",
  );

  window.history.replaceState(
    {},
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}

function useStravaConnection() {
  const [
    connection,
    setConnection,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    connecting,
    setConnecting,
  ] = useState(false);

  const [
    disconnecting,
    setDisconnecting,
  ] = useState(false);

  const [
    notice,
    setNotice,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState(null);

  const load =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const result =
          await getStravaConnectionStatus();

        setConnection(
          result,
        );
      } catch (requestError) {
        setError(
          requestError?.message ??
            "Impossible de vérifier la connexion Strava.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    const callbackState =
      readStravaCallbackState();

    if (
      callbackState.status ===
      "connected"
    ) {
      setNotice(
        "Ton compte Strava est maintenant connecté.",
      );

      cleanStravaCallbackState();
    } else if (
      callbackState.status ===
      "denied"
    ) {
      setError(
        "L’autorisation Strava a été refusée.",
      );

      cleanStravaCallbackState();
    } else if (
      callbackState.status ===
      "error"
    ) {
      setError(
        callbackState.message ??
          "La connexion Strava a échoué.",
      );

      cleanStravaCallbackState();
    }

    load();
  }, [load]);

  const connect =
    useCallback(async () => {
      setConnecting(true);
      setError(null);
      setNotice(null);

      try {
        const authorizationUrl =
          await beginStravaAuthorization();

        window.location.assign(
          authorizationUrl,
        );
      } catch (requestError) {
        setConnecting(false);

        setError(
          requestError?.message ??
            "Impossible de connecter Strava.",
        );
      }
    }, []);

  const disconnect =
    useCallback(async () => {
      setDisconnecting(true);
      setError(null);
      setNotice(null);

      try {
        await disconnectStrava();

        setConnection(null);

        setNotice(
          "Ton compte Strava a été déconnecté.",
        );
      } catch (requestError) {
        setError(
          requestError?.message ??
            "Impossible de déconnecter Strava.",
        );
      } finally {
        setDisconnecting(false);
      }
    }, []);

  return {
    connection,

    connected:
      Boolean(
        connection?.connected,
      ),

    loading,
    connecting,
    disconnecting,

    notice,
    error,

    connect,
    disconnect,
    refresh:
      load,

    clearNotice:
      () =>
        setNotice(null),
  };
}

export default useStravaConnection;
