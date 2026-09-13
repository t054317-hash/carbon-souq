import React, { useState, useEffect, useMemo, useRef, useCallback, createContext, useContext, memo } from 'react';
import { LANGS, STR } from '../lib/i18n.js';
import { ANCHOR_LABEL, ART_LABEL, ART_PRESETS, BRANDS, CURRENCIES, FREE_SHIP_OVER_KWD, GOVERNORATES, PROMOS, SEED_PARTS, SHIP_FLAT_KWD } from '../lib/data.js';
import { C, IcApple, IcBox, IcCar, IcCard, IcCart, IcChat, IcCheck, IcCheck2, IcChevD, IcChevL, IcChevR, IcClock, IcCross, IcFile, IcFlame, IcFunnel, IcGauge, IcGlobe, IcGoogle, IcImage, IcKnet, IcLayers, IcMinus, IcMoon, IcOut, IcPackage, IcPencil, IcPercent, IcPhone, IcPin, IcPlus, IcPrint, IcReset, IcSearch, IcSend, IcShield, IcSort, IcSparkle, IcSpinner, IcStar, IcSun, IcTag, IcTrash, IcTruck, IcUpload, IcUser, IcWrench, IcX, IcZap, P, R, makeIcon } from '../components/icons.jsx';
import { LOCALE, PRIO, brandOf, clamp, cx, dateFmt, money, store, timeFmt, uid } from '../lib/util.js';
import { Ctx, useApp, useT } from '../lib/ctx.js';

/* ============================================================================
   7 · PART RENDERS
   Every part is drawn as vector studio art so the page carries its own
   imagery — no external requests, sharp at any size, correct in both themes.
   Gradients live in one shared <defs> sprite mounted once by <App/>.
   ========================================================================== */

function ArtDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <linearGradient id="a-steel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f7fa" /><stop offset=".28" stopColor="#aeb9c6" />
          <stop offset=".5" stopColor="#6d7887" /><stop offset=".72" stopColor="#c9d3dd" />
          <stop offset="1" stopColor="#59626f" />
        </linearGradient>
        <linearGradient id="a-steel2" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#3d444f" /><stop offset=".35" stopColor="#8b95a3" />
          <stop offset=".6" stopColor="#e3e9f0" /><stop offset="1" stopColor="#4a525e" />
        </linearGradient>
        <linearGradient id="a-dark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a4250" /><stop offset="1" stopColor="#11151c" />
        </linearGradient>
        <linearGradient id="a-rubber" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#343b45" /><stop offset=".5" stopColor="#1a1e25" />
          <stop offset="1" stopColor="#0b0e12" />
        </linearGradient>
        <linearGradient id="a-red" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff6a4d" /><stop offset=".45" stopColor="#e02414" />
          <stop offset="1" stopColor="#8d0f06" />
        </linearGradient>
        <linearGradient id="a-copper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6c48a" /><stop offset=".5" stopColor="#c07a3a" />
          <stop offset="1" stopColor="#7a4318" />
        </linearGradient>
        <linearGradient id="a-titan" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#cfd8e2" /><stop offset=".3" stopColor="#8e99a8" />
          <stop offset=".52" stopColor="#a58ec9" /><stop offset=".68" stopColor="#c9a06a" />
          <stop offset=".85" stopColor="#7f8b99" /><stop offset="1" stopColor="#d9e2ea" />
        </linearGradient>
        <linearGradient id="a-amber" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd486" /><stop offset="1" stopColor="#c1741a" />
        </linearGradient>
        <linearGradient id="a-lens" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#dff6ff" stopOpacity=".92" />
          <stop offset=".5" stopColor="#8fb6c9" stopOpacity=".5" />
          <stop offset="1" stopColor="#1d2937" stopOpacity=".85" />
        </linearGradient>
        <linearGradient id="a-ceramic" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdfaf3" /><stop offset=".6" stopColor="#ded6c6" />
          <stop offset="1" stopColor="#a89e8c" />
        </linearGradient>
        <radialGradient id="a-vig" cx=".5" cy=".42" r=".78">
          <stop offset="0" stopColor="#2b3543" /><stop offset=".55" stopColor="#161c25" />
          <stop offset="1" stopColor="#080b0f" />
        </radialGradient>
        <radialGradient id="a-hot" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#8ff2ff" stopOpacity=".95" />
          <stop offset=".45" stopColor="#22d3ee" stopOpacity=".45" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="a-warm" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fff3d0" stopOpacity=".95" />
          <stop offset=".4" stopColor="#ffb020" stopOpacity=".5" />
          <stop offset="1" stopColor="#ffb020" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="a-floor" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#000" stopOpacity=".62" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <pattern id="a-weave" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="#14181f" />
          <path d="M0 0h6v6H0zM6 6h6v6H6z" fill="#1e242e" />
          <path d="M0 0l12 12M12 0L0 12" stroke="#0b0e12" strokeWidth=".6" />
        </pattern>
        <filter id="a-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id="a-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
    </svg>
  );
}

