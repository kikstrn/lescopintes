import {
  CheckCircle2,
  Gift,
  Sparkles,
  X,
} from "lucide-react";

function ReleaseNotesModal({
  release,
  open,
  onClose,
  onAcknowledge,
}) {
  if (!open || !release) {
    return null;
  }

  const changes =
    Array.isArray(release.changes)
      ? release.changes
      : [];

  return (
    <div
      className="release-notes-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose?.();
        }
      }}
    >
      <section
        className="release-notes-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="release-notes-title"
      >
        <header className="release-notes-modal__header">
          <div className="release-notes-modal__icon">
            <Sparkles size={24} />
          </div>

          <div>
            <span>
              NOUVELLE MISE À JOUR
            </span>

            <h2 id="release-notes-title">
              {release.title ||
                `Version ${release.version}`}
            </h2>

            <small>
              Version {release.version}
            </small>
          </div>

          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </header>

        <div className="release-notes-modal__content">
          {release.message && (
            <p className="release-notes-modal__message">
              {release.message}
            </p>
          )}

          {changes.length > 0 && (
            <>
              <div className="release-notes-modal__subtitle">
                <Gift size={17} />
                Les nouveautés
              </div>

              <div className="release-notes-modal__changes">
                {changes.map(
                  (change, index) => (
                    <div
                      key={`${change}-${index}`}
                    >
                      <CheckCircle2
                        size={17}
                      />

                      <span>
                        {change}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </>
          )}
        </div>

        <footer className="release-notes-modal__footer">
          <button
            type="button"
            className="primary-button"
            onClick={
              onAcknowledge
            }
          >
            J’ai vu les nouveautés
          </button>
        </footer>
      </section>
    </div>
  );
}

export default ReleaseNotesModal;
