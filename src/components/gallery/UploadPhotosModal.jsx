import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    AnimatePresence,
    motion,
} from "framer-motion";

import {
    AlertCircle,
    CalendarDays,
    Check,
    ChevronDown,
    FileImage,
    ImagePlus,
    LoaderCircle,
    Trash2,
    UploadCloud,
    Users,
    X,
} from "lucide-react";

import {
    formatCompressionGain,
    formatFileSize,
    prepareGalleryImages,
    revokeGalleryPreviewUrls,
} from "../../utils/imageCompression";

const ACCEPTED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
];

const MAX_FILES = 20;

/*
 * Taille maximale du fichier sélectionné.
 * Il sera ensuite compressé avant l’envoi.
 */
const MAX_FILE_SIZE =
    25 * 1024 * 1024;

/*
 * Objectif maximal après compression.
 */
const MAX_COMPRESSED_SIZE =
    2 * 1024 * 1024;

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const IMAGE_QUALITY = 0.82;

function getTodayValue() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(
        date.getMonth() + 1,
    ).padStart(2, "0");
    const day = String(
        date.getDate(),
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function createTakenAt(dateValue) {
    if (!dateValue) {
        return null;
    }

    const date = new Date(
        `${dateValue}T12:00:00`,
    );

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toISOString();
}

function UploadPhotosModal({
    open,
    albums = [],
    members = [],
    currentProfileId,
    uploading = false,
    uploadProgress = {
        completed: 0,
        total: 0,
    },
    onClose,
    onUpload,
}) {
    const inputRef = useRef(null);

    const [items, setItems] = useState([]);
    const [albumId, setAlbumId] = useState("");
    const [caption, setCaption] = useState("");
    const [takenDate, setTakenDate] =
        useState(getTodayValue());

    const [
        taggedMemberIds,
        setTaggedMemberIds,
    ] = useState([]);

    const [dragging, setDragging] =
        useState(false);

    const [preparing, setPreparing] =
        useState(false);

    const [
        preparationProgress,
        setPreparationProgress,
    ] = useState({
        completed: 0,
        total: 0,
    });

    const [
        errorMessage,
        setErrorMessage,
    ] = useState("");

    useEffect(() => {
        if (!open) {
            return;
        }

        setAlbumId(
            albums[0]?.id ?? "",
        );

        setCaption("");
        setTakenDate(getTodayValue());

        setTaggedMemberIds(
            currentProfileId
                ? [currentProfileId]
                : [],
        );

        setErrorMessage("");
    }, [
        open,
        albums,
        currentProfileId,
    ]);

    useEffect(() => {
        if (open) {
            return undefined;
        }

        revokeGalleryPreviewUrls(
            items,
        );

        setItems([]);

        return undefined;
    }, [open]);

    useEffect(() => {
        return () => {
            revokeGalleryPreviewUrls(
                items,
            );
        };
    }, []);

    const validateFiles = (
        fileList,
    ) => {
        const files = Array.from(
            fileList ?? [],
        );

        if (
            items.length + files.length >
            MAX_FILES
        ) {
            throw new Error(
                `Tu peux ajouter au maximum ${MAX_FILES} photos à la fois.`,
            );
        }

        for (const file of files) {
            if (
                !ACCEPTED_TYPES.includes(
                    file.type,
                )
            ) {
                throw new Error(
                    `Le format de « ${file.name} » n’est pas accepté.`,
                );
            }

            if (
                file.size >
                MAX_FILE_SIZE
            ) {
                throw new Error(
                    `« ${file.name} » dépasse la limite de ${MAX_FILE_SIZE /
                    (1024 * 1024)
                    } Mo.`,
                );
            }
        }

        return files;
    };

    const addFiles = async (
        fileList,
    ) => {
        setErrorMessage("");

        let validFiles;

        try {
            validFiles =
                validateFiles(fileList);
        } catch (error) {
            setErrorMessage(
                error.message,
            );
            return;
        }

        if (
            validFiles.length === 0
        ) {
            return;
        }

        setPreparing(true);

        setPreparationProgress({
            completed: 0,
            total: validFiles.length,
        });

        try {
            const preparedItems =
                await prepareGalleryImages(
                    validFiles,
                    {
                        maxWidth: MAX_WIDTH,
                        maxHeight: MAX_HEIGHT,
                        quality: IMAGE_QUALITY,
                        maxFileSize:
                            MAX_COMPRESSED_SIZE,

                        onProgress: ({
                            completed,
                            total,
                        }) => {
                            setPreparationProgress({
                                completed,
                                total,
                            });
                        },
                    },
                );

            setItems(
                (currentItems) => [
                    ...currentItems,
                    ...preparedItems.map(
                        (item) => ({
                            ...item,
                            localId:
                                crypto.randomUUID(),
                        }),
                    ),
                ],
            );
        } catch (error) {
            console.error(
                "Impossible de préparer les photos :",
                error,
            );

            setErrorMessage(
                error?.message ??
                "Impossible de préparer les photos.",
            );
        } finally {
            setPreparing(false);

            setPreparationProgress({
                completed: 0,
                total: 0,
            });

            if (inputRef.current) {
                inputRef.current.value =
                    "";
            }
        }
    };

    const removeItem = (
        localId,
    ) => {
        setItems(
            (currentItems) => {
                const item =
                    currentItems.find(
                        (currentItem) =>
                            currentItem.localId ===
                            localId,
                    );

                if (item?.previewUrl) {
                    URL.revokeObjectURL(
                        item.previewUrl,
                    );
                }

                return currentItems.filter(
                    (currentItem) =>
                        currentItem.localId !==
                        localId,
                );
            },
        );
    };

    const updateItemCaption = (
        localId,
        value,
    ) => {
        setItems(
            (currentItems) =>
                currentItems.map(
                    (item) =>
                        item.localId ===
                            localId
                            ? {
                                ...item,
                                caption: value,
                            }
                            : item,
                ),
        );
    };

    const toggleTaggedMember = (
        profileId,
    ) => {
        setTaggedMemberIds(
            (currentIds) =>
                currentIds.includes(
                    profileId,
                )
                    ? currentIds.filter(
                        (id) =>
                            id !== profileId,
                    )
                    : [
                        ...currentIds,
                        profileId,
                    ],
        );
    };

    const handleDrop = (
        event,
    ) => {
        event.preventDefault();
        setDragging(false);

        if (
            uploading ||
            preparing
        ) {
            return;
        }

        addFiles(
            event.dataTransfer.files,
        );
    };

    const handleClose = () => {
        if (
            uploading ||
            preparing
        ) {
            return;
        }

        onClose();
    };

    const handleSubmit = async (
        event,
    ) => {
        event.preventDefault();
        setErrorMessage("");

        if (!currentProfileId) {
            setErrorMessage(
                "Utilisateur connecté introuvable.",
            );
            return;
        }

        if (
            items.length === 0
        ) {
            setErrorMessage(
                "Ajoute au moins une photo.",
            );
            return;
        }

        if (!albumId) {
            setErrorMessage(
                "Choisis un album.",
            );
            return;
        }

        try {
            await onUpload({
                items: items.map(
                    (item) => ({
                        file: item.file,
                        width: item.width,
                        height: item.height,
                        caption:
                            item.caption?.trim() ||
                            caption.trim(),
                        takenAt:
                            createTakenAt(
                                takenDate,
                            ),
                    }),
                ),

                uploadedBy:
                    currentProfileId,

                albumId,

                caption:
                    caption.trim(),

                takenAt:
                    createTakenAt(
                        takenDate,
                    ),

                taggedMemberIds,
            });

            revokeGalleryPreviewUrls(
                items,
            );

            setItems([]);
            onClose();
        } catch (error) {
            setErrorMessage(
                error?.message ??
                "Impossible d’envoyer les photos.",
            );
        }
    };

    const progressPercentage =
        uploadProgress.total > 0
            ? Math.round(
                (uploadProgress.completed /
                    uploadProgress.total) *
                100,
            )
            : 0;

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.button
                        type="button"
                        className="gallery-upload__overlay"
                        aria-label="Fermer la fenêtre"
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1,
                        }}
                        exit={{
                            opacity: 0,
                        }}
                        onClick={
                            handleClose
                        }
                    />

                    <motion.section
                        className="gallery-upload"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="gallery-upload-title"
                        initial={{
                            opacity: 0,
                            scale: 0.96,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.97,
                        }}
                    >
                        <header className="gallery-upload__header">
                            <div className="gallery-upload__title">
                                <span>
                                    <ImagePlus
                                        size={22}
                                    />
                                </span>

                                <div>
                                    <small>
                                        Galerie des Co’Pintes
                                    </small>

                                    <h2 id="gallery-upload-title">
                                        Ajouter des photos
                                    </h2>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="icon-button"
                                aria-label="Fermer"
                                disabled={
                                    uploading ||
                                    preparing
                                }
                                onClick={
                                    handleClose
                                }
                            >
                                <X size={21} />
                            </button>
                        </header>

                        <form
                            className="gallery-upload__form"
                            onSubmit={
                                handleSubmit
                            }
                        >
                            <div className="gallery-upload__body">
                                <input
                                    ref={inputRef}
                                    className="gallery-upload__input"
                                    type="file"
                                    accept={ACCEPTED_TYPES.join(
                                        ",",
                                    )}
                                    multiple
                                    disabled={
                                        uploading ||
                                        preparing
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        addFiles(
                                            event.target
                                                .files,
                                        )
                                    }
                                />

                                <button
                                    type="button"
                                    className={
                                        dragging
                                            ? "gallery-upload__dropzone gallery-upload__dropzone--dragging"
                                            : "gallery-upload__dropzone"
                                    }
                                    disabled={
                                        uploading ||
                                        preparing
                                    }
                                    onClick={() =>
                                        inputRef.current?.click()
                                    }
                                    onDragEnter={(
                                        event,
                                    ) => {
                                        event.preventDefault();
                                        setDragging(true);
                                    }}
                                    onDragOver={(
                                        event,
                                    ) => {
                                        event.preventDefault();
                                        setDragging(true);
                                    }}
                                    onDragLeave={(
                                        event,
                                    ) => {
                                        event.preventDefault();

                                        if (
                                            event.currentTarget ===
                                            event.target
                                        ) {
                                            setDragging(
                                                false,
                                            );
                                        }
                                    }}
                                    onDrop={
                                        handleDrop
                                    }
                                >
                                    <span className="gallery-upload__dropzone-icon">
                                        {preparing ? (
                                            <LoaderCircle
                                                className="gallery-upload__spinner"
                                                size={30}
                                            />
                                        ) : (
                                            <UploadCloud
                                                size={31}
                                            />
                                        )}
                                    </span>

                                    <strong>
                                        {preparing
                                            ? "Préparation des photos…"
                                            : "Glisse tes photos ici"}
                                    </strong>

                                    <p>
                                        ou clique pour
                                        sélectionner plusieurs
                                        images
                                    </p>

                                    <small>
                                        JPEG, PNG, WebP, HEIC · 25 Mo maximum avant compression
                                    </small>

                                    {preparing && (
                                        <span className="gallery-upload__preparation-progress">
                                            {
                                                preparationProgress.completed
                                            }
                                            {" / "}
                                            {
                                                preparationProgress.total
                                            }
                                        </span>
                                    )}
                                </button>

                                {items.length >
                                    0 && (
                                        <section className="gallery-upload__selection">
                                            <header>
                                                <div>
                                                    <span className="section-heading__eyebrow">
                                                        Sélection
                                                    </span>

                                                    <h3>
                                                        {
                                                            items.length
                                                        }{" "}
                                                        photo
                                                        {items.length >
                                                            1
                                                            ? "s"
                                                            : ""}
                                                    </h3>
                                                </div>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        uploading
                                                    }
                                                    onClick={() => {
                                                        revokeGalleryPreviewUrls(
                                                            items,
                                                        );

                                                        setItems(
                                                            [],
                                                        );
                                                    }}
                                                >
                                                    Tout supprimer
                                                </button>
                                            </header>

                                            <div className="gallery-upload__previews">
                                                {items.map(
                                                    (item) => (
                                                        <motion.article
                                                            layout
                                                            key={
                                                                item.localId
                                                            }
                                                            className="gallery-upload__preview"
                                                            initial={{
                                                                opacity: 0,
                                                                scale: 0.94,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                scale: 1,
                                                            }}
                                                        >
                                                            <div className="gallery-upload__preview-image">
                                                                <img
                                                                    src={
                                                                        item.previewUrl
                                                                    }
                                                                    alt={
                                                                        item.file
                                                                            .name
                                                                    }
                                                                />

                                                                <button
                                                                    type="button"
                                                                    aria-label="Retirer la photo"
                                                                    disabled={
                                                                        uploading
                                                                    }
                                                                    onClick={() =>
                                                                        removeItem(
                                                                            item.localId,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2
                                                                        size={16}
                                                                    />
                                                                </button>
                                                            </div>

                                                            <div className="gallery-upload__preview-details">
                                                                <strong>
                                                                    {
                                                                        item
                                                                            .originalFile
                                                                            ?.name
                                                                    }
                                                                </strong>

                                                                <small>
                                                                    {formatFileSize(
                                                                        item
                                                                            .compressedSize,
                                                                    )}
                                                                    {" · "}
                                                                    {formatCompressionGain(
                                                                        item,
                                                                    )}
                                                                </small>

                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        item.caption
                                                                    }
                                                                    maxLength={
                                                                        500
                                                                    }
                                                                    disabled={
                                                                        uploading
                                                                    }
                                                                    placeholder="Légende propre à cette photo"
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        updateItemCaption(
                                                                            item.localId,
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        </motion.article>
                                                    ),
                                                )}
                                            </div>
                                        </section>
                                    )}

                                <section className="gallery-upload__settings">
                                    <label className="gallery-upload__field">
                                        <span>
                                            Album *
                                        </span>

                                        <div className="gallery-upload__select">
                                            <FileImage
                                                size={18}
                                            />

                                            {albums.length === 0 && (
                                                <small className="gallery-upload__field-warning">
                                                    Aucun album n’a été trouvé dans Supabase.
                                                </small>
                                            )}

                                            <select
                                                value={albumId}
                                                className={!albumId ? "is-empty" : ""}
                                                disabled={uploading || albums.length === 0}
                                                onChange={(event) => {
                                                    setAlbumId(event.target.value);
                                                    setErrorMessage("");
                                                }}
                                            >
                                                <option value="" disabled>
                                                    {albums.length === 0
                                                        ? "Aucun album disponible"
                                                        : "Choisir un album"}
                                                </option>

                                                {albums.map((album) => (
                                                    <option
                                                        key={album.id}
                                                        value={album.id}
                                                    >
                                                        {album.name}
                                                    </option>
                                                ))}
                                            </select>

                                            <ChevronDown
                                                size={17}
                                            />
                                        </div>
                                    </label>

                                    <label className="gallery-upload__field">
                                        <span>
                                            Date des photos
                                        </span>

                                        <div className="gallery-upload__date">
                                            <CalendarDays
                                                size={18}
                                            />

                                            <input
                                                type="date"
                                                value={
                                                    takenDate
                                                }
                                                disabled={
                                                    uploading
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setTakenDate(
                                                        event.target
                                                            .value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </label>

                                    <label className="gallery-upload__field gallery-upload__field--wide">
                                        <span>
                                            Légende commune
                                        </span>

                                        <textarea
                                            value={
                                                caption
                                            }
                                            rows={3}
                                            maxLength={500}
                                            disabled={
                                                uploading
                                            }
                                            placeholder="Cette légende sera appliquée aux photos sans légende individuelle."
                                            onChange={(
                                                event,
                                            ) =>
                                                setCaption(
                                                    event.target
                                                        .value,
                                                )
                                            }
                                        />

                                        <small className="gallery-upload__caption-count">
                                            {
                                                caption.length
                                            }{" "}
                                            / 500
                                        </small>
                                    </label>
                                </section>

                                <fieldset className="gallery-upload__members">
                                    <legend>
                                        <Users
                                            size={17}
                                        />

                                        Membres présents
                                    </legend>

                                    <div>
                                        {members.map(
                                            (member) => {
                                                const selected =
                                                    taggedMemberIds.includes(
                                                        member.id,
                                                    );

                                                return (
                                                    <button
                                                        key={
                                                            member.id
                                                        }
                                                        type="button"
                                                        className={
                                                            selected
                                                                ? "gallery-upload__member gallery-upload__member--active"
                                                                : "gallery-upload__member"
                                                        }
                                                        disabled={
                                                            uploading
                                                        }
                                                        onClick={() =>
                                                            toggleTaggedMember(
                                                                member.id,
                                                            )
                                                        }
                                                    >
                                                        <span>
                                                            {
                                                                member.initials
                                                            }
                                                        </span>

                                                        <strong>
                                                            {
                                                                member.nickname
                                                            }
                                                        </strong>

                                                        {selected && (
                                                            <Check
                                                                size={15}
                                                            />
                                                        )}
                                                    </button>
                                                );
                                            },
                                        )}
                                    </div>
                                </fieldset>

                                {uploading && (
                                    <section className="gallery-upload__progress">
                                        <div>
                                            <span>
                                                Envoi en cours
                                            </span>

                                            <strong>
                                                {
                                                    uploadProgress.completed
                                                }
                                                {" / "}
                                                {
                                                    uploadProgress.total
                                                }
                                            </strong>
                                        </div>

                                        <div className="gallery-upload__progress-track">
                                            <motion.span
                                                animate={{
                                                    width: `${progressPercentage}%`,
                                                }}
                                            />
                                        </div>

                                        <small>
                                            {
                                                progressPercentage
                                            }
                                            {" %"}
                                        </small>
                                    </section>
                                )}

                                {errorMessage && (
                                    <motion.div
                                        className="gallery-upload__error"
                                        initial={{
                                            opacity: 0,
                                            y: -5,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                        }}
                                        role="alert"
                                    >
                                        <AlertCircle
                                            size={18}
                                        />

                                        <span>
                                            {
                                                errorMessage
                                            }
                                        </span>
                                    </motion.div>
                                )}
                            </div>

                            <footer className="gallery-upload__footer">
                                <button
                                    type="button"
                                    className="secondary-button"
                                    disabled={
                                        uploading ||
                                        preparing
                                    }
                                    onClick={
                                        handleClose
                                    }
                                >
                                    Annuler
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={
                                        uploading ||
                                        preparing ||
                                        items.length ===
                                        0
                                    }
                                >
                                    {uploading ? (
                                        <>
                                            <LoaderCircle
                                                className="gallery-upload__spinner"
                                                size={18}
                                            />

                                            Envoi des photos…
                                        </>
                                    ) : (
                                        <>
                                            <ImagePlus
                                                size={18}
                                            />

                                            Ajouter{" "}
                                            {items.length >
                                                0
                                                ? items.length
                                                : ""}
                                            {" photo"}
                                            {items.length >
                                                1
                                                ? "s"
                                                : ""}
                                        </>
                                    )}
                                </button>
                            </footer>
                        </form>
                    </motion.section>
                </>
            )}
        </AnimatePresence>
    );
}

export default UploadPhotosModal;