/* --- small generators so repeated hardware stays terse --- */
const bolts = (cx0, cy0, r, n, rr, fill) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return <circle key={'b' + i} cx={cx0 + Math.cos(a) * r} cy={cy0 + Math.sin(a) * r} r={rr}
      fill={fill || '#2b323c'} stroke="#8e99a8" strokeWidth=".7" />;
  });
const holes = (cx0, cy0, r, n, rr, off) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + (off || 0);
    return <circle key={'h' + i} cx={cx0 + Math.cos(a) * r} cy={cy0 + Math.sin(a) * r} r={rr}
      fill="#0c1015" stroke="#9aa5b3" strokeWidth=".6" />;
  });
const hatch = (x, y, w, h, step, stroke, sw) =>
  Array.from({ length: Math.floor(w / step) }, (_, i) =>
    <line key={'v' + i} x1={x + i * step} y1={y} x2={x + i * step} y2={y + h}
      stroke={stroke} strokeWidth={sw || 1} />);

const Stage = ({ children, label }) => (
  <svg viewBox="0 0 400 280" className="h-full w-full" role="img" aria-label={label}>
    <rect width="400" height="280" fill="url(#a-vig)" />
    <ellipse cx="200" cy="252" rx="150" ry="16" fill="url(#a-floor)" />
    <circle cx="86" cy="52" r="96" fill="url(#a-hot)" opacity=".5" />
    <circle cx="330" cy="230" r="82" fill="url(#a-warm)" opacity=".26" />
    {children}
  </svg>
);

const ArtBrake = () => (
  <Stage label="Brake kit">
    <g transform="translate(178 132)">
      <circle r="92" fill="#0f141b" />
      <circle r="90" fill="url(#a-steel2)" />
      <circle r="74" fill="none" stroke="#0d1116" strokeWidth="1.5" />
      <circle r="58" fill="url(#a-steel)" opacity=".55" />
      {Array.from({ length: 22 }, (_, i) => {
        const a = (i / 22) * Math.PI * 2;
        return <line key={i} x1={Math.cos(a) * 60} y1={Math.sin(a) * 60}
          x2={Math.cos(a) * 88} y2={Math.sin(a) * 88} stroke="#0e1218" strokeWidth="3.5" opacity=".8" />;
      })}
      {holes(0, 0, 70, 16, 4.2)}
      {holes(0, 0, 82, 16, 3.6, 0.2)}
      <circle r="40" fill="url(#a-dark)" stroke="#5c6675" strokeWidth="1.2" />
      <circle r="26" fill="#0b0f14" />
      {bolts(0, 0, 33, 5, 5.2, '#c3ccd8')}
      <path d="M-64-64A90 90 0 0 1 22-88" fill="none" stroke="#8ff2ff" strokeWidth="2" opacity=".6" />
    </g>
    <g transform="translate(258 78) rotate(24)">
      <rect x="-16" y="-46" width="66" height="92" rx="14" fill="url(#a-red)" stroke="#5d0a03" strokeWidth="1.4" />
      <rect x="-8" y="-30" width="50" height="16" rx="6" fill="#7c1207" opacity=".8" />
      <text x="17" y="8" textAnchor="middle" fontFamily="Chakra Petch, sans-serif" fontSize="15"
        fontWeight="700" fill="#ffd9d2" letterSpacing="1.5">GT</text>
      <rect x="-8" y="20" width="50" height="14" rx="5" fill="#7c1207" opacity=".7" />
      {bolts(17, 0, 36, 2, 4.5, '#e6ecf3')}
      <path d="M46 -30c16-6 26 2 30 12" fill="none" stroke="#9aa5b3" strokeWidth="5" strokeLinecap="round" />
      <path d="M46 -30c16-6 26 2 30 12" fill="none" stroke="#2b323c" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="3 3" />
    </g>
    <g transform="translate(96 214)">
      <rect x="0" y="-9" width="72" height="18" rx="4" fill="url(#a-steel)" opacity=".85" />
      <rect x="0" y="-9" width="72" height="18" rx="4" fill="none" stroke="#0d1116" strokeWidth="1" />
      <text x="36" y="5" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#0d1116">380×34</text>
    </g>
  </Stage>
);

