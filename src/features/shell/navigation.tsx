"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  FlaskConical,
  Heart,
  Home,
  LogOut,
  Map,
  Trophy,
  UserRound,
} from "lucide-react";
import { useLearner, leaveDemo } from "@/features/learner/store";
import { levelFor, totalXp, XP_PER_LEVEL } from "@/features/learner/model";
import { Brand } from "./brand";
import styles from "./shell.module.css";

const navigation = [
  { href: "/", label: "Home", icon: Home, preview: false },
  { href: "/labs", label: "Labs", icon: FlaskConical, preview: false },
  { href: "/paths", label: "Learning paths", icon: Map, preview: true },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy, preview: false },
  { href: "/profile", label: "Profile", icon: UserRound, preview: true },
];
export function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { learner } = useLearner();
  const xp = totalXp(learner);
  return (
    <>
      <Brand onNavigate={onNavigate} />
      <div className={styles.workspace}>
        <span>YOUR LEARNING SPACE</span>
        <small>A little progress, every day.</small>
      </div>
      <nav aria-label="Main navigation" className={styles.nav}>
        {navigation.map(({ href, label, icon: Icon, preview }) => {
          const active =
            href === "/"
              ? pathname === "/" || pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={19} />
              <span>{label}</span>
              {preview && <small>Preview</small>}
            </Link>
          );
        })}
      </nav>
      {learner.signedIn && (
        <div className={styles.level}>
          <div>
            <span>Level {levelFor(xp)}</span>
            <strong>{xp} XP</strong>
          </div>
          <progress
            aria-label="Sidebar level progress"
            value={xp % XP_PER_LEVEL}
            max={XP_PER_LEVEL}
          />
          <p>Every small step counts.</p>
        </div>
      )}
      <div className={styles.bottom}>
        <div className={styles.community}>
          <Heart size={20} />
          <h2>Made for curious minds.</h2>
          <p>A free space to learn, make mistakes, and find your thing.</p>
          <Link href="/guide" onClick={onNavigate}>
            A little guidance <BookOpen size={14} />
          </Link>
        </div>
        <div className={styles.account}>
          <span className={styles.avatar}>
            {learner.signedIn
              ? learner.username?.slice(0, 2).toUpperCase()
              : "Hi"}
          </span>
          <div>
            <strong>
              {learner.signedIn ? learner.username : "Hello, explorer"}
            </strong>
            <small>
              {learner.signedIn
                ? "Local demo learner"
                : "Make yourself at home"}
            </small>
          </div>
          {learner.signedIn && (
            <button
              aria-label="Sign out of demo"
              onClick={() => {
                leaveDemo();
                onNavigate?.();
                router.push("/");
              }}
            >
              <LogOut size={17} />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
