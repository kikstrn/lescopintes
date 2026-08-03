import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  activateWaitingServiceWorker,
  PWA_CONTROLLER_CHANGED_EVENT,
  PWA_UPDATE_AVAILABLE_EVENT,
} from "./registerServiceWorker";

function usePwaUpdate() {
  const [
    registration,
    setRegistration,
  ] = useState(null);

  const [
    applying,
    setApplying,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);

  const updateAvailable =
    Boolean(registration);

  useEffect(() => {
    const handleUpdateAvailable =
      (event) => {
        setRegistration(
          event.detail
            ?.registration ??
            null,
        );

        setError(null);
      };

    const handleControllerChanged =
      () => {
        window.location.reload();
      };

    window.addEventListener(
      PWA_UPDATE_AVAILABLE_EVENT,
      handleUpdateAvailable,
    );

    window.addEventListener(
      PWA_CONTROLLER_CHANGED_EVENT,
      handleControllerChanged,
    );

    return () => {
      window.removeEventListener(
        PWA_UPDATE_AVAILABLE_EVENT,
        handleUpdateAvailable,
      );

      window.removeEventListener(
        PWA_CONTROLLER_CHANGED_EVENT,
        handleControllerChanged,
      );
    };
  }, []);

  const applyUpdate =
    useCallback(async () => {
      if (!registration) {
        return;
      }

      setApplying(true);
      setError(null);

      try {
        const activated =
          await activateWaitingServiceWorker(
            registration,
          );

        if (!activated) {
          throw new Error(
            "La nouvelle version n’est plus disponible. Recharge la page pour vérifier à nouveau.",
          );
        }
      } catch (updateError) {
        setApplying(false);

        setError(
          updateError?.message ??
            "Impossible d’appliquer la mise à jour.",
        );
      }
    }, [registration]);

  const dismiss =
    useCallback(() => {
      setRegistration(null);
      setApplying(false);
      setError(null);
    }, []);

  return {
    updateAvailable,
    applying,
    error,
    applyUpdate,
    dismiss,
  };
}

export default usePwaUpdate;
