import { memo } from 'react';
import { LANGS, STR } from '../lib/i18n.js';
import { ANCHOR_LABEL, ART_LABEL, ART_PRESETS, BRANDS, CURRENCIES, FREE_SHIP_OVER_KWD, GOVERNORATES, PROMOS, SEED_PARTS, SHIP_FLAT_KWD } from '../lib/data.js';

/* ============================================================================
   4 · ICONS  ·  24 × 24, 1.75 stroke — one factory, Lucide geometry
   ========================================================================== */

function makeIcon(children, opts) {
  const o = opts || {};
  const Comp = function (props) {
    const size = props.size || 18;
    return (
      <svg
        viewBox="0 0 24 24" width={size} height={size} fill={o.fill || 'none'}
        stroke={o.fill ? 'none' : 'currentColor'} strokeWidth={props.sw || 1.75}
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
        className={props.className} style={props.style}
      >{children}</svg>
    );
  };
  return memo(Comp);
}
const P = (d, k) => <path key={k || d} d={d} />;
const C = (cx, cy, r, k) => <circle key={k || 'c' + cx + cy + r} cx={cx} cy={cy} r={r} />;
const R = (x, y, w, h, rx, k) => <rect key={k || 'r' + x + y} x={x} y={y} width={w} height={h} rx={rx} />;

const IcSearch = makeIcon([C(11, 11, 8), P('m21 21-4.35-4.35')]);
const IcCart = makeIcon([C(8, 21, 1), C(19, 21, 1), P('M2 3h2l2.6 12.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 1.9-1.6L22 7H5.1')]);
const IcUser = makeIcon([P('M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'), C(12, 7, 4)]);
const IcSun = makeIcon([C(12, 12, 4), P('M12 2v2'), P('M12 20v2'), P('m4.93 4.93 1.41 1.41'), P('m17.66 17.66 1.41 1.41'), P('M2 12h2'), P('M20 12h2'), P('m6.34 17.66-1.41 1.41'), P('m19.07 4.93-1.41 1.41')]);
const IcMoon = makeIcon([P('M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z')]);
const IcGlobe = makeIcon([C(12, 12, 10), P('M2 12h20'), P('M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z')]);
const IcChevD = makeIcon([P('m6 9 6 6 6-6')]);
const IcChevR = makeIcon([P('m9 18 6-6-6-6')]);
const IcChevL = makeIcon([P('m15 18-6-6 6-6')]);
const IcX = makeIcon([P('M18 6 6 18'), P('m6 6 12 12')]);
const IcPlus = makeIcon([P('M5 12h14'), P('M12 5v14')]);
const IcMinus = makeIcon([P('M5 12h14')]);
const IcTrash = makeIcon([P('M3 6h18'), P('M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6'), P('M10 11v6'), P('M14 11v6'), P('M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2')]);
const IcPencil = makeIcon([P('M21.2 6.8a2.8 2.8 0 0 0-4-4L3.8 16.2a2 2 0 0 0-.5.8l-1.3 4.4a.5.5 0 0 0 .6.6l4.4-1.3a2 2 0 0 0 .8-.5Z'), P('m15 5 4 4')]);
const IcCheck = makeIcon([P('M20 6 9 17l-5-5')]);
const IcCheck2 = makeIcon([P('M18 6 7 17l-5-5'), P('m22 10-7.5 7.5L13 16')]);
const IcPackage = makeIcon([P('m7.5 4.3 9 5.1'), P('M21 8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z'), P('m3.3 7L12 12l8.7-5'), P('M12 22V12')]);
const IcTruck = makeIcon([P('M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2'), P('M15 18H9'), P('M19 18h2a1 1 0 0 0 1-1v-3.6a1 1 0 0 0-.2-.6l-3.5-4.4A1 1 0 0 0 17.5 8H14'), C(17, 18, 2), C(7, 18, 2)]);
const IcPin = makeIcon([P('M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z'), C(12, 10, 3)]);
const IcPhone = makeIcon([P('M13.8 16.6a1 1 0 0 0 1.2-.3l.4-.5A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.5.4a1 1 0 0 0-.3 1.2 14 14 0 0 0 6.4 6.4')]);
const IcCard = makeIcon([R(2, 5, 20, 14, 2.5), P('M2 10h20'), P('M6 15h3')]);
const IcFile = makeIcon([P('M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'), P('M14 2v5h6'), P('M16 13H8'), P('M16 17H8'), P('M10 9H8')]);
const IcPrint = makeIcon([P('M6 9V2h12v7'), P('M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2'), R(6, 14, 12, 8, 1.5)]);
const IcChat = makeIcon([P('M7.9 20A9 9 0 1 0 4 16.1L2 22Z')]);
const IcSend = makeIcon([P('m22 2-7 20-4-9-9-4Z'), P('M22 2 11 13')]);
const IcFunnel = makeIcon([P('M10 20v-6.5L3.5 5.6A1 1 0 0 1 4.3 4h15.4a1 1 0 0 1 .8 1.6L14 13.5V20l-2 1.5Z')]);
const IcSort = makeIcon([P('m21 16-4 4-4-4'), P('M17 20V4'), P('m3 8 4-4 4 4'), P('M7 4v16')]);
const IcGauge = makeIcon([P('m12 14 4-4'), P('M3.34 19a10 10 0 1 1 17.32 0')]);
const IcCar = makeIcon([P('M5 11h14'), P('M19 17h2a1 1 0 0 0 1-1v-3a2 2 0 0 0-1.5-1.9l-2.1-5.6A2 2 0 0 0 16.5 4h-9a2 2 0 0 0-1.9 1.5L3.5 11.1A2 2 0 0 0 2 13v3a1 1 0 0 0 1 1h2'), C(7, 17, 2), C(17, 17, 2)]);
const IcCross = makeIcon([C(12, 12, 9), P('M22 12h-4'), P('M6 12H2'), P('M12 6V2'), P('M12 22v-4'), C(12, 12, 2.5)]);
const IcLayers = makeIcon([P('m12.8 2.2a2 2 0 0 0-1.6 0L2.6 6.1a1 1 0 0 0 0 1.8l8.6 3.9a2 2 0 0 0 1.6 0l8.6-3.9a1 1 0 0 0 0-1.8Z'), P('m22 12.5-9.2 4.2a2 2 0 0 1-1.6 0L2 12.5'), P('m22 17.5-9.2 4.2a2 2 0 0 1-1.6 0L2 17.5')]);
const IcReset = makeIcon([P('M3 12a9 9 0 1 0 9-9 9.8 9.8 0 0 0-6.7 2.7L3 8'), P('M3 3v5h5')]);
const IcShield = makeIcon([P('M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1Z'), P('m9 12 2 2 4-4')]);
const IcUpload = makeIcon([P('M12 15V3'), P('m17 8-5-5-5 5'), P('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4')]);
const IcImage = makeIcon([R(3, 3, 18, 18, 2.5), C(9, 9, 2), P('m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21')]);
const IcOut = makeIcon([P('m16 17 5-5-5-5'), P('M21 12H9'), P('M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4')]);
const IcClock = makeIcon([C(12, 12, 9.5), P('M12 7v5.5l3.5 2')]);
const IcZap = makeIcon([P('M4 14a1 1 0 0 1-.8-1.6l9.9-10.2a.5.5 0 0 1 .9.5l-1.9 6a1 1 0 0 0 .9 1.3h7a1 1 0 0 1 .8 1.6l-9.9 10.2a.5.5 0 0 1-.9-.5l1.9-6A1 1 0 0 0 11 14Z')]);
const IcTag = makeIcon([P('M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4Z'), C(7.5, 7.5, 1.2)]);
const IcWrench = makeIcon([P('M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9Z')]);
const IcStar = makeIcon([P('m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5-5.9-3.2-5.9 3.2 1.2-6.5L2.5 9.4l6.6-.9Z')]);
const IcApple = makeIcon([P('M12 20.9c1.5 0 2.8 1.1 4 1.1 3 0 6-8 6-12.2A4.9 4.9 0 0 0 17 5c-2.2 0-4 1.4-5 2-1-.6-2.8-2-5-2a4.9 4.9 0 0 0-5 4.8C2 14 5 22 8 22c1.3 0 2.5-1.1 4-1.1Z'), P('M10 2c1 .5 2 2 2 5')]);
const IcSparkle = makeIcon([P('M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6Z'), P('M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8Z')]);
const IcFlame = makeIcon([P('M12 22c4 0 7-2.7 7-6.5 0-2.7-1.6-4.6-3-6.2C14.4 7.4 13 5.5 13 2c0 0-6 3.5-6 10 0 1.4.5 2.6 1.3 3.5C7.5 15 7 14 7 12.5 5.8 13.8 5 15.2 5 16.8 5 19.9 8 22 12 22Z')]);
const IcBox = makeIcon([R(3, 3, 7, 7, 1.5), R(14, 3, 7, 7, 1.5), R(3, 14, 7, 7, 1.5), R(14, 14, 7, 7, 1.5)]);
const IcSpinner = makeIcon([P('M12 3a9 9 0 1 0 9 9')]);
const IcPercent = makeIcon([P('M19 5 5 19'), C(6.5, 6.5, 2.5), C(17.5, 17.5, 2.5)]);

