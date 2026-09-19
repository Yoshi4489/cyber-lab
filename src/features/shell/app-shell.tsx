"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  Bookmark,
  BookOpen,
  ChevronRight,
  Compass,
  FlaskConical,
  Hexagon,
  Map,
  Menu,
  ShieldCheck,
  Terminal,
  CircleHelp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { useSavedLabs } from "@/features/bookmarks/use-saved-labs";

const navigation = [
  { href: "/", label: "Explore labs", icon: Compass },
  { href: "/paths", label: "Learning paths", icon: Map },
  { href: "/saved", label: "Saved labs", icon: Bookmark },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { saved } = useSavedLabs();
  return (
    <>
      <Link
        href="/"
        className="brand"
        aria-label="Cyber Range home"
        onClick={onNavigate}
      >
        <span className="brand-symbol">
          <Hexagon size={29} />
          <Terminal size={14} />
        </span>
        <span>
          cyber<span className="brand-light">range</span>
          <span className="brand-period">.</span>
        </span>
      </Link>
      <div className="workspace-label">
        <span className="workspace-icon">
          <FlaskConical size={16} />
        </span>
        <div>
          Training workspace<span>Community preview</span>
        </div>
        <span className="workspace-dot" />
      </div>
      <p className="nav-section-label">LEARN & EXPLORE</p>
      <nav aria-label="Main navigation" className="main-nav">
        {navigation.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/" || pathname.startsWith("/labs/")
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`nav-link ${active ? "nav-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={18} />
              <span>{label}</span>
              {href === "/saved" && saved.length > 0 && (
                <span className="nav-count">{saved.length}</span>
              )}
              {active && <span className="nav-active-dot" />}
            </Link>
          );
        })}
      </nav>
      <p className="nav-section-label nav-section-second">RESOURCES</p>
      <nav aria-label="Resources" className="main-nav">
        <Link
          href="/guide"
          onClick={onNavigate}
          className={`nav-link ${pathname === "/guide" ? "nav-active" : ""}`}
          aria-current={pathname === "/guide" ? "page" : undefined}
        >
          <BookOpen size={18} />
          <span>Field guide</span>
          <ArrowUpRight size={14} />
        </Link>
      </nav>
      <div className="sidebar-bottom">
        <div className="range-note">
          <span className="range-note-icon">
            <ShieldCheck size={19} />
          </span>
          <h3>Break things. Build skills.</h3>
          <p>A space to get curious, make mistakes, and learn by doing.</p>
          <Link href="/guide" onClick={onNavigate}>
            Get your bearings <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="guest-profile">
          <div className="avatar">G</div>
          <div>
            Guest explorer<span>Make yourself at home</span>
          </div>
          <span className="guest-tag">GUEST</span>
        </div>
      </div>
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const section = pathname.startsWith("/paths")
    ? "Learning paths"
    : pathname.startsWith("/saved")
      ? "Saved labs"
      : pathname.startsWith("/guide")
        ? "Field guide"
        : "Explore labs";
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <aside className="sidebar">
        <Sidebar />
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-left">
            <div className="mobile-menu">
              <Sheet
                open={mobileOpen}
                onOpenChange={setMobileOpen}
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open navigation"
                  >
                    <Menu size={20} />
                  </Button>
                }
              >
                <Sidebar onNavigate={() => setMobileOpen(false)} />
              </Sheet>
            </div>
            <span className="breadcrumb-root">Workspace</span>
            <ChevronRight size={13} />
            <span>{section}</span>
          </div>
          <div className="topbar-right">
            <span className="preview-indicator">
              <span />
              Frontend preview
            </span>
            <span className="topbar-divider" />
            <Link
              href="/guide"
              className="help-link"
              aria-label="Help and field guide"
            >
              <CircleHelp size={18} />
            </Link>
            <div className="avatar avatar-small" title="Guest explorer">
              G
            </div>
          </div>
        </header>
        <main id="main-content" className="main-content" tabIndex={-1}>
          {children}
        </main>
        <footer className="footer">
          <span>Built for the curious.</span>
          <span>
            CYBER RANGE <span className="footer-slash">/</span> LEARN BY DOING
          </span>
          <Link href="/guide#ground-rules">
            Play responsibly <ArrowUpRight size={12} />
          </Link>
        </footer>
      </div>
    </div>
  );
}