const ArtTurbo = () => (
  <Stage label="Turbocharger">
    <g transform="translate(150 140)">
      <circle r="76" fill="#0f141b" />
      <path d="M0-74A74 74 0 1 1-52 52L-16 16A30 30 0 1 0 0-44Z" fill="url(#a-steel)" />
      <circle r="70" fill="none" stroke="#0d1116" strokeWidth="1.2" />
      <circle r="42" fill="url(#a-dark)" />
      <circle r="34" fill="#0a0d12" />
      {Array.from({ length: 11 }, (_, i) => {
        const a = (i / 11) * Math.PI * 2;
        return <path key={i} d={'M' + Math.cos(a) * 9 + ' ' + Math.sin(a) * 9 + 'Q' +
          Math.cos(a + 0.5) * 22 + ' ' + Math.sin(a + 0.5) * 22 + ' ' +
          Math.cos(a + 0.22) * 33 + ' ' + Math.sin(a + 0.22) * 33}
          fill="none" stroke="url(#a-steel2)" strokeWidth="5" strokeLinecap="round" />;
      })}
      <circle r="8" fill="url(#a-steel)" stroke="#0d1116" strokeWidth="1" />
      <path d="M-52-52A74 74 0 0 1 8-74" fill="none" stroke="#8ff2ff" strokeWidth="2.2" opacity=".55" />
    </g>
    <g transform="translate(252 132)">
      <ellipse cx="0" cy="0" rx="18" ry="52" fill="url(#a-copper)" />
      <ellipse cx="0" cy="0" rx="12" ry="44" fill="#3a1f0c" />
      {Array.from({ length: 7 }, (_, i) =>
        <ellipse key={i} cx={i * 6} cy="0" rx="4" ry={44 - i} fill="none" stroke="#8a4d22" strokeWidth="1" opacity=".7" />)}
      <path d="M6-52C40-58 62-34 62 0s-20 56-56 52" fill="none" stroke="url(#a-copper)" strokeWidth="18" strokeLinecap="round" />
      <path d="M6-52C40-58 62-34 62 0s-20 56-56 52" fill="none" stroke="#f6c48a" strokeWidth="3" opacity=".35" strokeLinecap="round" />
    </g>
    <g transform="translate(112 62)">
      <rect x="-14" y="-22" width="28" height="30" rx="8" fill="url(#a-steel2)" stroke="#0d1116" />
      <path d="M0 8v18" stroke="#8e99a8" strokeWidth="4" strokeLinecap="round" />
      <circle cy="-22" r="6" fill="#0f141b" stroke="#9aa5b3" />
    </g>
    <path d="M196 208c22 10 46 6 62-8" fill="none" stroke="#39414d" strokeWidth="7" strokeLinecap="round" />
    <text x="200" y="252" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#7c8797">GTX2867R · 0.86 A/R</text>
  </Stage>
);

