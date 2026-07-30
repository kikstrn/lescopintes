import {
    Bike,
    CalendarDays,
    Camera,
    ChevronRight,
    Flame,
    Gavel,
    Heart,
    MessageCircle,
    Scale,
    Trophy,
    CheckCircle2,
    Target,
    XCircle,
} from "lucide-react";

const activityIcons = {
    event_created: CalendarDays,
    tennis_match_created: Trophy,
    bike_ride_created: Bike,
    gallery_photo_added: Camera,

    tribunal_case_created: Scale,
    tribunal_case_judged: Gavel,
    tribunal_case_dismissed: Scale,

    tribunal_vote_opened: Gavel,

    challenge_created: Flame,

    gage_assigned: Target,
    gage_completed: CheckCircle2,
    gage_validated: CheckCircle2,
    gage_cancelled: XCircle,
};

function getGalleryPhoto(
    activity,
    galleryPhotos,
) {
    if (
        activity.activityType !==
        "gallery_photo_added"
    ) {
        return null;
    }

    const entityId = String(
        activity.entityId ??
        activity.metadata?.photo_id ??
        "",
    );

    if (!entityId) {
        return null;
    }

    return (
        galleryPhotos.find(
            (photo) =>
                String(photo.id) === entityId,
        ) ?? null
    );
}

function formatRelativeDate(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const difference =
        Date.now() - date.getTime();

    const minutes = Math.floor(
        difference / 60000,
    );

    if (minutes < 1) {
        return "À l’instant";
    }

    if (minutes < 60) {
        return `Il y a ${minutes} min`;
    }

    const hours = Math.floor(
        minutes / 60,
    );

    if (hours < 24) {
        return `Il y a ${hours} h`;
    }

    const days = Math.floor(
        hours / 24,
    );

    if (days === 1) {
        return "Hier";
    }

    if (days < 7) {
        return `Il y a ${days} jours`;
    }

    return new Intl.DateTimeFormat(
        "fr-FR",
        {
            day: "numeric",
            month: "short",
        },
    ).format(date);
}

function getActorName(activity) {
    return (
        activity?.actor?.nickname ??
        activity?.actor?.first_name ??
        "Un membre"
    );
}

function getActorInitials(activity) {
    const actorName =
        getActorName(activity);

    return (
        activity?.actor?.initials ??
        actorName
            .split(/\s+/)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
    );
}

function formatNumber(value, digits = 1) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return null;
    }

    return number.toLocaleString(
        "fr-FR",
        {
            maximumFractionDigits: digits,
        },
    );
}

function ActivityMetrics({
    activity,
}) {
    const metadata =
        activity.metadata ?? {};

    if (
        activity.activityType ===
        "bike_ride_created"
    ) {
        const distance =
            formatNumber(
                metadata.distance ??
                metadata.distance_km,
            );

        const duration =
            Number(
                metadata.duration ??
                metadata.duration_minutes,
            );

        const speed =
            formatNumber(
                metadata.speed ??
                metadata.average_speed,
            );

        return (
            <div className="live-activity__metrics">
                {distance && (
                    <span>
                        <strong>{distance}</strong>
                        <small>km</small>
                    </span>
                )}

                {duration > 0 && (
                    <span>
                        <strong>
                            {Math.floor(duration / 60) > 0
                                ? `${Math.floor(
                                    duration / 60,
                                )} h ${duration % 60} min`
                                : `${duration} min`}
                        </strong>
                        <small>durée</small>
                    </span>
                )}

                {speed && (
                    <span>
                        <strong>{speed}</strong>
                        <small>km/h</small>
                    </span>
                )}
            </div>
        );
    }

    if (
        activity.activityType ===
        "tennis_match_created"
    ) {
        return (
            <div className="live-activity__tags">
                <span>
                    {metadata.match_type ===
                        "singles"
                        ? "Simple"
                        : "Double"}
                </span>

                {metadata.score && (
                    <span>{metadata.score}</span>
                )}
            </div>
        );
    }

    if (
        activity.activityType ===
        "gallery_photo_added" &&
        metadata.photo_count
    ) {
        return (
            <div className="live-activity__tags">
                <span>
                    {metadata.photo_count} photo
                    {Number(metadata.photo_count) > 1
                        ? "s"
                        : ""}
                </span>
            </div>
        );
    }

    return null;
}

