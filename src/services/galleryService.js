import { supabase } from "../lib/supabase";

const GALLERY_BUCKET = "gallery";

const PHOTO_SELECT = `
  id,
  album_id,
  uploaded_by,
  storage_path,
  file_name,
  mime_type,
  file_size,
  width,
  height,
  caption,
  taken_at,
  created_at,
  updated_at,

    album:gallery_albums!gallery_photos_album_id_fkey (
    id,
    name,
    slug,
    description
    ),

  uploader:profiles!gallery_photos_uploaded_by_fkey (
    id,
    first_name,
    nickname,
    initials,
    avatar_url,
    role
  ),

  tagged_members:gallery_photo_members (
    profile_id,
    profile:profiles!gallery_photo_members_profile_id_fkey (
      id,
      first_name,
      nickname,
      initials,
      avatar_url
    )
  ),

  likes:gallery_likes (
    profile_id,
    created_at
  ),

  comments:gallery_comments (
    id,
    profile_id,
    content,
    created_at,
    updated_at,

    author:profiles!gallery_comments_profile_id_fkey (
      id,
      first_name,
      nickname,
      initials,
      avatar_url
    )
  )
`;

function mapProfile(profile) {
    if (!profile) {
        return null;
    }

    return {
        id: profile.id,
        firstName: profile.first_name ?? "",
        nickname:
            profile.nickname ??
            profile.first_name ??
            "Membre",
        initials:
            profile.initials ??
            profile.nickname?.slice(0, 2).toUpperCase() ??
            profile.first_name?.slice(0, 2).toUpperCase() ??
            "CP",
        avatarUrl: profile.avatar_url ?? null,
        role: profile.role ?? "member",
    };
}

function mapComment(comment) {
    return {
        id: comment.id,
        profileId: comment.profile_id,
        content: comment.content,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
        author: mapProfile(comment.author),
    };
}

export function mapGalleryPhoto(photo) {
    const likes = photo.likes ?? [];

    const taggedMembers = (
        photo.tagged_members ?? []
    )
        .map((item) => mapProfile(item.profile))
        .filter(Boolean);

    const comments = (
        photo.comments ?? []
    )
        .map(mapComment)
        .sort(
            (commentA, commentB) =>
                new Date(commentA.createdAt).getTime() -
                new Date(commentB.createdAt).getTime(),
        );

    return {
        id: photo.id,
        albumId: photo.album_id,
        uploadedBy: photo.uploaded_by,
        storagePath: photo.storage_path,
        fileName: photo.file_name,
        mimeType: photo.mime_type ?? "",
        fileSize: Number(photo.file_size ?? 0),
        width:
            photo.width === null
                ? null
                : Number(photo.width),
        height:
            photo.height === null
                ? null
                : Number(photo.height),
        caption: photo.caption ?? "",
        takenAt: photo.taken_at,
        createdAt: photo.created_at,
        updatedAt: photo.updated_at,

        album: photo.album
            ? {
                id: photo.album.id,
                name: photo.album.name,
                slug: photo.album.slug,
                description:
                    photo.album.description ?? "",
            }
            : null,

        uploader: mapProfile(photo.uploader),
        taggedMembers,

        likes,
        likeCount: likes.length,
        likedByIds: likes.map(
            (like) => like.profile_id,
        ),

        comments,
        commentCount: comments.length,

        signedUrl: null,
    };
}

export async function getGalleryAlbums() {
    const {
        data: sessionData,
        error: sessionError,
    } = await supabase.auth.getSession();

    const { data, error } = await supabase
        .from("gallery_albums")
        .select(`
      id,
      name,
      slug,
      description,
      cover_photo_id,
      created_by,
      created_at,
      updated_at
    `)
        .order("name", {
            ascending: true,
        });

    if (error) {
        throw error;
    }

    return (data ?? []).map((album) => ({
        id: album.id,
        name: album.name,
        slug: album.slug,
        description: album.description ?? "",
        coverPhotoId: album.cover_photo_id ?? null,
        createdBy: album.created_by,
        createdAt: album.created_at,
        updatedAt: album.updated_at,
    }));
}

async function createSignedPhotoUrl(
    storagePath,
) {
    const { data, error } =
        await supabase.storage
            .from(GALLERY_BUCKET)
            .createSignedUrl(
                storagePath,
                60 * 60,
            );

    if (error) {
        throw error;
    }

    return data.signedUrl;
}