const ArtFilter = () => (
  <Stage label="Intake filter">
    <g transform="translate(206 140)">
      <path d="M-84-56h20v112h-20z" fill="url(#a-steel2)" opacity=".5" />
      <path d="M-64-46q86-30 118-14v120q-32 16-118-14z" fill="#b9452a" />
      <path d="M-64-46q86-30 118-14v120q-32 16-118-14z" fill="url(#a-dark)" opacity=".28" />
      {Array.from({ length: 16 }, (_, i) => {
        const x = -60 + i * 7.5;
        return <path key={i} d={'M' + x + ' ' + (-44 + i * 1.9) + 'v' + (88 - i * 0.6)}
          stroke="#7d2a17" strokeWidth="2.4" opacity=".85" />;
      })}
      <ellipse cx="54" cy="30" rx="14" ry="58" fill="#8f3620" />
      <ellipse cx="54" cy="30" rx="9" ry="52" fill="#5d2011" />
      <rect x="-98" y="-40" width="34" height="92" rx="10" fill="url(#a-steel)" />
      <rect x="-98" y="-40" width="34" height="92" rx="10" fill="none" stroke="#0d1116" />
      {bolts(-81, 6, 34, 6, 4, '#39414d')}
      <rect x="-118" y="-26" width="24" height="64" rx="8" fill="#1d232c" stroke="#39414d" />
      <path d="M-118-26h24" stroke="#8ff2ff" strokeWidth="2" opacity=".5" />
    </g>
    <text x="200" y="252" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#7c8797">COTTON · WASHABLE</text>
  </Stage>
);

const ArtCoilover = () => (
  <Stage label="Coilover">
    <g transform="translate(200 22)">
      <ellipse cy="14" rx="44" ry="12" fill="url(#a-steel)" />
      <ellipse cy="10" rx="44" ry="12" fill="url(#a-steel2)" />
      {bolts(0, 10, 32, 3, 5, '#cfd8e2')}
      <rect x="-6" y="20" width="12" height="26" fill="url(#a-steel)" />
      {Array.from({ length: 11 }, (_, i) => (
        <ellipse key={i} cy={54 + i * 13} rx="34" ry="10" fill="none" stroke="url(#a-titan)" strokeWidth="9" />
      ))}
      {Array.from({ length: 11 }, (_, i) => (
        <ellipse key={'s' + i} cy={51 + i * 13} rx="34" ry="10" fill="none" stroke="#dff6ff" strokeWidth="1.6" opacity=".22" />
      ))}
      <rect x="-13" y="46" width="26" height="140" rx="6" fill="url(#a-dark)" opacity=".9" />
      <rect x="-18" y="176" width="36" height="20" rx="5" fill="url(#a-steel)" stroke="#0d1116" />
      {hatch(-16, 178, 32, 16, 3, '#3a4250', 1.2)}
      <rect x="-11" y="196" width="22" height="26" rx="4" fill="url(#a-steel2)" />
      <circle cy="230" r="13" fill="#0f141b" stroke="url(#a-steel)" strokeWidth="5" />
      <circle cy="230" r="5" fill="#1d232c" />
      <path d="M-34 54A34 34 0 0 1 0 44" fill="none" stroke="#8ff2ff" strokeWidth="2" opacity=".5" />
    </g>
    <text x="330" y="140" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#7c8797" transform="rotate(90 330 140)">10-WAY DAMPING</text>
  </Stage>
);

const ArtHeadlight = () => (
  <Stage label="Headlamp">
    <g transform="translate(200 140)">
      <path d="M-150-52q60-30 156-18 60 8 128 26-14 62-58 76-96 16-176-8-46-14-50-76z" fill="#0d1218" />
      <path d="M-146-48q58-28 152-16 58 8 122 24-13 56-53 69-93 15-170-8-43-13-51-69z" fill="url(#a-lens)" />
      <g>
        <circle cx="-58" cy="8" r="38" fill="#0b0f14" />
        <circle cx="-58" cy="8" r="33" fill="url(#a-steel2)" opacity=".8" />
        <circle cx="-58" cy="8" r="22" fill="#050709" />
        <circle cx="-58" cy="8" r="15" fill="url(#a-hot)" />
        <circle cx="-58" cy="8" r="6" fill="#eafcff" filter="url(#a-glow)" />
      </g>
      <g>
        <circle cx="34" cy="14" r="32" fill="#0b0f14" />
        <circle cx="34" cy="14" r="27" fill="url(#a-steel2)" opacity=".8" />
        <circle cx="34" cy="14" r="17" fill="#050709" />
        <circle cx="34" cy="14" r="11" fill="url(#a-hot)" />
        <circle cx="34" cy="14" r="4.5" fill="#eafcff" filter="url(#a-glow)" />
      </g>
      <path d="M-140-30q120-26 268 6" fill="none" stroke="#22d3ee" strokeWidth="7" strokeLinecap="round" filter="url(#a-glow)" opacity=".95" />
      <path d="M-140-30q120-26 268 6" fill="none" stroke="#eafcff" strokeWidth="2" strokeLinecap="round" />
      <path d="M96 36q24 8 34 22" fill="none" stroke="#ffb020" strokeWidth="6" strokeLinecap="round" opacity=".85" filter="url(#a-glow)" />
      <path d="M-146-48q58-28 152-16" fill="none" stroke="#dff6ff" strokeWidth="2.4" opacity=".5" />
      {Array.from({ length: 9 }, (_, i) =>
        <line key={i} x1={-120 + i * 30} y1={-44 + i * 1.5} x2={-104 + i * 30} y2={44 - i * 2}
          stroke="#dff6ff" strokeWidth="1" opacity=".08" />)}
      <rect x="120" y="52" width="34" height="16" rx="5" fill="#1d232c" stroke="#39414d" />
      <path d="M154 60h22" stroke="#39414d" strokeWidth="5" strokeLinecap="round" />
    </g>
    <text x="200" y="252" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#7c8797">84-SEGMENT MATRIX</text>
  </Stage>
);

