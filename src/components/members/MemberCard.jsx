import {
  Bike,
  Camera,
  ChevronRight,
  Crown,
  Trophy,
} from "lucide-react";

function MemberCard({
  member,
  onOpen,
}) {
  const roleLabel =
    member.role === "admin"
      ? "Administrateur"
      : "Membre";

  return (
    <article className="member-card glass-panel">
      <button
        type="button"
        className="member-card__button"
        onClick={() => onOpen?.(member)}
      >
        <div className="member-card__header">
          <div className="member-card__avatar">
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

          <div className="member-card__identity">
            <div className="member-card__name-row">
              <h3>
                {member.nickname ??
                  "Membre"}
              </h3>

              {member.role === "admin" && (
                <Crown size={16} />
              )}
            </div>

            <p>
              {member.firstName ??
                ""}
            </p>

            <span
              className={
                member.role === "admin"
                  ? "member-card__role member-card__role--admin"
                  : "member-card__role"
              }
            >
              {roleLabel}
            </span>
          </div>

          <ChevronRight
            className="member-card__chevron"
            size={19}
          />
        </div>

        {member.bio && (
          <p className="member-card__bio">
            {member.bio}
          </p>
        )}

        <div className="member-card__stats">
          <div>
            <Trophy size={16} />

            <span>
              <strong>
                {member.wins ?? 0}
              </strong>

              <small>Victoires</small>
            </span>
          </div>

          <div>
            <Bike size={16} />

            <span>
              <strong>
                {Number(
                  member.bikeKm ?? 0,
                ).toLocaleString("fr-FR")}
              </strong>

              <small>km vélo</small>
            </span>
          </div>

          <div>
            <Camera size={16} />

            <span>
              <strong>
                {member.photoCount ?? 0}
              </strong>

              <small>Photos</small>
            </span>
          </div>
        </div>
      </button>
    </article>
  );
}

export default MemberCard;