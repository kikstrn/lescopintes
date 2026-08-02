import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  Award,
  Dices,
  Filter,
  LoaderCircle,
  Medal,
  RefreshCw,
  Target,
  Trophy,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

const POINT_FILTERS = [
  {
    id: "all",
    label: "Tous",
  },
  {
    id: "weekly_challenge",
    label: "Défis",
  },
  {
    id: "gage",
    label: "Gages",
  },
  {
    id: "tennis",
    label: "Tennis",
  },
];

function formatTransactionDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getSourceLabel(sourceType) {
  switch (sourceType) {
    case "weekly_challenge":
      return "Défi";

    case "gage":
      return "Gage";

    case "tennis":
      return "Tennis";

    default:
      return "Points";
  }
}

function getSourceIcon(sourceType) {
  switch (sourceType) {
    case "weekly_challenge":
      return Target;

    case "gage":
      return Dices;

    case "tennis":
      return Trophy;

    default:
      return Award;
  }
}

function normalizeTransaction(row) {
  return {
    id: row.id,
    profileId:
      row.profile_id,
    amount:
      Number(row.amount ?? 0),
    sourceType:
      row.source_type ?? "general",
    sourceId:
      row.source_id ?? null,
    title:
      row.title ?? "Points attribués",
    description:
      row.description ?? "",
    season:
      row.season ?? null,
    metadata:
      row.metadata ?? {},
    createdAt:
      row.created_at,
  };
}