const ArtExhaust = () => (
  <Stage label="Exhaust">
    <g transform="translate(0 6)">
      <path d="M20 110q60-26 118-6" fill="none" stroke="url(#a-titan)" strokeWidth="22" strokeLinecap="round" />
      <path d="M20 150q60-26 118-6" fill="none" stroke="url(#a-titan)" strokeWidth="22" strokeLinecap="round" />
      <rect x="132" y="78" width="140" height="98" rx="26" fill="url(#a-titan)" />
      <rect x="132" y="78" width="140" height="98" rx="26" fill="none" stroke="#0d1116" strokeWidth="1.2" />
      <rect x="146" y="92" width="112" height="70" rx="18" fill="none" stroke="#5a6473" strokeWidth="1" opacity=".7" />
      {Array.from({ length: 20 }, (_, i) =>
        <circle key={i} cx={152 + (i % 10) * 11} cy={110 + Math.floor(i / 10) * 34} r="2" fill="#0d1116" opacity=".6" />)}
      <path d="M148 84q56-10 108 0" fill="none" stroke="#dff6ff" strokeWidth="2.5" opacity=".45" />
      <text x="202" y="136" textAnchor="middle" fontFamily="Chakra Petch, sans-serif" fontSize="13" fontWeight="700"
        fill="#0d1116" letterSpacing="2" opacity=".55">TITANIUM</text>
      <path d="M272 104h32" stroke="url(#a-titan)" strokeWidth="20" strokeLinecap="round" />
      <path d="M272 150h32" stroke="url(#a-titan)" strokeWidth="20" strokeLinecap="round" />
      <g>
        <ellipse cx="332" cy="104" rx="12" ry="24" fill="#0a0d12" stroke="url(#a-titan)" strokeWidth="7" />
        <ellipse cx="332" cy="104" rx="7" ry="18" fill="#05070a" />
        <ellipse cx="332" cy="150" rx="12" ry="24" fill="#0a0d12" stroke="url(#a-titan)" strokeWidth="7" />
        <ellipse cx="332" cy="150" rx="7" ry="18" fill="#05070a" />
      </g>
      <path d="M320 84c6-4 14-4 20 0" fill="none" stroke="#a58ec9" strokeWidth="3" opacity=".8" />
      <path d="M320 130c6-4 14-4 20 0" fill="none" stroke="#c9a06a" strokeWidth="3" opacity=".8" />
      <path d="M60 96q10-20 26-14" fill="none" stroke="#39414d" strokeWidth="5" strokeLinecap="round" />
    </g>
    <text x="200" y="252" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#7c8797">76 mm · VALVED</text>
  </Stage>
);

