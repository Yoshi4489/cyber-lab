import {
  Cookie,
  Terminal,
  KeyRound,
  Network,
  Fingerprint,
  LockKeyhole,
} from "lucide-react";
import type { Lab } from "@/lib/catalog";

const icons = {
  cookie: Cookie,
  terminal: Terminal,
  cipher: KeyRound,
  network: Network,
  fingerprint: Fingerprint,
  lock: LockKeyhole,
};
const annotations = {
  cookie: "SESSION_INSPECTOR",
  terminal: "SYSTEM_DIAGNOSTICS",
  cipher: "DECODE_SEQUENCE",
  network: "PACKET_CAPTURE",
  fingerprint: "TRACE_EVIDENCE",
  lock: "VERIFY_PERMISSION",
};

export function LabArt({ lab, large = false }: { lab: Lab; large?: boolean }) {
  const Icon = icons[lab.artwork];
  return (
    <div
      className={`lab-art art-${lab.accent} ${large ? "art-large" : ""}`}
      aria-hidden="true"
    >
      <div className="art-grid" />
      <span className="art-coordinate">{lab.code}</span>
      <span className="art-cross art-cross-one">+</span>
      <span className="art-cross art-cross-two">+</span>
      <div className="art-orbit orbit-one" />
      <div className="art-orbit orbit-two" />
      <div className="art-icon">
        <Icon strokeWidth={1.25} />
      </div>
      <span className="art-annotation">
        {annotations[lab.artwork]}
        <span className="art-blink">_</span>
      </span>
      <span className="art-corner">
        [ 0{lab.code.endsWith("003") ? 3 : lab.code.endsWith("002") ? 2 : 1} ]
      </span>
    </div>
  );
}

export function RangeIllustration() {
  return (
    <svg
      className="range-illustration"
      viewBox="0 0 520 280"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="range-grid"
          width="30"
          height="30"
          patternUnits="userSpaceOnUse"
        >
          <path d="M30 0H0V30" stroke="currentColor" strokeOpacity=".09" />
        </pattern>
        <linearGradient
          id="range-fade"
          x1="260"
          y1="0"
          x2="260"
          y2="280"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#222d1b" />
          <stop offset="1" stopColor="#111710" />
        </linearGradient>
      </defs>
      <rect width="520" height="280" fill="url(#range-grid)" />
      <ellipse
        cx="280"
        cy="158"
        rx="194"
        ry="97"
        stroke="currentColor"
        strokeOpacity=".16"
        strokeDasharray="3 7"
      />
      <ellipse
        cx="280"
        cy="158"
        rx="143"
        ry="69"
        stroke="currentColor"
        strokeOpacity=".12"
      />
      <path
        d="M150 106L276 178L411 99M276 178V229M150 106V163L218 202M411 99V169L337 209"
        stroke="currentColor"
        strokeOpacity=".45"
        strokeDasharray="4 5"
      />
      <g stroke="currentColor" strokeLinejoin="round">
        <path
          d="M220 85L278 52L336 85L278 119Z"
          fill="#293723"
          strokeOpacity=".8"
        />
        <path
          d="M220 85V152L278 186V119Z"
          fill="url(#range-fade)"
          strokeOpacity=".65"
        />
        <path
          d="M278 119L336 85V152L278 186Z"
          fill="#1d2818"
          strokeOpacity=".8"
        />
        <path
          d="M230 109L266 130M230 123L266 144M230 137L251 149"
          strokeOpacity=".35"
        />
        <path
          d="M289 131L324 111M289 148L324 128M289 164L324 144"
          strokeOpacity=".5"
        />
        <path d="M263 86L274 92L293 81" strokeWidth="2" />
        <path
          d="M118 82L150 63L182 82V118L150 137L118 118Z"
          fill="#162017"
          strokeOpacity=".5"
        />
        <path d="M118 82L150 101L182 82M150 101V137" strokeOpacity=".45" />
        <path
          d="M383 76L415 57L447 76V112L415 131L383 112Z"
          fill="#162017"
          strokeOpacity=".5"
        />
        <path d="M383 76L415 95L447 76M415 95V131" strokeOpacity=".45" />
        <circle cx="278" cy="229" r="5" fill="#b4ed68" />
        <circle cx="218" cy="202" r="3" fill="#111710" />
        <circle cx="337" cy="209" r="3" fill="#111710" />
      </g>
      <g
        fill="currentColor"
        fontFamily="monospace"
        fontSize="9"
        letterSpacing="1.4"
      >
        <text x="63" y="47" opacity=".5">
          ISOLATED ENVIRONMENT
        </text>
        <text x="355" y="233" opacity=".5">
          EXPLORE. EXPLOIT. LEARN.
        </text>
        <text x="254" y="28" opacity=".7">
          YOUR NEXT CHALLENGE
        </text>
      </g>
      <path
        d="M48 37V27H58M474 248V258H464"
        stroke="currentColor"
        strokeOpacity=".5"
      />
    </svg>
  );
}
