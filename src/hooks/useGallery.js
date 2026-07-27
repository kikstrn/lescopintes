import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import { supabase } from "../lib/supabase";

import {
    addGalleryComment,
    deleteGalleryComment,
    deleteGalleryPhoto,
    getGalleryAlbums,
    getGalleryPhotos,
    toggleGalleryLike,
    updateGalleryComment,
    updateGalleryPhoto,
    uploadGalleryPhotos,
} from "../services/galleryService";

export function useGallery(userId) {
    const [albums, setAlbums] = useState([]);
    const [photos, setPhotos] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [uploadProgress, setUploadProgress] =
        useState({
            completed: 0,
            total: 0,
        });

    const [error, setError] = useState(null);

    const refreshTimeoutRef = useRef(null);

    const loadGallery = useCallback(
        async ({
            showLoading = true,
        } = {}) => {
            if (showLoading) {
                setLoading(true);
            }

            setError(null);

            try {
                const [
                    albumList,
                    photoList,
                ] = await Promise.all([
                    getGalleryAlbums(),
                    getGalleryPhotos(),
                ]);

                setAlbums(albumList);
                setPhotos(photoList);
            } catch (requestError) {
                console.error(
                    "Impossible de charger la galerie :",
                    requestError,
                );

                setError(
                    requestError?.message ??
                    "Impossible de charger la galerie.",
                );
            } finally {
                if (showLoading) {
                    setLoading(false);
                }
            }
        },
        [],
    );

    const scheduleRefresh = useCallback(() => {
        if (refreshTimeoutRef.current) {
            window.clearTimeout(
                refreshTimeoutRef.current,
            );
        }

        refreshTimeoutRef.current =
            window.setTimeout(() => {
                loadGallery({
                    showLoading: false,
                });
            }, 180);
    }, [loadGallery]);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        loadGallery();
    }, [userId, loadGallery]);

    useEffect(() => {
        const channel = supabase
            .channel(
                "copintes-gallery-changes",
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "gallery_photos",
                },
                scheduleRefresh,
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table:
                        "gallery_photo_members",
                },
                scheduleRefresh,
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "gallery_likes",
                },
                scheduleRefresh,
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table:
                        "gallery_comments",
                },
                scheduleRefresh,
            )
            .subscribe();

        return () => {
            if (refreshTimeoutRef.current) {
                window.clearTimeout(
                    refreshTimeoutRef.current,
                );
            }

            supabase.removeChannel(channel);
        };
    }, [scheduleRefresh]);

    const uploadPhotos = useCallback(
        async ({
            items,
            uploadedBy,
            albumId,
            caption,
            takenAt,
            taggedMemberIds,
        }) => {
            if (!items?.length) {
                throw new Error(
                    "Aucune photo à envoyer.",
                );
            }

            setUploading(true);
            setError(null);

            setUploadProgress({
                completed: 0,
                total: items.length,
            });

            try {
                const uploadedPhotos =
                    await uploadGalleryPhotos({
                        items,
                        uploadedBy,
                        albumId,
                        caption,
                        takenAt,
                        taggedMemberIds,
                        onProgress: ({
                            completed,
                            total,
                        }) => {
                            setUploadProgress({
                                completed,
                                total,
                            });
                        },
                    });

                await loadGallery({
                    showLoading: false,
                });

                return uploadedPhotos;
            } catch (requestError) {
                console.error(
                    "Impossible d’envoyer les photos :",
                    requestError,
                );

                setError(
                    requestError?.message ??
                    "Impossible d’envoyer les photos.",
                );

                throw requestError;
            } finally {
                setUploading(false);

                setUploadProgress({
                    completed: 0,
                    total: 0,
                });
            }
        },
        [loadGallery],
    );

    const editPhoto = useCallback(
        async (
            photoId,
            photoData,
        ) => {
            setSaving(true);
            setError(null);

            try {
                const updatedPhoto =
                    await updateGalleryPhoto(
                        photoId,
                        photoData,
                    );

                setPhotos((currentPhotos) =>
                    currentPhotos.map((photo) =>
                        photo.id === photoId
                            ? updatedPhoto
                            : photo,
                    ),
                );

                return updatedPhoto;
            } catch (requestError) {
                console.error(
                    "Impossible de modifier la photo :",
                    requestError,
                );

                setError(
                    requestError?.message ??
                    "Impossible de modifier la photo.",
                );

                throw requestError;
            } finally {
                setSaving(false);
            }
        },
        [],
    );

    const removePhoto = useCallback(
        async (photo) => {
            setSaving(true);
            setError(null);

            try {
                await deleteGalleryPhoto(
                    photo,
                );

                setPhotos((currentPhotos) =>
                    currentPhotos.filter(
                        (currentPhoto) =>
                            currentPhoto.id !==
                            photo.id,
                    ),
                );
            } catch (requestError) {
                console.error(
                    "Impossible de supprimer la photo :",
                    requestError,
                );

                setError(
                    requestError?.message ??
                    "Impossible de supprimer la photo.",
                );

                throw requestError;
            } finally {
                setSaving(false);
            }
        },
        [],
    );

    const toggleLike = useCallback(
        async ({
            photoId,
            profileId,
        }) => {
            if (!profileId) {
                throw new Error(
                    "Profil utilisateur introuvable.",
                );
            }

            const currentPhoto =
                photos.find(
                    (photo) =>
                        photo.id === photoId,
                );

            if (!currentPhoto) {
                throw new Error(
                    "Photo introuvable.",
                );
            }

            const alreadyLiked =
                currentPhoto.likedByIds.includes(
                    profileId,
                );

            /*
             * Mise à jour optimiste pour rendre
             * le clic immédiatement visible.
             */
            setPhotos((currentPhotos) =>
                currentPhotos.map((photo) => {
                    if (photo.id !== photoId) {
                        return photo;
                    }

                    const likedByIds =
                        alreadyLiked
                            ? photo.likedByIds.filter(
                                (id) =>
                                    id !== profileId,
                            )
                            : [
                                ...photo.likedByIds,
                                profileId,
                            ];

                    return {
                        ...photo,
                        likedByIds,
                        likeCount:
                            likedByIds.length,
                    };
                }),
            );

            try {
                await toggleGalleryLike({
                    photoId,
                    profileId,
                    liked: alreadyLiked,
                });
            } catch (requestError) {
                /*
                 * Retour à l’état précédent
                 * si Supabase refuse l’action.
                 */
                setPhotos((currentPhotos) =>
                    currentPhotos.map((photo) => {
                        if (photo.id !== photoId) {
                            return photo;
                        }

                        const likedByIds =
                            alreadyLiked
                                ? [
                                    ...photo.likedByIds,
                                    profileId,
                                ]
                                : photo.likedByIds.filter(
                                    (id) =>
                                        id !== profileId,
                                );

                        return {
                            ...photo,
                            likedByIds: [
                                ...new Set(
                                    likedByIds,
                                ),
                            ],
                            likeCount:
                                new Set(likedByIds)
                                    .size,
                        };
                    }),
                );

                setError(
                    requestError?.message ??
                    "Impossible de modifier le like.",
                );

                throw requestError;
            }
        },
        [photos],
    );

    const addComment = useCallback(
        async ({
            photoId,
            profileId,
            content,
        }) => {
            setSaving(true);
            setError(null);

            try {
                const comment =
                    await addGalleryComment({
                        photoId,
                        profileId,
                        content,
                    });

                setPhotos((currentPhotos) =>
                    currentPhotos.map((photo) => {
                        if (photo.id !== photoId) {
                            return photo;
                        }

                        const comments = [
                            ...photo.comments,
                            comment,
                        ];

                        return {
                            ...photo,
                            comments,
                            commentCount:
                                comments.length,
                        };
                    }),
                );

                return comment;
            } catch (requestError) {
                setError(
                    requestError?.message ??
                    "Impossible d’ajouter le commentaire.",
                );

                throw requestError;
            } finally {
                setSaving(false);
            }
        },
        [],
    );

    const editComment =
        useCallback(
            async ({
                photoId,
                commentId,
                content,
            }) => {
                setSaving(true);
                setError(null);

                try {
                    const updatedComment =
                        await updateGalleryComment(
                            commentId,
                            content,
                        );

                    setPhotos((currentPhotos) =>
                        currentPhotos.map(
                            (photo) => {
                                if (
                                    photo.id !== photoId
                                ) {
                                    return photo;
                                }

                                return {
                                    ...photo,
                                    comments:
                                        photo.comments.map(
                                            (comment) =>
                                                comment.id ===
                                                    commentId
                                                    ? updatedComment
                                                    : comment,
                                        ),
                                };
                            },
                        ),
                    );

                    return updatedComment;
                } catch (requestError) {
                    setError(
                        requestError?.message ??
                        "Impossible de modifier le commentaire.",
                    );

                    throw requestError;
                } finally {
                    setSaving(false);
                }
            },
            [],
        );

    const removeComment =
        useCallback(
            async ({
                photoId,
                commentId,
            }) => {
                setSaving(true);
                setError(null);

                try {
                    await deleteGalleryComment(
                        commentId,
                    );

                    setPhotos((currentPhotos) =>
                        currentPhotos.map(
                            (photo) => {
                                if (
                                    photo.id !== photoId
                                ) {
                                    return photo;
                                }

                                const comments =
                                    photo.comments.filter(
                                        (comment) =>
                                            comment.id !==
                                            commentId,
                                    );

                                return {
                                    ...photo,
                                    comments,
                                    commentCount:
                                        comments.length,
                                };
                            },
                        ),
                    );
                } catch (requestError) {
                    setError(
                        requestError?.message ??
                        "Impossible de supprimer le commentaire.",
                    );

                    throw requestError;
                } finally {
                    setSaving(false);
                }
            },
            [],
        );

    return {
        albums,
        photos,

        loading,
        saving,
        uploading,
        uploadProgress,
        error,

        refreshGallery: loadGallery,

        uploadPhotos,
        editPhoto,
        removePhoto,

        toggleLike,

        addComment,
        editComment,
        removeComment,
    };
}