const ArtRadiator = () => (
  <Stage label="Radiator">
    <g transform="translate(56 56)">
      <rect x="0" y="0" width="288" height="168" rx="8" fill="#0f141b" />
      <rect x="0" y="0" width="288" height="26" rx="7" fill="url(#a-steel)" />
      <rect x="0" y="142" width="288" height="26" rx="7" fill="url(#a-steel)" />
      <rect x="10" y="28" width="268" height="112" fill="url(#a-dark)" />
      {Array.from({ length: 44 }, (_, i) =>
        <line key={i} x1={14 + i * 6} y1="30" x2={14 + i * 6} y2="138" stroke="#4a525e" strokeWidth="2.2" opacity=".75" />)}
      {Array.from({ length: 8 }, (_, i) =>
        <line key={'h' + i} x1="10" y1={32 + i * 14} x2="278" y2={32 + i * 14} stroke="#0b0e12" strokeWidth="1.4" opacity=".8" />)}
      <rect x="10" y="28" width="268" height="112" fill="url(#a-hot)" opacity=".12" />
      <ellipse cx="52" cy="8" rx="20" ry="11" fill="url(#a-steel2)" stroke="#0d1116" />
      <ellipse cx="52" cy="4" rx="14" ry="7" fill="#2b323c" />
      <path d="M-16 44h20v22h-20z" fill="url(#a-steel2)" />
      <path d="M-40 46q-14 8 0 18h26V46z" fill="#1d232c" stroke="#39414d" />
      <path d="M288 104h20v22h-20z" fill="url(#a-steel2)" />
      <path d="M330 106q14 8 0 18h-24v-18z" fill="#1d232c" stroke="#39414d" />
      {bolts(144, 13, 130, 2, 5, '#cfd8e2')}
      {bolts(144, 155, 130, 2, 5, '#cfd8e2')}
      <path d="M0 4q140-10 288 0" fill="none" stroke="#8ff2ff" strokeWidth="1.8" opacity=".45" />
    </g>
    <text x="200" y="252" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#7c8797">52 mm DUAL-PASS CORE</text>
  </Stage>
);

const ArtPlug = () => (
  <Stage label="Spark plugs">
    {[0, 1, 2].map(i => (
      <g key={i} transform={'translate(' + (108 + i * 92) + ' ' + (46 + i * 6) + ')'}>
        <rect x="-15" y="0" width="30" height="18" rx="4" fill="url(#a-steel)" />
        <path d="M-15 18h30l-4 10h-22z" fill="url(#a-steel2)" />
        <rect x="-13" y="28" width="26" height="74" rx="6" fill="url(#a-ceramic)" />
        {Array.from({ length: 4 }, (_, k) =>
          <rect key={k} x="-15" y={34 + k * 15} width="30" height="7" rx="3.5" fill="#cfc5b1" />)}
        <path d="M-14 102h28l-6 14h-16z" fill="url(#a-steel2)" />
        <rect x="-11" y="116" width="22" height="30" fill="url(#a-steel)" />
        {Array.from({ length: 7 }, (_, k) =>
          <line key={k} x1="-11" y1={118 + k * 4} x2="11" y2={120 + k * 4} stroke="#5a6473" strokeWidth="1.4" />)}
        <path d="M-9 146h18l-3 12h-12z" fill="#2b323c" />
        <path d="M-8 158h10v8h-10z" fill="#39414d" />
        <circle cx="2" cy="170" r="2.6" fill="#eafcff" filter="url(#a-glow)" />
        {i === 1 && <g>
          <circle cx="2" cy="170" r="14" fill="url(#a-hot)" />
          <path d="M-6 168l8 4-4 6" fill="none" stroke="#eafcff" strokeWidth="1.8" />
        </g>}
      </g>
    ))}
    <text x="200" y="252" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#7c8797">IRIDIUM · GAP 0.8 mm</text>
  </Stage>
);

