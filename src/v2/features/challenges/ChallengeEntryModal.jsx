import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  Send,
  Trash2,
  X,
} from "lucide-react";

import {
  formatFileSize,
  prepareGalleryImage,
} from "../../../utils/imageCompression";

const MAX_INPUT_FILE_SIZE =
  25 * 1024 * 1024;

function ChallengeEntryModal({
  open,
  challenge = null,
  currentEntry = null,
  saving = false,
  onClose,
  onSubmit,
}) {
  const fileInputRef =
    useRef(null);

  const [progressValue, setProgressValue] =
    useState("");

  const [proofText, setProofText] =
    useState("");

  const [proofFile, setProofFile] =
    useState(null);

  const [
    proofPreviewUrl,
    setProofPreviewUrl,
  ] = useState(null);

  const [
    preparingImage,
    setPreparingImage,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    setProgressValue(
      currentEntry?.progressValue ??
        "",
    );

    setProofText(
      currentEntry?.proofText ??
        "",
    );

    setProofFile(null);

    setProofPreviewUrl(
      currentEntry?.proofUrl ??
        null,
    );

    setErrorMessage("");

    document.body.classList.add(
      "modal-is-open",
    );

    return () => {
      document.body.classList.remove(
        "modal-is-open",
      );
    };
  }, [
    open,
    currentEntry,
  ]);

  useEffect(() => {
    return () => {
      if (
        proofPreviewUrl &&
        proofPreviewUrl.startsWith(
          "blob:",
        )
      ) {
        URL.revokeObjectURL(
          proofPreviewUrl,
        );
      }
    };
  }, [proofPreviewUrl]);

  if (!open) {
    return null;
  }

  const handleClose = () => {
    if (
      saving ||
      preparingImage
    ) {
      return;
    }

    onClose?.();
  };

  const handleProofFileChange =
    async (event) => {
      const selectedFile =
        event.target.files?.[0];

      event.target.value = "";

      if (!selectedFile) {
        return;
      }

      if (
        !selectedFile.type.startsWith(
          "image/",
        ) &&
        !selectedFile.name
          .toLowerCase()
          .match(/\.(heic|heif)$/)
      ) {
        setErrorMessage(
          "La preuve doit être une image.",
        );

        return;
      }

      if (
        selectedFile.size >
        MAX_INPUT_FILE_SIZE
      ) {
        setErrorMessage(
          "La photo dépasse la limite de 25 Mo.",
        );

        return;
      }

      setPreparingImage(true);
      setErrorMessage("");

      try {
        const prepared =
          await prepareGalleryImage(
            selectedFile,
            {
              maxWidth: 1920,
              maxHeight: 1920,
              quality: 0.82,
              maxFileSize:
                2 * 1024 * 1024,
            },
          );

        if (
          proofPreviewUrl &&
          proofPreviewUrl.startsWith(
            "blob:",
          )
        ) {
          URL.revokeObjectURL(
            proofPreviewUrl,
          );
        }

        setProofFile(
          prepared.file,
        );

        setProofPreviewUrl(
          URL.createObjectURL(
            prepared.file,
          ),
        );
      } catch (error) {
        setErrorMessage(
          error?.message ??
            "Impossible de préparer la photo.",
        );
      } finally {
        setPreparingImage(false);
      }
    };

  const removeProofFile = () => {
    if (
      proofPreviewUrl &&
      proofPreviewUrl.startsWith(
        "blob:",
      )
    ) {
      URL.revokeObjectURL(
        proofPreviewUrl,
      );
    }

    setProofFile(null);
    setProofPreviewUrl(null);
  };

  const handleSubmit =
    async (event) => {
      event.preventDefault();
      setErrorMessage("");

      const numericProgress =
        Number(progressValue);

      if (
        !Number.isFinite(
          numericProgress,
        ) ||
        numericProgress < 0
      ) {
        setErrorMessage(
          "Indique une progression valide.",
        );

        return;
      }

      if (
        !proofText.trim() &&
        !proofFile &&
        !currentEntry?.proofStoragePath
      ) {
        setErrorMessage(
          "Ajoute une explication ou une photo de preuve.",
        );

        return;
      }

      try {
        await onSubmit?.({
          progressValue:
            numericProgress,

          proofText:
            proofText.trim(),

          proofFile,
        });

        onClose?.();
      } catch (error) {
        setErrorMessage(
          error?.message ??
            "Impossible d’envoyer la participation.",
        );
      }
    };

  const alreadySubmitted =
    [
      "submitted",
      "validated",
    ].includes(
      currentEntry?.status,
    );

  return (
    <div className="challenge-entry-overlay">
      <button
        type="button"
        className="challenge-entry-overlay__backdrop"
        aria-label="Fermer"
        onClick={handleClose}
      />

      <section
        className="challenge-entry-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="challenge-entry-title"
      >
        <header className="challenge-entry-modal__header">
          <div>
            <span className="section-heading__eyebrow">
              Défi hebdomadaire
            </span>

            <h2 id="challenge-entry-title">
              Envoyer ma participation
            </h2>
          </div>

          <button
            type="button"
            className="icon-button"
            aria-label="Fermer"
            disabled={
              saving ||
              preparingImage
            }
            onClick={handleClose}
          >
            <X size={20} />
          </button>
        </header>

        <form
          className="challenge-entry-modal__form"
          onSubmit={handleSubmit}
        >
          <section className="challenge-entry-modal__challenge">
            <CheckCircle2 size={21} />

            <div>
              <strong>
                {challenge?.title ??
                  "Défi actif"}
              </strong>

              {challenge?.description && (
                <p>
                  {challenge.description}
                </p>
              )}
            </div>
          </section>

          <label className="form-field">
            <span>
              Ma progression
            </span>

            <input
              type="number"
              min="0"
              step="0.1"
              value={progressValue}
              disabled={
                saving ||
                preparingImage
              }
              placeholder="Ex. 50"
              onChange={(event) =>
                setProgressValue(
                  event.target.value,
                )
              }
            />

            {challenge?.target_value != null && (
              <small className="form-field__help">
                Objectif du défi :{" "}
                {Number(
                  challenge.target_value,
                ).toLocaleString(
                  "fr-FR",
                )}
              </small>
            )}
          </label>

          <label className="form-field">
            <span>
              Explication ou preuve
            </span>

            <textarea
              rows={5}
              maxLength={1000}
              value={proofText}
              disabled={
                saving ||
                preparingImage
              }
              placeholder="Explique ce que tu as réalisé…"
              onChange={(event) =>
                setProofText(
                  event.target.value,
                )
              }
            />

            <small className="form-field__help">
              {proofText.length} / 1000
            </small>
          </label>

          <div className="challenge-entry-modal__proof-upload">
            <span>
              Photo de preuve
            </span>

            {!proofPreviewUrl ? (
              <button
                type="button"
                className="challenge-proof-picker"
                disabled={
                  saving ||
                  preparingImage
                }
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >
                {preparingImage ? (
                  <LoaderCircle
                    className="gallery-upload__spinner"
                    size={24}
                  />
                ) : (
                  <ImagePlus size={24} />
                )}

                <strong>
                  {preparingImage
                    ? "Compression…"
                    : "Ajouter une photo"}
                </strong>

                <small>
                  JPEG, PNG, WebP ou HEIC
                </small>
              </button>
            ) : (
              <div className="challenge-proof-preview">
                <img
                  src={proofPreviewUrl}
                  alt="Aperçu de la preuve"
                />

                <div>
                  <strong>
                    {proofFile?.name ??
                      currentEntry?.proofFileName ??
                      "Photo de preuve"}
                  </strong>

                  {proofFile && (
                    <small>
                      {formatFileSize(
                        proofFile.size,
                      )}
                    </small>
                  )}
                </div>

                <button
                  type="button"
                  aria-label="Supprimer la photo"
                  disabled={saving}
                  onClick={
                    removeProofFile
                  }
                >
                  <Trash2 size={17} />
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
              disabled={
                saving ||
                preparingImage
              }
              onChange={
                handleProofFileChange
              }
            />
          </div>

          {alreadySubmitted && (
            <div className="challenge-entry-modal__notice">
              Ta participation précédente sera
              mise à jour.
            </div>
          )}

          {errorMessage && (
            <div
              className="challenge-entry-modal__error"
              role="alert"
            >
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <footer className="challenge-entry-modal__actions">
            <button
              type="button"
              className="secondary-button"
              disabled={
                saving ||
                preparingImage
              }
              onClick={handleClose}
            >
              Annuler
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={
                saving ||
                preparingImage
              }
            >
              {saving ? (
                <>
                  <LoaderCircle
                    className="gallery-upload__spinner"
                    size={18}
                  />

                  Envoi…
                </>
              ) : (
                <>
                  <Send size={18} />

                  Envoyer
                </>
              )}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default ChallengeEntryModal;
