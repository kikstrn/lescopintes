import {
    AnimatePresence,
    motion,
} from "framer-motion";

import {
    Bike,
    CalendarDays,
    Camera,
    Crown,
    Heart,
    Medal,
    Mountain,
    ShieldCheck,
    Sparkles,
    Trophy,
    X,
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

function formatDistance(value) {
    return Number(value ?? 0).toLocaleString(
        "fr-FR",
        {
            maximumFractionDigits: 1,
        },
    );
}

function MemberProfileModal({
    open,
    member,
    statistics = null,
    loading = false,
    error = null,
    onClose,
}) {
    if (!member) {
        return null;
    }

    const roleLabel =
        member.role === "admin"
            ? "Administrateur"
            : "Membre";

    const stats = statistics ?? {
        tennisMatches:
            member.matches ??
            member.tennisMatches ??
            0,

        tennisWins:
            member.wins ??
            member.tennisWins ??
            0,

        tennisWinRate:
            member.winRate ??
            member.tennisWinRate ??
            0,

        bikeRideCount:
            member.bikeRideCount ??
            0,

        bikeDistance:
            member.bikeKm ??
            member.bikeDistance ??
            0,

        bikeElevation:
            member.bikeElevation ??
            0,

        photoCount:
            member.photoCount ??
            0,

        receivedLikeCount:
            member.receivedLikeCount ??
            0,
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.button
                        type="button"
                        className="member-profile-modal__overlay"
                        aria-label="Fermer la fiche du membre"
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1,
                        }}
                        exit={{
                            opacity: 0,
                        }}
                        onClick={onClose}
                    />

                    <motion.section
                        className="member-profile-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="member-profile-modal-title"
                        initial={{
                            opacity: 0,
                            scale: 0.96,
                            y: 12,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.97,
                            y: 8,
                        }}
                    >
                        <header className="member-profile-modal__banner">
                            <div className="member-profile-modal__glow" />

                            <button
                                type="button"
                                className="member-profile-modal__close"
                                aria-label="Fermer"
                                onClick={onClose}
                            >
                                <X size={21} />
                            </button>

                            <div className="member-profile-modal__avatar">
                                {member.avatarUrl ? (
                                    <img
                                        src={member.avatarUrl}
                                        alt={`Profil de ${member.nickname}`}
                                    />
                                ) : (
                                    <span>
                                        {member.initials ?? "CP"}
                                    </span>
                                )}
                            </div>
                        </header>

                        <div className="member-profile-modal__content">
                            <div className="member-profile-modal__identity">
                                <div>
                                    <span
                                        className={
                                            member.role === "admin"
                                                ? "member-profile-modal__role member-profile-modal__role--admin"
                                                : "member-profile-modal__role"
                                        }
                                    >
                                        {member.role === "admin" ? (
                                            <Crown size={15} />
                                        ) : (
                                            <ShieldCheck size={15} />
                                        )}

                                        {roleLabel}
                                    </span>

                                    <h2 id="member-profile-modal-title">
                                        {member.nickname ??
                                            "Membre"}
                                    </h2>

                                    <p>
                                        {member.firstName ??
                                            ""}
                                    </p>
                                </div>

                                <span className="member-profile-modal__initials">
                                    {member.initials ?? "CP"}
                                </span>
                            </div>

                            <div className="member-profile-modal__member-since">
                                <CalendarDays size={16} />

                                Membre depuis{" "}
                                {formatMemberSince(
                                    member.createdAt,
                                )}
                            </div>

                            <p className="member-profile-modal__bio">
                                {member.bio ||
                                    "Ce membre n’a pas encore ajouté de présentation."}
                            </p>

                            {loading ? (
                                <div className="member-profile-modal__loading">
                                    <span className="data-status__spinner" />

                                    <p>
                                        Chargement des statistiques…
                                    </p>
                                </div>
                            ) : error ? (
                                <div className="member-profile-modal__error">
                                    <strong>
                                        Statistiques indisponibles
                                    </strong>

                                    <p>{error}</p>
                                </div>
                            ) : (
                                <>
                                    <section className="member-profile-modal__stats">
                                        <article>
                                            <span className="member-profile-modal__stat-icon member-profile-modal__stat-icon--green">
                                                <Trophy size={19} />
                                            </span>

                                            <div>
                                                <small>
                                                    Matchs joués
                                                </small>

                                                <strong>
                                                    {stats.tennisMatches ??
                                                        0}
                                                </strong>
                                            </div>
                                        </article>

                                        <article>
                                            <span className="member-profile-modal__stat-icon member-profile-modal__stat-icon--amber">
                                                <Medal size={19} />
                                            </span>

                                            <div>
                                                <small>
                                                    Victoires
                                                </small>

                                                <strong>
                                                    {stats.tennisWins ??
                                                        0}
                                                </strong>
                                            </div>
                                        </article>

                                        <article>
                                            <span className="member-profile-modal__stat-icon member-profile-modal__stat-icon--purple">
                                                <Sparkles size={19} />
                                            </span>

                                            <div>
                                                <small>
                                                    Taux de victoire
                                                </small>

                                                <strong>
                                                    {stats.tennisWinRate ??
                                                        0}{" "}
                                                    %
                                                </strong>
                                            </div>
                                        </article>

                                        <article>
                                            <span className="member-profile-modal__stat-icon member-profile-modal__stat-icon--blue">
                                                <Bike size={19} />
                                            </span>

                                            <div>
                                                <small>
                                                    Sorties vélo
                                                </small>

                                                <strong>
                                                    {stats.bikeRideCount ??
                                                        0}
                                                </strong>
                                            </div>
                                        </article>

                                        <article>
                                            <span className="member-profile-modal__stat-icon member-profile-modal__stat-icon--blue">
                                                <Bike size={19} />
                                            </span>

                                            <div>
                                                <small>
                                                    Distance vélo
                                                </small>

                                                <strong>
                                                    {formatDistance(
                                                        stats.bikeDistance,
                                                    )}{" "}
                                                    km
                                                </strong>
                                            </div>
                                        </article>

                                        <article>
                                            <span className="member-profile-modal__stat-icon member-profile-modal__stat-icon--green">
                                                <Mountain size={19} />
                                            </span>

                                            <div>
                                                <small>
                                                    Dénivelé
                                                </small>

                                                <strong>
                                                    {Math.round(
                                                        Number(
                                                            stats.bikeElevation ??
                                                            0,
                                                        ),
                                                    ).toLocaleString(
                                                        "fr-FR",
                                                    )}{" "}
                                                    m
                                                </strong>
                                            </div>
                                        </article>

                                        <article>
                                            <span className="member-profile-modal__stat-icon member-profile-modal__stat-icon--purple">
                                                <Camera size={19} />
                                            </span>

                                            <div>
                                                <small>
                                                    Photos
                                                </small>

                                                <strong>
                                                    {stats.photoCount ??
                                                        0}
                                                </strong>
                                            </div>
                                        </article>

                                        <article>
                                            <span className="member-profile-modal__stat-icon member-profile-modal__stat-icon--red">
                                                <Heart size={19} />
                                            </span>

                                            <div>
                                                <small>
                                                    Likes reçus
                                                </small>

                                                <strong>
                                                    {stats.receivedLikeCount ??
                                                        0}
                                                </strong>
                                            </div>
                                        </article>
                                    </section>

                                    <section className="member-profile-modal__summary">
                                        <div>
                                            <Trophy size={21} />

                                            <span>
                                                <small>
                                                    Tennis
                                                </small>

                                                <strong>
                                                    {stats.tennisWins ??
                                                        0}{" "}
                                                    victoire
                                                    {(stats.tennisWins ??
                                                        0) > 1
                                                        ? "s"
                                                        : ""}
                                                </strong>
                                            </span>
                                        </div>

                                        <div>
                                            <Bike size={21} />

                                            <span>
                                                <small>
                                                    Cyclisme
                                                </small>

                                                <strong>
                                                    {formatDistance(
                                                        stats.bikeDistance,
                                                    )}{" "}
                                                    km
                                                </strong>
                                            </span>
                                        </div>

                                        <div>
                                            <Camera size={21} />

                                            <span>
                                                <small>
                                                    Galerie
                                                </small>

                                                <strong>
                                                    {stats.photoCount ??
                                                        0}{" "}
                                                    photo
                                                    {(stats.photoCount ??
                                                        0) > 1
                                                        ? "s"
                                                        : ""}
                                                </strong>
                                            </span>
                                        </div>
                                    </section>
                                </>
                            )}
                        </div>
                    </motion.section>
                </>
            )}
        </AnimatePresence>
    );
}

export default MemberProfileModal;