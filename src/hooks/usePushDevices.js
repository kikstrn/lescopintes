import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  deletePushDevice,
  disablePushDevice,
  fetchPushDevices,
} from "../services/pushDevicesService";

function usePushDevices({
  profileId,
  currentEndpoint,
}) {
  const [
    devices,
    setDevices,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    deletingId,
    setDeletingId,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState(null);

  const load =
    useCallback(async () => {
      if (!profileId) {
        setDevices([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result =
          await fetchPushDevices(
            profileId,
          );

        setDevices(
          result,
        );
      } catch (requestError) {
        setError(
          requestError?.message ??
            "Impossible de charger les appareils.",
        );
      } finally {
        setLoading(false);
      }
    }, [profileId]);

  useEffect(() => {
    load();
  }, [load]);

  const normalizedDevices =
    useMemo(
      () =>
        devices.map(
          (device) => ({
            ...device,

            isCurrent:
              Boolean(
                currentEndpoint &&
                device.endpoint ===
                  currentEndpoint,
              ),
          }),
        ),
      [
        currentEndpoint,
        devices,
      ],
    );

  const removeDevice =
    useCallback(
      async (
        device,
      ) => {
        if (!device?.id) {
          return;
        }

        setDeletingId(
          device.id,
        );
        setError(null);

        try {
          /*
           * L’appareil actuel doit d’abord être désabonné
           * côté navigateur. Le composant gère cette étape.
           */
          if (
            !device.isCurrent
          ) {
            await deletePushDevice({
              profileId,
              deviceId:
                device.id,
            });
          } else {
            await disablePushDevice({
              profileId,
              deviceId:
                device.id,
            });
          }

          await load();
        } catch (requestError) {
          setError(
            requestError?.message ??
              "Impossible de retirer cet appareil.",
          );

          throw requestError;
        } finally {
          setDeletingId(null);
        }
      },
      [
        load,
        profileId,
      ],
    );

  return {
    devices:
      normalizedDevices,

    loading,
    deletingId,
    error,

    refresh:
      load,

    removeDevice,
  };
}

export default usePushDevices;
