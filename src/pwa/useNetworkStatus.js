import {
  useEffect,
  useState,
} from "react";

function useNetworkStatus() {
  const [
    online,
    setOnline,
  ] = useState(
    () =>
      typeof navigator ===
        "undefined"
        ? true
        : navigator.onLine,
  );

  const [
    lastChangedAt,
    setLastChangedAt,
  ] = useState(
    () => Date.now(),
  );

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setLastChangedAt(
        Date.now(),
      );
    };

    const handleOffline = () => {
      setOnline(false);
      setLastChangedAt(
        Date.now(),
      );
    };

    window.addEventListener(
      "online",
      handleOnline,
    );

    window.addEventListener(
      "offline",
      handleOffline,
    );

    return () => {
      window.removeEventListener(
        "online",
        handleOnline,
      );

      window.removeEventListener(
        "offline",
        handleOffline,
      );
    };
  }, []);

  return {
    online,
    offline: !online,
    lastChangedAt,
  };
}

export default useNetworkStatus;
