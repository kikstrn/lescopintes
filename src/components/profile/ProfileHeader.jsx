import { useRef, useState } from "react";
import { motion } from "framer-motion";

import {
  Camera,
  CheckCircle2,
  Edit3,
  ImagePlus,
  KeyRound,
  LoaderCircle,
  ShieldCheck,
  Trash2,
} from "lucide-react";

function formatMemberSince(value) {
  if (!value) {
    return "Date inconnue";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function ProfileHeader({
  profile,
  saving = false,
  uploadingAvatar = false,
  error = null,
  onEditProfile,
  onChangePassword,
  onUploadAvatar,
  onDeleteAvatar,
}) {
  const avatarInputRef = useRef(null);

  const [avatarError, setAvatarError] =
    useState("");

  if (!profile) {
    return null;
  }

  const roleLabel =
    profile.role === "admin"
      ? "Administrateur"
      : "Membre";

  const handleAvatarSelection = async (
    event,
  ) => {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setAvatarError("");

    try {
      await onUploadAvatar(file);
    } catch (requestError) {
      setAvatarError(
        requestError?.message ??
          "Impossible de modifier la photo de profil.",
      );
    }
  };

  const handleDeleteAvatar =
    async () => {
      const confirmed =
        window.confirm(
          "Supprimer ta photo de profil ?",
        );

      if (!confirmed) {
        return;
      }

      setAvatarError("");

      try {
        await onDeleteAvatar();
      } catch (requestError) {
        setAvatarError(
          requestError?.message ??
            "Impossible de supprimer la photo de profil.",
        );
      }
    };

  return (
    <motion.header
      className="profile-premium-header"
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
    >
      <div className="profile-premium-header__banner">
        <div className="profile-premium-header__glow" />

        <div className="profile-premium-header__pattern" />

        <span className="profile-premium-header__brand">
          LES CO’PINTES
        </span>
      </div>

      <div className="profile-premium-header__content">
        <div className="profile-premium-header__avatar-column">
          <div className="profile-premium-avatar">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={`Photo de profil de ${profile.nickname}`}
              />
            ) : (
              <span>
                {profile.initials}
              </span>
            )}

            {uploadingAvatar && (
              <div className="profile-premium-avatar__loading">
                <LoaderCircle
                  className="profile-spinner"
                  size={26}
                />
              </div>
            )}

            <button
              type="button"
              className="profile-premium-avatar__edit"
              aria-label="Changer la photo de profil"
              disabled={
                uploadingAvatar
              }
              onClick={() =>
                avatarInputRef.current?.click()
              }
            >
              <Camera size={18} />
            </button>
          </div>

          <input
            ref={avatarInputRef}
            type="file"
            hidden
            accept="image/jpeg,image/png,image/webp"
            onChange={
              handleAvatarSelection
            }
          />

          <div className="profile-premium-avatar__actions">
            <button
              type="button"
              disabled={
                uploadingAvatar
              }
              onClick={() =>
                avatarInputRef.current?.click()
              }
            >
              <ImagePlus size={15} />

              {profile.avatarUrl
                ? "Changer"
                : "Ajouter"}
            </button>

            {profile.avatarUrl && (
              <button
                type="button"
                className="profile-premium-avatar__delete"
                disabled={
                  uploadingAvatar
                }
                onClick={
                  handleDeleteAvatar
                }
              >
                <Trash2 size={15} />
                Supprimer
              </button>
            )}
          </div>
        </div>

        <div className="profile-premium-header__identity">
          <div className="profile-premium-header__badges">
            <span className="profile-premium-role">
              <ShieldCheck size={15} />
              {roleLabel}
            </span>

            <span className="profile-premium-member-since">
              <CheckCircle2
                size={14}
              />

              Membre depuis{" "}
              {formatMemberSince(
                profile.createdAt,
              )}
            </span>
          </div>

          <div className="profile-premium-header__name-row">
            <div>
              <h1>
                {profile.nickname}
              </h1>

              <p>
                {profile.firstName}
              </p>
            </div>

            <span className="profile-premium-header__initials">
              {profile.initials}
            </span>
          </div>

          <p className="profile-premium-header__bio">
            {profile.bio ||
              "Aucune bio pour le moment. Ajoute quelques mots pour te présenter aux autres Co’Pintes."}
          </p>

          <div className="profile-premium-header__buttons">
            <button
              type="button"
              className="primary-button"
              disabled={saving}
              onClick={onEditProfile}
            >
              <Edit3 size={17} />
              Modifier le profil
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={
                onChangePassword
              }
            >
              <KeyRound size={17} />
              Changer le mot de passe
            </button>
          </div>

          {(avatarError || error) && (
            <div className="profile-premium-header__error">
              {avatarError || error}
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}

export default ProfileHeader;