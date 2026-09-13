import { LANGS, STR } from '../lib/i18n.js';
import { ANCHOR_LABEL, ART_LABEL, ART_PRESETS, BRANDS, CURRENCIES, FREE_SHIP_OVER_KWD, GOVERNORATES, PROMOS, SEED_PARTS, SHIP_FLAT_KWD } from '../lib/data.js';
import { C, IcApple, IcBox, IcCar, IcCard, IcCart, IcChat, IcCheck, IcCheck2, IcChevD, IcChevL, IcChevR, IcClock, IcCross, IcFile, IcFlame, IcFunnel, IcGauge, IcGlobe, IcGoogle, IcImage, IcKnet, IcLayers, IcMinus, IcMoon, IcOut, IcPackage, IcPencil, IcPercent, IcPhone, IcPin, IcPlus, IcPrint, IcReset, IcSearch, IcSend, IcShield, IcSort, IcSparkle, IcSpinner, IcStar, IcSun, IcTag, IcTrash, IcTruck, IcUpload, IcUser, IcWrench, IcX, IcZap, P, R, makeIcon } from '../components/icons.jsx';

/* ============================================================================
   5 · UTILITIES
   ========================================================================== */

const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem('cs.' + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem('cs.' + key, JSON.stringify(val)); } catch (e) {}
  }
};

const LOCALE = ['en-US', 'ar-KW-u-nu-latn', 'fr-FR'];

function money(kwd, cur, li, withSym) {
  const v = kwd * cur.rate;
  const n = new Intl.NumberFormat(LOCALE[li], {
    minimumFractionDigits: cur.dp, maximumFractionDigits: cur.dp
  }).format(v);
  if (withSym === false) return n;
  return li === 1 ? n + ' ' + cur.sym[1] : cur.sym[li] + ' ' + n;
}
function dateFmt(ts, li) {
  return new Intl.DateTimeFormat(LOCALE[li], { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(ts));
}
function timeFmt(ts, li) {
  return new Intl.DateTimeFormat(LOCALE[li], { hour: 'numeric', minute: '2-digit' }).format(new Date(ts));
}
const uid = () => Math.random().toString(36).slice(2, 9);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const brandOf = id => BRANDS.find(b => b.id === id) || BRANDS[0];
const cx = (...a) => a.filter(Boolean).join(' ');

const PRIO = {
  high: { key: 'prio_high', rgb: 'var(--bad-rgb)', rank: 0, Icon: IcFlame },
  medium: { key: 'prio_med', rgb: 'var(--ignite-rgb)', rank: 1, Icon: IcGauge },
  low: { key: 'prio_low', rgb: 'var(--accent-rgb)', rank: 2, Icon: IcLayers }
};


export { LOCALE, PRIO, brandOf, clamp, cx, dateFmt, money, store, timeFmt, uid };