async function attachSignedUrls(photos) {
    const results = await Promise.allSettled(
        photos.map(async (photo) => ({
            ...photo,
            signedUrl:
                await createSignedPhotoUrl(
                    photo.storagePath,
                ),
        })),
    );

    return results
        .map((result, index) => {
            if (result.status === "fulfilled") {
                return result.value;
            }

            console.error(
                "Impossible de générer l’URL signée pour la photo :",
                photos[index]?.storagePath,
                result.reason,
            );

            return {
                ...photos[index],
                signedUrl: null,
            };
        });
}

export async function getGalleryPhotos() {
    const { data, error } = await supabase
        .from("gallery_photos")
        .select(PHOTO_SELECT)
        .order("taken_at", {
            ascending: false,
            nullsFirst: false,
        })
        .order("created_at", {
            ascending: false,
        });

    if (error) {
        throw error;
    }

    const photos = (data ?? []).map(
        mapGalleryPhoto,
    );

    return attachSignedUrls(photos);
}

export async function getGalleryPhotoById(
    photoId,
) {
    const { data, error } = await supabase
        .from("gallery_photos")
        .select(PHOTO_SELECT)
        .eq("id", photoId)
        .single();

    if (error) {
        throw error;
    }

    const photo = mapGalleryPhoto(data);

    return {
        ...photo,
        signedUrl:
            await createSignedPhotoUrl(
                photo.storagePath,
            ),
    };
}

function sanitizeFileName(fileName) {
    return fileName
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            "",
        )
        .replace(
            /[^a-zA-Z0-9._-]/g,
            "-",
        )
        .replace(/-+/g, "-")
        .toLowerCase();
}

function createStoragePath({
    profileId,
    file,
}) {
    const extension =
        file.name.split(".").pop() ??
        "jpg";

    const safeName = sanitizeFileName(
        file.name.replace(
            /\.[^/.]+$/,
            "",
        ),
    );

    const uniqueName = `${crypto.randomUUID()}-${safeName}.${extension}`;

    return `${profileId}/${uniqueName}`;
}

async function uploadFile({
    file,
    profileId,
}) {
    const storagePath =
        createStoragePath({
            profileId,
            file,
        });

    const { error } = await supabase.storage
        .from(GALLERY_BUCKET)
        .upload(
            storagePath,
            file,
            {
                contentType:
                    file.type ||
                    "image/jpeg",
                cacheControl: "3600",
                upsert: false,
            },
        );

    if (error) {
        throw error;
    }

    return storagePath;
}

async function insertTaggedMembers({
    photoId,
    profileIds,
}) {
    const uniqueProfileIds = [
        ...new Set(
            profileIds.filter(Boolean),
        ),
    ];

    if (
        uniqueProfileIds.length === 0
    ) {
        return;
    }

    const { error } = await supabase
        .from("gallery_photo_members")
        .insert(
            uniqueProfileIds.map(
                (profileId) => ({
                    photo_id: photoId,
                    profile_id: profileId,
                }),
            ),
        );

    if (error) {
        throw error;
    }
}

export async function uploadGalleryPhoto({
    file,
    uploadedBy,
    albumId,
    caption = "",
    takenAt = null,
    taggedMemberIds = [],
    width = null,
    height = null,
}) {
    if (!file) {
        throw new Error(
            "Aucun fichier sélectionné.",
        );
    }

    if (!uploadedBy) {
        throw new Error(
            "Utilisateur connecté introuvable.",
        );
    }

    const storagePath =
        await uploadFile({
            file,
            profileId: uploadedBy,
        });

    try {
        const { data, error } = await supabase
            .from("gallery_photos")
            .insert({
                album_id:
                    albumId || null,
                uploaded_by: uploadedBy,
                storage_path:
                    storagePath,
                file_name: file.name,
                mime_type:
                    file.type || null,
                file_size:
                    file.size || null,
                width,
                height,
                caption:
                    caption.trim() || null,
                taken_at:
                    takenAt || null,
            })
            .select("id")
            .single();

        if (error) {
            throw error;
        }

        await insertTaggedMembers({
            photoId: data.id,
            profileIds:
                taggedMemberIds,
        });

        return getGalleryPhotoById(
            data.id,
        );
    } catch (error) {
        await supabase.storage
            .from(GALLERY_BUCKET)
            .remove([storagePath]);

        throw error;
    }
}