const ArtBattery = () => (
  <Stage label="Battery">
    <g transform="translate(72 66)">
      <rect x="0" y="14" width="256" height="152" rx="10" fill="#12171f" stroke="#39414d" />
      <rect x="0" y="14" width="256" height="152" rx="10" fill="url(#a-dark)" opacity=".7" />
      <rect x="0" y="0" width="256" height="26" rx="8" fill="#1d232c" stroke="#39414d" />
      <rect x="14" y="30" width="228" height="82" rx="6" fill="#0b0e12" />
      <text x="128" y="62" textAnchor="middle" fontFamily="Chakra Petch, sans-serif" fontSize="24" fontWeight="700" fill="#e8eef7">95 Ah</text>
      <text x="128" y="84" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#22d3ee">850 A · AGM · START-STOP</text>
      <text x="128" y="102" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#6e7c91">12 V — SEALED · VRLA</text>
      {Array.from({ length: 6 }, (_, i) =>
        <rect key={i} x={18 + i * 38} y="122" width="30" height="30" rx="4" fill="#151a22" stroke="#2b323c" />)}
      <g transform="translate(34 -8)">
        <rect x="-14" y="-6" width="28" height="14" rx="3" fill="#a01f2c" />
        <circle cy="-12" r="11" fill="url(#a-copper)" stroke="#7a4318" />
        <text y="-8" textAnchor="middle" fontFamily="Chakra Petch, sans-serif" fontSize="14" fontWeight="700" fill="#3a1f0c">+</text>
      </g>
      <g transform="translate(222 -8)">
        <rect x="-14" y="-6" width="28" height="14" rx="3" fill="#20262f" />
        <circle cy="-12" r="11" fill="url(#a-steel)" stroke="#39414d" />
        <text y="-6" textAnchor="middle" fontFamily="Chakra Petch, sans-serif" fontSize="16" fontWeight="700" fill="#2b323c">–</text>
      </g>
      <path d="M96 -4h64" stroke="#39414d" strokeWidth="9" strokeLinecap="round" />
      <path d="M0 20q128-10 256 0" fill="none" stroke="#8ff2ff" strokeWidth="1.8" opacity=".35" />
    </g>
  </Stage>
);

const ArtWing = () => (
  <Stage label="Rear wing">
    <g transform="translate(0 10)">
      <path d="M40 96h320q10 0 10 10v10q0 12-14 14l-292 18q-14 2-14-12v-30q0-10 10-10z" fill="url(#a-weave)" />
      <path d="M40 96h320q10 0 10 10v6H30v-6q0-10 10-10z" fill="#2a313c" opacity=".8" />
      <path d="M30 112h350" stroke="#8ff2ff" strokeWidth="1.6" opacity=".5" />
      <path d="M36 138l300-16" stroke="#ffb020" strokeWidth="2.4" opacity=".55" />
      <path d="M30 96h352v-9H30z" fill="#1a1f27" />
      <rect x="14" y="70" width="18" height="120" rx="6" fill="url(#a-weave)" stroke="#0b0e12" />
      <rect x="378" y="70" width="18" height="120" rx="6" fill="url(#a-weave)" stroke="#0b0e12" />
      <path d="M120 150v42q0 12 14 12h18q12 0 12-12v-56" fill="none" stroke="url(#a-steel2)" strokeWidth="14" strokeLinejoin="round" />
      <path d="M250 150v42q0 12 14 12h18q12 0 12-12v-56" fill="none" stroke="url(#a-steel2)" strokeWidth="14" strokeLinejoin="round" />
      {bolts(146, 204, 16, 2, 4, '#cfd8e2')}
      {bolts(276, 204, 16, 2, 4, '#cfd8e2')}
      <text x="200" y="242" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#7c8797">PRE-PREG TWILL · SWAN NECK</text>
    </g>
  </Stage>
);

const ArtWheel = () => (
  <Stage label="Forged wheel">
    <g transform="translate(196 134)">
      <circle r="112" fill="url(#a-rubber)" />
      <circle r="112" fill="none" stroke="#05070a" strokeWidth="2" />
      {Array.from({ length: 46 }, (_, i) => {
        const a = (i / 46) * Math.PI * 2;
        return <line key={i} x1={Math.cos(a) * 96} y1={Math.sin(a) * 96} x2={Math.cos(a) * 111} y2={Math.sin(a) * 111}
          stroke="#0a0d12" strokeWidth="4" />;
      })}
      <circle r="92" fill="#0b0e12" />
      <circle r="88" fill="url(#a-steel2)" />
      <circle r="80" fill="#0f141b" />
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const d = 0.16;
        const pt = (r, o) => (Math.cos(a + o) * r) + ' ' + (Math.sin(a + o) * r);
        return (
          <path key={i}
            d={'M' + pt(20, -d) + 'L' + pt(78, -d * 0.62) + 'A78 78 0 0 1 ' + pt(78, d * 0.62) + 'L' + pt(20, d) + 'Z'}
            fill="url(#a-steel)" stroke="#0b0e12" strokeWidth="1.4" />
        );
      })}
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        return <line key={'g' + i} x1={Math.cos(a) * 24} y1={Math.sin(a) * 24}
          x2={Math.cos(a) * 76} y2={Math.sin(a) * 76} stroke="#0d1116" strokeWidth="4" opacity=".8" />;
      })}
      <circle r="30" fill="url(#a-dark)" stroke="#5a6473" strokeWidth="1.4" />
      {bolts(0, 0, 22, 5, 5, '#cfd8e2')}
      <circle r="11" fill="#0b0e12" stroke="#22d3ee" strokeWidth="1.4" />
      <path d="M-66-66A92 92 0 0 1 22-90" fill="none" stroke="#8ff2ff" strokeWidth="2.4" opacity=".55" />
      <path d="M-96 40A104 104 0 0 0-30 100" fill="none" stroke="#7c5cff" strokeWidth="2" opacity=".45" />
    </g>
    <text x="196" y="262" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#7c8797">20 × 9.5J · ET38</text>
  </Stage>
);

