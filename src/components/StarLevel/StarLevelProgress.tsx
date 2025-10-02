import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Trophy,
  Star,
  Users,
  Crown,
  Gift,
  Info,
  CheckCircle2,
  Lock as LockIcon,
} from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useUserAllRewards } from "../../graphql";
import { starLevels as STAR_LEVELS, goldenStar as GOLDEN_STAR } from "./constants";

type LevelUsers = Record<number, number>;
type Density = "compact" | "comfortable";

type Props = {
  currentLevel: 0 | 1 | 2 | 3 | 4 | 5;
  directReferrals: number;
  levelUsers: LevelUsers;
  isGoldenStar?: boolean;
  goldenStarWindowDays?: number;
  density?: Density;
};

/* ====== Theme ====== */
const levelTheme = {
  1: { dot: "bg-amber-500", ring: "text-amber-400", pill: "border-amber-500/30 bg-amber-100/10", grad: "from-amber-500 to-yellow-400" },
  2: { dot: "bg-sky-500",   ring: "text-sky-400",   pill: "border-sky-500/30 bg-sky-100/10",     grad: "from-sky-500 to-cyan-400" },
  3: { dot: "bg-violet-500",ring: "text-violet-400",pill: "border-violet-500/30 bg-violet-100/10",grad: "from-violet-500 to-fuchsia-400" },
  4: { dot: "bg-emerald-500",ring: "text-emerald-400",pill: "border-emerald-500/30 bg-emerald-100/10",grad: "from-emerald-500 to-green-400" },
  5: { dot: "bg-rose-500",  ring: "text-rose-400",  pill: "border-rose-500/30 bg-rose-100/10",   grad: "from-rose-500 to-orange-400" },
} as const;

const densityMap: Record<Density, { pad: string; gap: string; text: string; title: string; sectionPad: string }> = {
  compact:      { pad: "p-4", gap: "gap-3", text: "text-[13px]", title: "text-sm",  sectionPad: "p-4" },
  comfortable:  { pad: "p-6", gap: "gap-4", text: "text-sm",      title: "text-base", sectionPad: "p-6" },
};

/* ====== Small UI atoms ====== */
const Chip: React.FC<{ icon: React.ElementType; children: React.ReactNode; className?: string; title?: string }> = ({
  icon: Icon, children, className, title,
}) => (
  <div
    title={title}
    className={clsx(
      "inline-flex items-center gap-1.5 text-xs rounded-xl px-2.5 py-1 border backdrop-blur",
      "bg-white/5 dark:bg-white/5",
      className
    )}
  >
    <Icon className="w-3.5 h-3.5 opacity-90" />
    <span className="opacity-90 leading-none">{children}</span>
  </div>
);

const Bar: React.FC<{ value: number; thin?: boolean; className?: string }> = ({ value, thin = false, className }) => {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={clsx(
        "w-full rounded-full bg-gray-200/70 dark:bg-gray-800/80 overflow-hidden",
        thin ? "h-1.5" : "h-2.5",
        className
      )}
    >
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ type: "spring", stiffness: 160, damping: 22 }}
      />
    </div>
  );
};

