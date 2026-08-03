import {
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";

import usePwaUpdate from "../../pwa/usePwaUpdate";

function PwaUpdatePrompt() {
  const pwaUpdate =
    usePwaUpdate();

  if (
    !pwaUpdate
      .updateAvailable
  ) {
    return null;
  }

  return (
    <aside
      className="pwa-update-prompt"
      role="status"
      aria-live="polite"
    >
      <button
        type="button"
        className="pwa-update-prompt__close"
        aria-label="Masquer cette mise à jour"
        disabled={
          pwaUpdate.applying
        }
        onClick={
          pwaUpdate.dismiss
        }
      >
        <X size={16} />
      </button>

      <span className="pwa-update-prompt__icon">
        <Sparkles
          size={22}
        />
      </span>

      <div className="pwa-update-prompt__content">
        <strong>
          Une nouvelle version est disponible
        </strong>

        <p>
          Mets à jour Les Co’Pintes pour profiter des dernières améliorations.
        </p>

        {pwaUpdate.error && (
          <small>
            {pwaUpdate.error}
          </small>
        )}
      </div>

      <button
        type="button"
        className="pwa-update-prompt__action"
        disabled={
          pwaUpdate.applying
        }
        onClick={
          pwaUpdate.applyUpdate
        }
      >
        <RefreshCw
          size={17}
          className={
            pwaUpdate.applying
              ? "pwa-update-prompt__spinner"
              : ""
          }
        />

        {pwaUpdate.applying
          ? "Mise à jour…"
          : "Mettre à jour"}
      </button>
    </aside>
  );
}

export default PwaUpdatePrompt;
