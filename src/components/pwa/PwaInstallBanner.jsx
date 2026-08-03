import {
  Download,
  Share2,
  Smartphone,
  SquarePlus,
  X,
} from "lucide-react";

import usePwaInstall from "../../pwa/usePwaInstall";

function PwaInstallBanner() {
  const pwa =
    usePwaInstall();

  if (
    !pwa.shouldShowBanner &&
    !pwa.iosHelpOpen
  ) {
    return null;
  }

  return (
    <>
      {pwa.shouldShowBanner && (
        <aside
          className="pwa-install-banner"
          role="region"
          aria-label="Installer l’application"
        >
          <button
            type="button"
            className="pwa-install-banner__close"
            aria-label="Masquer pendant 7 jours"
            onClick={pwa.dismiss}
          >
            <X size={17} />
          </button>

          <span className="pwa-install-banner__icon">
            <Smartphone
              size={24}
            />
          </span>

          <div className="pwa-install-banner__content">
            <strong>
              Installer Les Co’Pintes
            </strong>

            <p>
              Ajoute l’application à ton téléphone pour un accès rapide et les futures notifications push.
            </p>
          </div>

          <button
            type="button"
            className="pwa-install-banner__action"
            onClick={
              pwa.requestInstall
            }
          >
            <Download size={17} />

            {pwa.isIos
              ? "Voir comment"
              : "Installer"}
          </button>
        </aside>
      )}

      {pwa.iosHelpOpen && (
        <div
          className="pwa-ios-help-backdrop"
          role="presentation"
          onClick={
            pwa.closeIosHelp
          }
        >
          <section
            className="pwa-ios-help"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-ios-help-title"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <header>
              <span className="pwa-ios-help__icon">
                <Smartphone
                  size={24}
                />
              </span>

              <div>
                <span className="section-heading__eyebrow">
                  iPhone / iPad
                </span>

                <h2 id="pwa-ios-help-title">
                  Installer Les Co’Pintes
                </h2>
              </div>

              <button
                type="button"
                aria-label="Fermer"
                onClick={
                  pwa.closeIosHelp
                }
              >
                <X size={20} />
              </button>
            </header>

            <ol>
              <li>
                <span>
                  <Share2 size={19} />
                </span>

                <div>
                  <strong>
                    Ouvre le menu Partager
                  </strong>

                  <p>
                    Dans Safari, touche l’icône de partage en bas de l’écran.
                  </p>
                </div>
              </li>

              <li>
                <span>
                  <SquarePlus
                    size={19}
                  />
                </span>

                <div>
                  <strong>
                    Ajouter à l’écran d’accueil
                  </strong>

                  <p>
                    Fais défiler la liste puis sélectionne « Sur l’écran d’accueil ».
                  </p>
                </div>
              </li>

              <li>
                <span>
                  <Download
                    size={19}
                  />
                </span>

                <div>
                  <strong>
                    Confirme l’installation
                  </strong>

                  <p>
                    Touche « Ajouter ». L’application apparaîtra avec tes autres apps.
                  </p>
                </div>
              </li>
            </ol>

            <button
              type="button"
              className="primary-button pwa-ios-help__done"
              onClick={
                pwa.closeIosHelp
              }
            >
              J’ai compris
            </button>
          </section>
        </div>
      )}
    </>
  );
}

export default PwaInstallBanner;
