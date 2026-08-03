import {
  Copy,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Trash2,
  UserRoundCog,
  XCircle,
} from "lucide-react";

function TournamentAdminMenu({
  open = false,
  onToggle,
  onAction,
}) {
  const runAction = (
    action,
  ) => {
    onToggle?.(false);
    onAction?.(action);
  };

  return (
    <div className="tournament-admin-menu-wrap">
      <button
        type="button"
        className="tournament-admin-menu-trigger"
        aria-label="Administrer le tournoi"
        aria-expanded={open}
        onClick={() =>
          onToggle?.(!open)
        }
      >
        <MoreHorizontal
          size={20}
        />
      </button>

      {open && (
        <div className="tournament-admin-menu">
          <button
            type="button"
            onClick={() =>
              runAction("edit")
            }
          >
            <Pencil size={16} />
            Modifier
          </button>

          <button
            type="button"
            onClick={() =>
              runAction("players")
            }
          >
            <UserRoundCog
              size={16}
            />
            Joueurs
          </button>

          <button
            type="button"
            onClick={() =>
              runAction(
                "regenerate",
              )
            }
          >
            <RefreshCw
              size={16}
            />
            Régénérer
          </button>

          <button
            type="button"
            onClick={() =>
              runAction(
                "duplicate",
              )
            }
          >
            <Copy size={16} />
            Dupliquer
          </button>

          <span />

          <button
            type="button"
            className="tournament-admin-menu__danger"
            onClick={() =>
              runAction("cancel")
            }
          >
            <XCircle
              size={16}
            />
            Annuler
          </button>

          <button
            type="button"
            className="tournament-admin-menu__danger"
            onClick={() =>
              runAction("delete")
            }
          >
            <Trash2
              size={16}
            />
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
}

export default TournamentAdminMenu;