function LiveActivityFeed({
    activities = [],
    galleryPhotos = [],
    loading = false,
    error = null,
    onNavigate,
}) {
    return (
        <section className="live-activity glass-panel">
            <header className="live-activity__header">
                <div>
                    <span className="section-heading__eyebrow">
                        En direct
                    </span>

                    <h2>Activité du groupe</h2>
                </div>

                <span className="live-activity__status">
                    <i />
                    Temps réel
                </span>
            </header>

            <div className="live-activity__content">
                {loading && (
                    <div className="live-activity__state">
                        <span className="data-status__spinner" />

                        <p>
                            Chargement de l’activité…
                        </p>
                    </div>
                )}

                {!loading && error && (
                    <div className="live-activity__state live-activity__state--error">
                        <strong>
                            Impossible de charger le flux
                        </strong>

                        <p>{error}</p>
                    </div>
                )}

                {!loading &&
                    !error &&
                    activities.length === 0 && (
                        <div className="live-activity__state">
                            <strong>
                                Le groupe est calme
                            </strong>

                            <p>
                                Les prochaines activités
                                apparaîtront ici.
                            </p>
                        </div>
                    )}

                {!loading &&
                    !error &&
                    activities.map((activity) => {
                        const Icon =
                            activityIcons[
                            activity.activityType
                            ] ?? Flame;

                        const actorName =
                            getActorName(activity);

                        const galleryPhoto =
                            getGalleryPhoto(
                                activity,
                                galleryPhotos,
                            );

                        const galleryPhotoUrl =
                            galleryPhoto?.signedUrl ??
                            galleryPhoto?.signed_url ??
                            galleryPhoto?.publicUrl ??
                            galleryPhoto?.public_url ??
                            galleryPhoto?.url ??
                            null;

                        const galleryCaption =
                            galleryPhoto?.caption ??
                            activity.metadata?.caption ??
                            activity.message ??
                            null;

                        return (
                            <article
                                key={activity.id}
                                className={`live-activity__item live-activity__item--${activity.activityType}`}
                            >
                                <div className="live-activity__avatar">
                                    {activity.actor
                                        ?.avatar_url ? (
                                        <img
                                            src={
                                                activity.actor
                                                    .avatar_url
                                            }
                                            alt=""
                                        />
                                    ) : (
                                        getActorInitials(
                                            activity,
                                        )
                                    )}

                                    <span className="live-activity__icon">
                                        <Icon size={15} />
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className="live-activity__main"
                                    onClick={() =>
                                        onNavigate?.(
                                            activity.pageId ??
                                            "home",
                                        )
                                    }
                                >
                                    <span className="live-activity__title">
                                        <strong>
                                            {activity.title}
                                        </strong>

                                        <small>
                                            {formatRelativeDate(
                                                activity.createdAt,
                                            )}
                                        </small>
                                    </span>

                                    {activity.activityType ===
                                        "gallery_photo_added" &&
                                        galleryPhotoUrl && (
                                            <span className="live-activity__photo">
                                                <img
                                                    src={galleryPhotoUrl}
                                                    alt={
                                                        galleryCaption
                                                            ? `Photo : ${galleryCaption}`
                                                            : "Photo ajoutée à la galerie"
                                                    }
                                                    loading="lazy"
                                                />

                                                <span className="live-activity__photo-overlay">
                                                    <Camera size={18} />
                                                    Voir dans la galerie
                                                </span>
                                            </span>
                                        )}

                                    {activity.activityType ===
                                        "gallery_photo_added" ? (
                                        galleryCaption && (
                                            <span className="live-activity__message live-activity__message--caption">
                                                « {galleryCaption} »
                                            </span>
                                        )
                                    ) : (
                                        activity.message && (
                                            <span className="live-activity__message">
                                                {activity.message}
                                            </span>
                                        )
                                    )}

                                    <ActivityMetrics
                                        activity={activity}
                                    />
                                </button>

                                <button
                                    type="button"
                                    className="live-activity__open"
                                    aria-label={`Ouvrir l’activité de ${actorName}`}
                                    onClick={() =>
                                        onNavigate?.(
                                            activity.pageId ??
                                            "home",
                                        )
                                    }
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </article>
                        );
                    })}
            </div>
        </section>
    );
}

export default LiveActivityFeed;