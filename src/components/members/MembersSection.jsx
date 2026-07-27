import { useMemo, useState } from "react";
import {
  CircleUserRound,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

import MemberCard from "./MemberCard";

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function MembersSection({
  members = [],
  loading = false,
  error = null,
  currentProfileId,
  onOpenMember,
}) {
  const [searchValue, setSearchValue] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("all");

  const filteredMembers = useMemo(() => {
    const normalizedSearch =
      normalizeText(searchValue);

    return members
      .filter((member) => {
        if (
          roleFilter !== "all" &&
          member.role !== roleFilter
        ) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        const searchableText = [
          member.nickname,
          member.firstName,
          member.initials,
          member.bio,
        ]
          .map(normalizeText)
          .join(" ");

        return searchableText.includes(
          normalizedSearch,
        );
      })
      .sort((memberA, memberB) => {
        const memberAIsCurrent =
          memberA.id === currentProfileId;

        const memberBIsCurrent =
          memberB.id === currentProfileId;

        if (
          memberAIsCurrent &&
          !memberBIsCurrent
        ) {
          return -1;
        }

        if (
          !memberAIsCurrent &&
          memberBIsCurrent
        ) {
          return 1;
        }

        if (
          memberA.role === "admin" &&
          memberB.role !== "admin"
        ) {
          return -1;
        }

        if (
          memberA.role !== "admin" &&
          memberB.role === "admin"
        ) {
          return 1;
        }

        return String(
          memberA.nickname ??
            memberA.firstName ??
            "",
        ).localeCompare(
          String(
            memberB.nickname ??
              memberB.firstName ??
              "",
          ),
          "fr",
          {
            sensitivity: "base",
          },
        );
      });
  }, [
    members,
    searchValue,
    roleFilter,
    currentProfileId,
  ]);

  const adminCount = useMemo(() => {
    return members.filter(
      (member) =>
        member.role === "admin",
    ).length;
  }, [members]);

  if (loading) {
    return (
      <section className="members-section">
        <div className="members-state glass-panel">
          <span className="data-status__spinner" />

          <div>
            <strong>
              Chargement des membres
            </strong>

            <p>
              Récupération des profils de la bande…
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="members-section">
        <div className="members-state members-state--error glass-panel">
          <CircleUserRound size={34} />

          <div>
            <strong>
              Impossible de charger les membres
            </strong>

            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="members-section">
      <header className="members-header glass-panel">
        <div className="members-header__content">
          <span className="section-heading__eyebrow">
            La bande
          </span>

          <h1>Les membres</h1>

          <p>
            Retrouve tous les membres des
            Co’Pintes, leurs profils et leurs
            statistiques principales.
          </p>
        </div>

        <div className="members-header__stats">
          <div>
            <Users size={20} />

            <span>
              <strong>
                {members.length}
              </strong>

              <small>
                Membre
                {members.length > 1
                  ? "s"
                  : ""}
              </small>
            </span>
          </div>

          <div>
            <ShieldCheck size={20} />

            <span>
              <strong>
                {adminCount}
              </strong>

              <small>
                Administrateur
                {adminCount > 1
                  ? "s"
                  : ""}
              </small>
            </span>
          </div>
        </div>
      </header>

      <div className="members-toolbar">
        <label className="members-search">
          <Search size={18} />

          <input
            type="search"
            value={searchValue}
            placeholder="Rechercher un membre…"
            onChange={(event) =>
              setSearchValue(
                event.target.value,
              )
            }
          />
        </label>

        <div
          className="members-filters"
          role="group"
          aria-label="Filtrer les membres"
        >
          <button
            type="button"
            className={
              roleFilter === "all"
                ? "members-filter members-filter--active"
                : "members-filter"
            }
            onClick={() =>
              setRoleFilter("all")
            }
          >
            Tous
          </button>

          <button
            type="button"
            className={
              roleFilter === "admin"
                ? "members-filter members-filter--active"
                : "members-filter"
            }
            onClick={() =>
              setRoleFilter("admin")
            }
          >
            Administrateurs
          </button>

          <button
            type="button"
            className={
              roleFilter === "member"
                ? "members-filter members-filter--active"
                : "members-filter"
            }
            onClick={() =>
              setRoleFilter("member")
            }
          >
            Membres
          </button>
        </div>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="members-empty glass-panel">
          <span>
            <Search size={29} />
          </span>

          <h2>
            Aucun membre trouvé
          </h2>

          <p>
            Modifie la recherche ou le filtre
            sélectionné.
          </p>
        </div>
      ) : (
        <div className="members-grid">
          {filteredMembers.map(
            (member) => (
              <MemberCard
                key={member.id}
                member={member}
                onOpen={
                  onOpenMember
                }
              />
            ),
          )}
        </div>
      )}
    </section>
  );
}

export default MembersSection;