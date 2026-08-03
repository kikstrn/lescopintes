import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const DISMISSED_STORAGE_KEY =
  "copintes-pwa-install-dismissed-at";

const DISMISS_DURATION_MS =
  7 * 24 * 60 * 60 * 1000;

function isIosDevice() {
  const userAgent =
    window.navigator.userAgent;

  const platform =
    window.navigator.platform;

  const touchPoints =
    window.navigator.maxTouchPoints ??
    0;

  return (
    /iphone|ipad|ipod/i.test(
      userAgent,
    ) ||
    (
      platform === "MacIntel" &&
      touchPoints > 1
    )
  );
}

function isStandaloneMode() {
  return (
    window.matchMedia(
      "(display-mode: standalone)",
    ).matches ||
    window.navigator.standalone ===
      true
  );
}

function wasRecentlyDismissed() {
  const dismissedAt =
    Number(
      window.localStorage.getItem(
        DISMISSED_STORAGE_KEY,
      ) ?? 0,
    );

  return (
    dismissedAt > 0 &&
    Date.now() - dismissedAt <
      DISMISS_DURATION_MS
  );
}

function usePwaInstall() {
  const [
    deferredPrompt,
    setDeferredPrompt,
  ] = useState(null);

  const [
    installed,
    setInstalled,
  ] = useState(
    () =>
      typeof window !==
        "undefined" &&
      isStandaloneMode(),
  );

  const [
    dismissed,
    setDismissed,
  ] = useState(
    () =>
      typeof window !==
        "undefined" &&
      wasRecentlyDismissed(),
  );

  const [
    iosHelpOpen,
    setIosHelpOpen,
  ] = useState(false);

  const isIos =
    useMemo(
      () =>
        typeof window !==
          "undefined" &&
        isIosDevice(),
      [],
    );

  useEffect(() => {
    const handleBeforeInstallPrompt = (
      event,
    ) => {
      event.preventDefault();

      setDeferredPrompt(
        event,
      );
    };

    const handleInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setDismissed(false);

      window.localStorage.removeItem(
        DISMISSED_STORAGE_KEY,
      );
    };

    const mediaQuery =
      window.matchMedia(
        "(display-mode: standalone)",
      );

    const handleDisplayModeChange =
      () => {
        setInstalled(
          isStandaloneMode(),
        );
      };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt,
    );

    window.addEventListener(
      "appinstalled",
      handleInstalled,
    );

    mediaQuery.addEventListener?.(
      "change",
      handleDisplayModeChange,
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );

      window.removeEventListener(
        "appinstalled",
        handleInstalled,
      );

      mediaQuery.removeEventListener?.(
        "change",
        handleDisplayModeChange,
      );
    };
  }, []);

  const installAvailable =
    Boolean(deferredPrompt);

  const shouldShowBanner =
    !installed &&
    !dismissed &&
    (
      installAvailable ||
      isIos
    );

  const requestInstall =
    useCallback(async () => {
      if (isIos) {
        setIosHelpOpen(true);

        return {
          outcome:
            "ios-instructions",
        };
      }

      if (!deferredPrompt) {
        return {
          outcome:
            "unavailable",
        };
      }

      await deferredPrompt.prompt();

      const choice =
        await deferredPrompt
          .userChoice;

      if (
        choice.outcome ===
        "accepted"
      ) {
        setDeferredPrompt(null);
      }

      return choice;
    }, [
      deferredPrompt,
      isIos,
    ]);

  const dismiss = useCallback(
    () => {
      setDismissed(true);

      window.localStorage.setItem(
        DISMISSED_STORAGE_KEY,
        String(
          Date.now(),
        ),
      );
    },
    [],
  );

  const openIosHelp =
    useCallback(() => {
      setIosHelpOpen(true);
    }, []);

  const closeIosHelp =
    useCallback(() => {
      setIosHelpOpen(false);
    }, []);

  return {
    installed,
    installAvailable,
    isIos,
    shouldShowBanner,
    iosHelpOpen,

    requestInstall,
    dismiss,
    openIosHelp,
    closeIosHelp,
  };
}

export default usePwaInstall;
