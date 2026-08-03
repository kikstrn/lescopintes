import {
  CloudOff,
  RefreshCw,
  Wifi,
} from "lucide-react";

import useNetworkStatus from "../../pwa/useNetworkStatus";

function PwaOfflineBanner() {
  const network =
    useNetworkStatus();

  if (network.online) {
    return (
      <div
        className="pwa-network-restored"
        key={
          network.lastChangedAt
        }
        aria-live="polite"
      >
        <Wifi size={16} />
        Connexion rétablie
      </div>
    );
  }

  return (
    <aside
      className="pwa-offline-banner"
      role="status"
      aria-live="assertive"
    >
      <span className="pwa-offline-banner__icon">
        <CloudOff size={20} />
      </span>

      <div>
        <strong>
          Tu es hors connexion
        </strong>

        <p>
          Certaines informations déjà consultées restent disponibles. Les nouvelles actions seront possibles dès le retour d’Internet.
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          window.location.reload()
        }
      >
        <RefreshCw size={16} />
        Réessayer
      </button>
    </aside>
  );
}

export default PwaOfflineBanner;
