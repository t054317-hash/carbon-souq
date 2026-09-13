import { createContext, useContext, useCallback } from 'react';
import { LANGS, STR } from '../lib/i18n.js';
import { ANCHOR_LABEL, ART_LABEL, ART_PRESETS, BRANDS, CURRENCIES, FREE_SHIP_OVER_KWD, GOVERNORATES, PROMOS, SEED_PARTS, SHIP_FLAT_KWD } from '../lib/data.js';
import { C, IcApple, IcBox, IcCar, IcCard, IcCart, IcChat, IcCheck, IcCheck2, IcChevD, IcChevL, IcChevR, IcClock, IcCross, IcFile, IcFlame, IcFunnel, IcGauge, IcGlobe, IcGoogle, IcImage, IcKnet, IcLayers, IcMinus, IcMoon, IcOut, IcPackage, IcPencil, IcPercent, IcPhone, IcPin, IcPlus, IcPrint, IcReset, IcSearch, IcSend, IcShield, IcSort, IcSparkle, IcSpinner, IcStar, IcSun, IcTag, IcTrash, IcTruck, IcUpload, IcUser, IcWrench, IcX, IcZap, P, R, makeIcon } from '../components/icons.jsx';
import { LOCALE, PRIO, brandOf, clamp, cx, dateFmt, money, store, timeFmt, uid } from '../lib/util.js';

/* ============================================================================
   6 · APP CONTEXT
   ========================================================================== */

const Ctx = createContext(null);
const useApp = () => useContext(Ctx);

/* t() resolves a STR key for the active language; loc() resolves a stored tuple */
function useT() {
  const { li } = useApp();
  return useCallback(key => {
    const row = STR[key];
    return row ? (row[li] || row[0]) : key;
  }, [li]);
}


export { Ctx, useApp, useT };