function IcGoogle(props) {
  const s = props.size || 18;
  return (
    <svg viewBox="0 0 24 24" width={s} height={s} aria-hidden="true" className={props.className}>
      <path fill="#4285F4" d="M22 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.6a4.8 4.8 0 0 1-2.1 3.2v2.6h3.4c2-1.8 3.1-4.5 3.1-7.8Z" />
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.9-2.4l-3.4-2.6a6.2 6.2 0 0 1-9.2-3.2H2.8v2.7A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.3 13.8a6 6 0 0 1 0-3.8V7.3H2.8a10 10 0 0 0 0 9.4Z" />
      <path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 2.8 7.3l3.5 2.7A6 6 0 0 1 12 5.9Z" />
    </svg>
  );
}
function IcKnet(props) {
  return (
    <svg viewBox="0 0 40 24" width={props.size || 40} height={(props.size || 40) * 0.6} aria-hidden="true">
      <rect x="0.5" y="0.5" width="39" height="23" rx="4" fill="#0B3A6F" />
      <path d="M8 6v12M8 12l5-6M8 12l5 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M17.5 18V6l7 12V6" stroke="#00A85A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M28 6h7M31.5 6v12" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}


export { C, IcApple, IcBox, IcCar, IcCard, IcCart, IcChat, IcCheck, IcCheck2, IcChevD, IcChevL, IcChevR, IcClock, IcCross, IcFile, IcFlame, IcFunnel, IcGauge, IcGlobe, IcGoogle, IcImage, IcKnet, IcLayers, IcMinus, IcMoon, IcOut, IcPackage, IcPencil, IcPercent, IcPhone, IcPin, IcPlus, IcPrint, IcReset, IcSearch, IcSend, IcShield, IcSort, IcSparkle, IcSpinner, IcStar, IcSun, IcTag, IcTrash, IcTruck, IcUpload, IcUser, IcWrench, IcX, IcZap, P, R, makeIcon };