function ProfilePointsHistory({
  profileId,
}) {
  const [transactions, setTransactions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [activeFilter, setActiveFilter] =
    useState("all");

  const loadTransactions = useCallback(
    async ({
      showMainLoader = false,
    } = {}) => {
      if (!profileId) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      if (showMainLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      try {
        const {
          data,
          error: requestError,
        } = await supabase
          .from("points_transactions")
          .select(`
            id,
            profile_id,
            amount,
            source_type,
            source_id,
            title,
            description,
            season,
            metadata,
            created_at
          `)
          .eq("profile_id", profileId)
          .order("created_at", {
            ascending: false,
          });

        if (requestError) {
          throw requestError;
        }

        setTransactions(
          (data ?? []).map(
            normalizeTransaction,
          ),
        );
      } catch (requestError) {
        console.error(
          "Impossible de charger l’historique des points :",
          requestError,
        );

        setError(
          requestError?.message ??
            "Impossible de charger l’historique des points.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [profileId],
  );

  useEffect(() => {
    loadTransactions({
      showMainLoader: true,
    });
  }, [loadTransactions]);

  useEffect(() => {
    if (!profileId) {
      return undefined;
    }

    const channel = supabase
      .channel(
        `profile-points:${profileId}`,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "points_transactions",
          filter:
            `profile_id=eq.${profileId}`,
        },
        () => {
          loadTransactions();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    profileId,
    loadTransactions,
  ]);

  const filteredTransactions =
    useMemo(() => {
      if (activeFilter === "all") {
        return transactions;
      }

      return transactions.filter(
        (transaction) =>
          transaction.sourceType ===
          activeFilter,
      );
    }, [
      transactions,
      activeFilter,
    ]);

  const totalPoints = useMemo(() => {
    return transactions.reduce(
      (total, transaction) =>
        total + transaction.amount,
      0,
    );
  }, [transactions]);

  const sourceTotals = useMemo(() => {
    return transactions.reduce(
      (totals, transaction) => {
        const currentValue =
          totals.get(
            transaction.sourceType,
          ) ?? 0;

        totals.set(
          transaction.sourceType,
          currentValue +
            transaction.amount,
        );

        return totals;
      },
      new Map(),
    );
  }, [transactions]);

  return (
    <motion.section
      className="profile-points-history glass-panel"
      initial={{
        opacity: 0,
        y: 18,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
    >
      <header className="profile-points-history__header">
        <div>
          <span className="section-heading__eyebrow">
            Récompenses
          </span>

          <h2>
            Historique des points
          </h2>

          <p>
            Retrouve le détail de tous les points validés sur ton profil.
          </p>
        </div>

        <div className="profile-points-history__total">
          <span>
            <Medal size={19} />
          </span>

          <div>
            <small>
              Total actuel
            </small>

            <strong>
              {totalPoints.toLocaleString(
                "fr-FR",
              )}{" "}
              pts
            </strong>
          </div>
        </div>
      </header>

      <div className="profile-points-history__summary">
        {POINT_FILTERS
          .filter(
            (filter) =>
              filter.id !== "all",
          )
          .map((filter) => (
            <div key={filter.id}>
              <small>
                {filter.label}
              </small>

              <strong>
                {Number(
                  sourceTotals.get(
                    filter.id,
                  ) ?? 0,
                ).toLocaleString(
                  "fr-FR",
                )}{" "}
                pts
              </strong>
            </div>
          ))}
      </div>

      <div className="profile-points-history__toolbar">
        <div className="profile-points-history__filters">
          <Filter size={16} />

          {POINT_FILTERS.map(
            (filter) => (
              <button
                key={filter.id}
                type="button"
                className={
                  activeFilter ===
                  filter.id
                    ? "profile-points-history__filter profile-points-history__filter--active"
                    : "profile-points-history__filter"
                }
                onClick={() =>
                  setActiveFilter(
                    filter.id,
                  )
                }
              >
                {filter.label}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          className="profile-points-history__refresh"
          aria-label="Actualiser l’historique"
          disabled={
            loading || refreshing
          }
          onClick={() =>
            loadTransactions()
          }
        >
          {refreshing ? (
            <LoaderCircle
              className="profile-spinner"
              size={17}
            />
          ) : (
            <RefreshCw size={17} />
          )}
        </button>
      </div>

      {loading ? (
        <div className="profile-points-history__state">
          <LoaderCircle
            className="profile-spinner"
            size={24}
          />

          <span>
            Chargement des points…
          </span>
        </div>
      ) : error ? (
        <div className="profile-points-history__state profile-points-history__state--error">
          {error}
        </div>
      ) : filteredTransactions.length ===
        0 ? (
        <div className="profile-points-history__state">
          <Award size={28} />

          <strong>
            Aucun point dans cette catégorie
          </strong>

          <span>
            Les prochains gains apparaîtront automatiquement ici.
          </span>
        </div>
      ) : (
        <div className="profile-points-history__list">
          {filteredTransactions.map(
            (transaction, index) => {
              const Icon =
                getSourceIcon(
                  transaction.sourceType,
                );

              return (
                <motion.article
                  key={transaction.id}
                  className={`profile-points-history__item profile-points-history__item--${transaction.sourceType}`}
                  initial={{
                    opacity: 0,
                    x: 12,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay:
                      Math.min(
                        index * 0.035,
                        0.25,
                      ),
                  }}
                >
                  <span className="profile-points-history__icon">
                    <Icon size={19} />
                  </span>

                  <div className="profile-points-history__content">
                    <div>
                      <span>
                        {getSourceLabel(
                          transaction.sourceType,
                        )}
                      </span>

                      <small>
                        {formatTransactionDate(
                          transaction.createdAt,
                        )}
                      </small>
                    </div>

                    <strong>
                      {transaction.title}
                    </strong>

                    {transaction.description && (
                      <p>
                        {transaction.description}
                      </p>
                    )}
                  </div>

                  <strong
                    className={
                      transaction.amount >= 0
                        ? "profile-points-history__amount profile-points-history__amount--positive"
                        : "profile-points-history__amount profile-points-history__amount--negative"
                    }
                  >
                    {transaction.amount >= 0
                      ? "+"
                      : ""}
                    {transaction.amount.toLocaleString(
                      "fr-FR",
                    )}{" "}
                    pts
                  </strong>
                </motion.article>
              );
            },
          )}
        </div>
      )}
    </motion.section>
  );
}

export default ProfilePointsHistory;
