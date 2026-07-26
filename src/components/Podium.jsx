import { motion } from "framer-motion";
import { Crown, Medal, Trophy } from "lucide-react";

function PodiumMember({ member, rank, positionClass }) {
  const initials = member.initials ?? member.nickname.slice(0, 2).toUpperCase();

  return (
    <motion.div
      className={`podium-member podium-member--${positionClass}`}
      initial={{
        opacity: 0,
        y: 28,
        scale: 0.92,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        delay: rank * 0.12,
        type: "spring",
        stiffness: 240,
        damping: 22,
      }}
    >
      <div className="podium-member__identity">
        {rank === 1 && (
          <motion.span
            className="podium-member__crown"
            animate={{
              y: [0, -4, 0],
              rotate: [0, -4, 4, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Crown size={25} />
          </motion.span>
        )}

        <div className="podium-member__avatar-ring">
          <div className="podium-member__avatar">{initials}</div>
        </div>

        <strong>{member.nickname}</strong>
        <small>{member.points} points</small>
      </div>

      <div className="podium-member__platform">
        <span className="podium-member__rank">{rank}</span>

        <span className="podium-member__platform-glow" />
      </div>
    </motion.div>
  );
}

function Podium({ members }) {
  const first = members[0];
  const second = members[1];
  const third = members[2];

  return (
    <motion.section
      className="podium-card glass-panel"
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="podium-card__header">
        <div>
          <span className="section-heading__eyebrow">Classement</span>
          <h2>Podium des Co’Pintes</h2>
        </div>

        <span className="podium-card__header-icon">
          <Trophy size={20} />
        </span>
      </div>

      <div className="podium">
        {second && (
          <PodiumMember
            member={second}
            rank={2}
            positionClass="second"
          />
        )}

        {first && (
          <PodiumMember
            member={first}
            rank={1}
            positionClass="first"
          />
        )}

        {third && (
          <PodiumMember
            member={third}
            rank={3}
            positionClass="third"
          />
        )}
      </div>

      <div className="podium-card__ranking-list">
        {members.slice(0, 5).map((member, index) => (
          <motion.div
            key={member.id}
            className="podium-ranking-item"
            initial={{
              opacity: 0,
              x: 12,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.35 + index * 0.05,
            }}
          >
            <span className="podium-ranking-item__rank">
              {index < 3 ? (
                <Medal size={16} />
              ) : (
                index + 1
              )}
            </span>

            <span className="podium-ranking-item__avatar">
              {member.initials}
            </span>

            <div className="podium-ranking-item__identity">
              <strong>{member.nickname}</strong>
              <small>{member.firstName}</small>
            </div>

            <div className="podium-ranking-item__points">
              <strong>{member.points}</strong>
              <small>pts</small>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

export default Podium;