/* Level token */
const LevelToken: React.FC<{ achieved: boolean; level: number }> = ({ achieved, level }) => {
  const theme = levelTheme[level as 1|2|3|4|5];
  return (
    <div className="relative w-10 h-10 rounded-full grid place-items-center bg-white/70 dark:bg-gray-900/60 border border-white/10">
      <Star className={clsx("w-5 h-5", theme.ring)} />
      <div className={clsx("absolute -bottom-1 w-2 h-2 rounded-full", theme.dot)} />
      <AnimatePresence>
        {achieved && (
          <motion.div
            className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-[2px]"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* Level card */
const LevelCard: React.FC<{
  lvl: number;
  active: boolean;
  achieved: boolean;
  requirement: string;
  pct: number;
  onSelect: () => void;
}> = ({ lvl, active, achieved, requirement, pct, onSelect }) => {
  const theme = levelTheme[lvl as 1|2|3|4|5];

  return (
    <button
      onClick={onSelect}
      className="snap-start w-36 shrink-0 transform-gpu"
      title={`${lvl}-Star • ${requirement}`}
    >
      <div
        className={clsx(
          "rounded-2xl p-[1.5px] transition-shadow",
          active ? `bg-gradient-to-tr ${theme.grad} shadow-[0_12px_28px_-12px_rgba(0,0,0,.45)]` : "bg-transparent"
        )}
      >
        <div className="rounded-2xl px-3 py-3 min-h-[96px] bg-white/60 dark:bg-gray-900/60 border border-white/10 backdrop-blur">
          <div className="flex items-center gap-3">
            <LevelToken achieved={achieved} level={lvl} />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-100">{lvl}-Star</div>
              <div className="text-[11px] text-gray-400 line-clamp-1">{requirement || "—"}</div>
            </div>
          </div>
          <Bar value={pct} thin className="mt-2" />
        </div>
      </div>
    </button>
  );
};

/* ====== Main Component ====== */
const StarJourneyPanel: React.FC<Props> = ({
  currentLevel,
  directReferrals,
  levelUsers,
  isGoldenStar = false,
  goldenStarWindowDays = 30,
  density = "compact",
}) => {
  const D = densityMap[density];
  const { totalRewardsEarnedByUser } = useUserAllRewards();

  const [focusLevel, setFocusLevel] = useState<number>(Math.max(1, currentLevel || 1));
  useEffect(() => setFocusLevel(Math.max(1, currentLevel || 1)), [currentLevel]);

  const computeProgressFor = (level: number) => {
    if (level === 1) {
      const target = 5;
      const curr = directReferrals;
      return { label: "Direct referrals", current: curr, target, pct: Math.min(100, (curr / target) * 100) };
    }
    const def = STAR_LEVELS.find((l) => l.level === level);
    if (!def) return { label: "Progress", current: 0, target: 1, pct: 0 };

    if (def.directReferralsRequired && def.directReferralsRequired > 0) {
      const target = def.directReferralsRequired;
      const curr = directReferrals;
      return { label: "Direct referrals", current: curr, target, pct: Math.min(100, (curr / target) * 100) };
    }

    const [depLevelStr] = Object.keys(def.levelUsersRequired || {});
    const depLevel = parseInt(depLevelStr || "0", 10);
    const target = (def.levelUsersRequired as Record<number, number>)[depLevel] || 0;
    const curr = levelUsers[depLevel] || 0;
    return { label: `${depLevel}-Star users`, current: curr, target, pct: target ? Math.min(100, (curr / target) * 100) : 0 };
  };

  const focus = useMemo(() => computeProgressFor(focusLevel), [focusLevel, directReferrals, levelUsers]);
  const nextLevel = Math.min(5, Math.max(1, currentLevel + 1));
  const next = computeProgressFor(nextLevel);

  const stripRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = stripRef.current?.querySelector<HTMLDivElement>(`[data-level="${focusLevel}"]`);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [focusLevel]);

  const goldenPct = Math.min(100, (directReferrals / 15) * 100);

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/65 to-white/30 dark:from-gray-900/70 dark:to-gray-900/40 shadow-xl overflow-hidden backdrop-blur">
      {/* Header */}
      <div className={clsx("border-b border-white/10", D.pad)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative rounded-xl p-2 bg-white/40 dark:bg-white/5 backdrop-blur">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className={clsx("font-semibold text-gray-100", D.title)}>Affiliate Star Journey</h3>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10">
              {currentLevel}-Star
            </span>
          </div>

          <div className="text-right leading-tight">
            <div className="text-[11px] uppercase tracking-wide text-gray-400">Earnings</div>
            <div className="text-base md:text-lg font-bold text-white">
              ${totalRewardsEarnedByUser.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 🔶 Golden Star — emphasized + soft glow */}
      <div className={clsx("border-b border-white/10", D.sectionPad)}>
        <div className="relative rounded-2xl p-4 md:p-5 overflow-hidden border border-yellow-400/35 bg-gradient-to-r from-yellow-400/18 via-amber-300/12 to-orange-400/18 backdrop-blur">
          {/* glow */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -inset-16 opacity-40"
            initial={{ scale: 0.9, opacity: 0.25 }}
            animate={{ scale: 1, opacity: 0.4 }}
            transition={{ duration: 2.2, repeat: Infinity, repeatType: "reverse" }}
            style={{
              background:
                "radial-gradient(600px 220px at 10% 20%, rgba(255,220,120,.25), transparent 60%), radial-gradient(600px 220px at 90% 80%, rgba(255,180,70,.18), transparent 60%)",
            }}
          />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Title + requirement */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="rounded-2xl p-3 bg-white/25">
                <Crown className="w-7 h-7 text-yellow-500" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-100 text-base">Golden Star</span>
                  <span className="text-[12px] text-gray-300">
                    {GOLDEN_STAR.requirement?.replace("{window}", `${goldenStarWindowDays}`) ||
                      `Refer 15 within ${goldenStarWindowDays} days`}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Chip
                    icon={Users}
                    className="bg-yellow-100/50 dark:bg-yellow-900/40 border-yellow-300/50 dark:border-yellow-700/50 text-yellow-900 dark:text-yellow-200"
                    title="Direct referrals"
                  >
                    {directReferrals}/15 refs
                  </Chip>
                  <Chip
                    icon={Gift}
                    className="bg-yellow-100/50 dark:bg-yellow-900/40 border-yellow-300/50 dark:border-yellow-700/50 text-yellow-900 dark:text-yellow-200"
                    title="1-Star APR for 12 months or until 10× stake"
                  >
                    1-Star APR ×12m / 10× cap
                  </Chip>
                  <span className={clsx("text-xs font-medium", isGoldenStar ? "text-emerald-400" : "text-yellow-300")}>
                    {isGoldenStar ? "Active" : "Locked"}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="flex-1 w-full lg:max-w-[520px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-gray-200">Progress</span>
                <span className="text-[11px] text-gray-300">{Math.min(directReferrals, 15)} / 15</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="min-w-0 w-full">
                  <Bar value={goldenPct} thin />
                </div>
                <span className="hidden md:inline text-[11px] text-gray-300">{Math.round(goldenPct)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Level Strip */}
      <div className="px-3 md:px-4 py-3">
        <div className="overflow-x-auto no-scrollbar">
          <div
            ref={stripRef}
            className="flex items-stretch gap-3 min-w-[420px] snap-x snap-mandatory overflow-visible"
          >
            {[1, 2, 3, 4, 5].map((lvl) => {
              const active = focusLevel === lvl;
              const achieved = currentLevel >= lvl;
              const req = STAR_LEVELS.find((s) => s.level === lvl)?.requirement || "";
              const pct = computeProgressFor(lvl).pct;
              return (
                <div key={lvl} data-level={lvl}>
                  <LevelCard
                    lvl={lvl}
                    active={active}
                    achieved={achieved}
                    requirement={req}
                    pct={pct}
                    onSelect={() => setFocusLevel(lvl)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Combined “Progress & Next” */}
      <div className={clsx(D.sectionPad)}>
        <div className="rounded-2xl border border-white/10 bg-white/50 dark:bg-gray-900/50 p-4 md:p-5 backdrop-blur">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  "rounded-md px-2 py-0.5 text-[11px] text-white bg-gradient-to-r",
                  levelTheme[focusLevel as 1|2|3|4|5].grad
                )}
              >
                {focusLevel}-Star
              </span>
              <span className="text-[12px] text-gray-400 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> tap a star to preview
              </span>
            </div>

            {currentLevel >= focusLevel ? (
              <span className="text-emerald-400 text-xs flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> achieved
              </span>
            ) : (
              <span className="text-amber-400 text-xs flex items-center gap-1">
                <LockIcon className="w-4 h-4" /> locked
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Focus requirement */}
            <div className="rounded-xl border border-white/10 bg-white/30 dark:bg-gray-900/40 p-4">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-xs font-medium text-gray-200">{focus.label}</div>
                <div className="text-xs text-gray-400 ml-3 whitespace-nowrap">
                  {focus.current} / {focus.target}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="min-w-0 w-full">
                  <Bar value={focus.pct} thin />
                </div>
                <span className="hidden md:inline text-[11px] text-gray-400">{Math.round(focus.pct)}%</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {(STAR_LEVELS.find((l) => l.level === focusLevel)?.rewards || []).slice(0, 3).map((r, i) => (
                  <Chip
                    key={i}
                    icon={Gift}
                    className={clsx("text-gray-100", levelTheme[focusLevel as 1|2|3|4|5].pill)}
                    title={r}
                  >
                    {r.length > 34 ? r.slice(0, 32) + "…" : r}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Next milestone */}
            <div className="rounded-xl border border-white/10 bg-white/30 dark:bg-gray-900/40 p-4">
              {currentLevel >= 5 ? (
                <div className="text-xs text-gray-300">Max level reached 🎉</div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-300">{nextLevel}-Star • {next.label}</span>
                    <span className="text-xs text-gray-400">{next.current} / {next.target}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 w-full">
                      <Bar value={next.pct} thin />
                    </div>
                    <span className="hidden md:inline text-[11px] text-gray-400">{Math.round(next.pct)}%</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(STAR_LEVELS.find((l) => l.level === nextLevel)?.rewards || []).slice(0, 2).map((r, i) => (
                      <Chip
                        key={i}
                        icon={Gift}
                        className="text-gray-100 bg-gray-800/60 border-gray-700/60"
                        title={r}
                      >
                        {r.length > 32 ? r.slice(0, 30) + "…" : r}
                      </Chip>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StarJourneyPanel;