export async function uploadGalleryPhotos({
    items,
    uploadedBy,
    albumId,
    caption = "",
    takenAt = null,
    taggedMemberIds = [],
    onProgress,
}) {
    const uploadedPhotos = [];

    for (
        let index = 0;
        index < items.length;
        index += 1
    ) {
        const item = items[index];

        const photo =
            await uploadGalleryPhoto({
                file: item.file,
                uploadedBy,
                albumId,
                caption:
                    item.caption ??
                    caption,
                takenAt:
                    item.takenAt ??
                    takenAt,
                taggedMemberIds,
                width:
                    item.width ?? null,
                height:
                    item.height ?? null,
            });

        uploadedPhotos.push(photo);

        onProgress?.({
            completed: index + 1,
            total: items.length,
            photo,
        });
    }

    return uploadedPhotos;
}

export async function updateGalleryPhoto(
    photoId,
    {
        albumId,
        caption,
        takenAt,
        taggedMemberIds = [],
    },
) {
    const { error } = await supabase
        .from("gallery_photos")
        .update({
            album_id: albumId || null,
            caption:
                caption?.trim() || null,
            taken_at:
                takenAt || null,
        })
        .eq("id", photoId);

    if (error) {
        throw error;
    }

    const {
        error: deleteTagsError,
    } = await supabase
        .from("gallery_photo_members")
        .delete()
        .eq("photo_id", photoId);

    if (deleteTagsError) {
        throw deleteTagsError;
    }

    await insertTaggedMembers({
        photoId,
        profileIds:
            taggedMemberIds,
    });

    return getGalleryPhotoById(
        photoId,
    );
}

export async function deleteGalleryPhoto(
    photo,
) {
    if (!photo?.id) {
        throw new Error(
            "Photo introuvable.",
        );
    }

    const { error } = await supabase
        .from("gallery_photos")
        .delete()
        .eq("id", photo.id);

    if (error) {
        throw error;
    }

    if (photo.storagePath) {
        const {
            error: storageError,
        } = await supabase.storage
            .from(GALLERY_BUCKET)
            .remove([
                photo.storagePath,
            ]);

        if (storageError) {
            console.error(
                "La photo a été supprimée de la base, mais pas du Storage :",
                storageError,
            );
        }
    }
}

export async function toggleGalleryLike({
    photoId,
    profileId,
    liked,
}) {
    if (liked) {
        const { error } = await supabase
            .from("gallery_likes")
            .delete()
            .eq("photo_id", photoId)
            .eq("profile_id", profileId);

        if (error) {
            throw error;
        }

        return false;
    }

    const { error } = await supabase
        .from("gallery_likes")
        .insert({
            photo_id: photoId,
            profile_id: profileId,
        });

    if (error) {
        throw error;
    }

    return true;
}

export async function addGalleryComment({
    photoId,
    profileId,
    content,
}) {
    const cleanedContent =
        content.trim();

    if (!cleanedContent) {
        throw new Error(
            "Le commentaire est vide.",
        );
    }

    const { data, error } = await supabase
        .from("gallery_comments")
        .insert({
            photo_id: photoId,
            profile_id: profileId,
            content: cleanedContent,
        })
        .select(`
      id,
      profile_id,
      content,
      created_at,
      updated_at,
      author:profiles!gallery_comments_profile_id_fkey (
        id,
        first_name,
        nickname,
        initials,
        avatar_url
      )
    `)
        .single();

    if (error) {
        throw error;
    }

    return mapComment(data);
}

export async function updateGalleryComment(
    commentId,
    content,
) {
    const cleanedContent =
        content.trim();

    if (!cleanedContent) {
        throw new Error(
            "Le commentaire est vide.",
        );
    }

    const { data, error } = await supabase
        .from("gallery_comments")
        .update({
            content:
                cleanedContent,
        })
        .eq("id", commentId)
        .select(`
      id,
      profile_id,
      content,
      created_at,
      updated_at,
      author:profiles!gallery_comments_profile_id_fkey (
        id,
        first_name,
        nickname,
        initials,
        avatar_url
      )
    `)
        .single();

    if (error) {
        throw error;
    }

    return mapComment(data);
}

export async function deleteGalleryComment(
    commentId,
) {
    const { error } = await supabase
        .from("gallery_comments")
        .delete()
        .eq("id", commentId);

    if (error) {
        throw error;
    }
}