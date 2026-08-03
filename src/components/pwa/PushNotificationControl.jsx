import {
  BellOff,
  BellRing,
  CheckCircle2,
  Send,
  Smartphone,
  X,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

import usePushNotifications from "../../pwa/usePushNotifications";
import {
  sendTestPushNotification,
} from "../../services/pushService";

function PushNotificationControl({
  profileId,
}) {
  const [
    open,
    setOpen,
  ] = useState(false);

  const push =
    usePushNotifications(
      profileId,
    );

  const [
    testSending,
    setTestSending,
  ] = useState(false);

  const [
    testMessage,
    setTestMessage,
  ] = useState(null);

  const [
    testError,
    setTestError,
  ] = useState(null);


  const handleEnable =
    async () => {
      try {
        await push.enable();
      } catch {
        /*
         * L’erreur est affichée dans le panneau.
         */
      }
    };

  const handleDisable =
    async () => {
      try {
        await push.disable();
      } catch {
        /*
         * L’erreur est affichée dans le panneau.
         */
      }
    };

  const handleTestPush =
    async () => {
      setTestSending(true);
      setTestMessage(null);
      setTestError(null);

      try {
        const result =
          await sendTestPushNotification();

        const delivered =
          Number(
            result?.delivered ??
            0,
          );

        const failed =
          Number(
            result?.failed ??
            0,
          );

        setTestMessage(
          delivered > 0
            ? `Notification envoyée sur ${delivered} appareil(s).`
            : `Aucune notification livrée${failed > 0 ? ` (${failed} échec(s))` : ""}.`,
        );
      } catch (requestError) {
        setTestError(
          requestError?.message ??
            "Impossible d’envoyer la notification de test.",
        );
      } finally {
        setTestSending(false);
      }
    };

  return (
    <div className="push-control">
      <button
        type="button"
        className={[
          "icon-button",
          "push-control__trigger",
          push.subscribed
            ? "push-control__trigger--active"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label="Notifications push"
        aria-expanded={open}
        onClick={() =>
          setOpen(
            (current) =>
              !current,
          )
        }
      >
        {push.subscribed ? (
          <BellRing size={20} />
        ) : (
          <BellOff size={20} />
        )}

        {push.subscribed && (
          <span className="push-control__active-dot" />
        )}
      </button>

      {open &&
        createPortal(
          <div
            className="push-control__backdrop"
            role="presentation"
            onClick={() =>
              setOpen(false)
            }
          >
            <section
              className="push-control__panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="push-control-title"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <header>
                <span className="push-control__panel-icon">
                  <Smartphone
                    size={21}
                  />
                </span>

                <div>
                  <span className="section-heading__eyebrow">
                    Téléphone
                  </span>

                  <h2 id="push-control-title">
                    Notifications push
                  </h2>
                </div>

                <button
                  type="button"
                  aria-label="Fermer"
                  onClick={() =>
                    setOpen(false)
                  }
                >
                  <X size={18} />
                </button>
              </header>

              {push.loading ? (
                <div className="push-control__state">
                  Vérification de l’appareil…
                </div>
              ) : (
                <>
                  <div
                    className={[
                      "push-control__status",
                      push.subscribed
                        ? "push-control__status--enabled"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {push.subscribed ? (
                      <CheckCircle2
                        size={20}
                      />
                    ) : (
                      <BellOff
                        size={20}
                      />
                    )}

                    <div>
                      <strong>
                        {push.subscribed
                          ? "Activées sur cet appareil"
                          : "Désactivées sur cet appareil"}
                      </strong>

                      <p>
                        {push.subscribed
                          ? `${push.deviceCount} appareil(s) actif(s) pour ton compte.`
                          : "Active-les pour recevoir les futures alertes même lorsque l’application est fermée."}
                      </p>
                    </div>
                  </div>

                  {!push.supported && (
                    <p className="push-control__warning">
                      Ce navigateur ne prend pas en charge les notifications push.
                    </p>
                  )}

                  {push.isIos &&
                    !push.installed && (
                      <p className="push-control__warning">
                        Sur iPhone et iPad, installe d’abord Les Co’Pintes sur l’écran d’accueil.
                      </p>
                    )}

                  {!push.configured && (
                    <p className="push-control__warning">
                      La clé VAPID publique n’est pas encore configurée.
                    </p>
                  )}

                  {push.permission ===
                    "denied" && (
                      <p className="push-control__warning push-control__warning--error">
                        Les notifications sont bloquées. Autorise-les dans les paramètres du navigateur ou du téléphone.
                      </p>
                    )}

                  {push.error && (
                    <p className="push-control__warning push-control__warning--error">
                      {push.error}
                    </p>
                  )}

                  {push.subscribed && (
                    <button
                      type="button"
                      className="push-control__test"
                      disabled={
                        push.loading ||
                        push.saving ||
                        testSending
                      }
                      onClick={
                        handleTestPush
                      }
                    >
                      <Send size={16} />

                      {testSending
                        ? "Envoi en cours…"
                        : "Envoyer une notification de test"}
                    </button>
                  )}

                  {testMessage && (
                    <p className="push-control__test-message">
                      <CheckCircle2
                        size={16}
                      />
                      {testMessage}
                    </p>
                  )}

                  {testError && (
                    <p className="push-control__warning push-control__warning--error">
                      {testError}
                    </p>
                  )}

                  <button
                    type="button"
                    className={
                      push.subscribed
                        ? "push-control__disable"
                        : "push-control__enable"
                    }
                    disabled={
                      push.loading ||
                      push.saving ||
                      testSending ||
                      (
                        !push.subscribed &&
                        (
                          !push.supported ||
                          !push.configured ||
                          push.permission ===
                            "denied"
                        )
                      )
                    }
                    onClick={
                      push.subscribed
                        ? handleDisable
                        : handleEnable
                    }
                  >
                    {push.saving
                      ? "Traitement…"
                      : push.subscribed
                        ? "Désactiver sur cet appareil"
                        : "Activer les notifications"}
                  </button>
                </>
              )}
            </section>
          </div>,
          document.body,
        )}
    </div>
  );
}

export default PushNotificationControl;