const ArtGearbox = () => (
  <Stage label="Gearbox">
    <g transform="translate(120 140)">
      <circle r="76" fill="url(#a-steel2)" />
      <circle r="76" fill="none" stroke="#0d1116" strokeWidth="1.4" />
      <circle r="58" fill="url(#a-dark)" />
      <circle r="34" fill="#0b0e12" />
      {bolts(0, 0, 66, 10, 5, '#39414d')}
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return <line key={i} x1={Math.cos(a) * 36} y1={Math.sin(a) * 36} x2={Math.cos(a) * 56} y2={Math.sin(a) * 56}
          stroke="#4a525e" strokeWidth="3" />;
      })}
      <circle r="14" fill="url(#a-steel)" stroke="#0d1116" />
      <path d="M-54-54A76 76 0 0 1 16-76" fill="none" stroke="#8ff2ff" strokeWidth="2.2" opacity=".5" />
    </g>
    <g transform="translate(190 96)">
      <path d="M0 0h96q14 0 14 14v60q0 14-14 14H0z" fill="url(#a-steel)" />
      <path d="M0 0h96q14 0 14 14v60q0 14-14 14H0z" fill="none" stroke="#0d1116" />
      {Array.from({ length: 7 }, (_, i) =>
        <line key={i} x1={12 + i * 13} y1="4" x2={12 + i * 13} y2="84" stroke="#59626f" strokeWidth="3" opacity=".7" />)}
      <rect x="30" y="-24" width="30" height="26" rx="6" fill="url(#a-steel2)" stroke="#0d1116" />
      <circle cx="45" cy="-30" r="8" fill="#1d232c" stroke="#8e99a8" />
      <path d="M110 30h44" stroke="url(#a-steel)" strokeWidth="16" strokeLinecap="round" />
      <path d="M110 58h44" stroke="url(#a-steel)" strokeWidth="10" strokeLinecap="round" />
      <path d="M152 18h16v34h-16z" fill="url(#a-steel2)" stroke="#0d1116" />
      {bolts(160, 35, 12, 4, 3.4, '#39414d')}
    </g>
    <text x="200" y="252" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#7c8797">TWIN DISC · 800 Nm</text>
  </Stage>
);

const ART = {
  brake: ArtBrake, turbo: ArtTurbo, filter: ArtFilter, coilover: ArtCoilover,
  headlight: ArtHeadlight, exhaust: ArtExhaust, radiator: ArtRadiator, plug: ArtPlug,
  battery: ArtBattery, wing: ArtWing, wheel: ArtWheel, gearbox: ArtGearbox
};

function PartArt({ art, photo, className }) {
  if (photo) {
    return <img src={photo} alt="" className={cx('h-full w-full object-cover', className)} />;
  }
  const Comp = ART[art] || ArtBrake;
  return <div className={cx('h-full w-full', className)}><Comp /></div>;
}


export { ART, ArtBattery, ArtBrake, ArtCoilover, ArtDefs, ArtExhaust, ArtFilter, ArtGearbox, ArtHeadlight, ArtPlug, ArtRadiator, ArtTurbo, ArtWheel, ArtWing, PartArt, Stage, bolts, hatch, holes };
