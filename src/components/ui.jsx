import React, { useState, useEffect, useMemo, useRef, useCallback, createContext, useContext, memo } from 'react';
import { LANGS, STR } from '../lib/i18n.js';
import { ANCHOR_LABEL, ART_LABEL, ART_PRESETS, BRANDS, CURRENCIES, FREE_SHIP_OVER_KWD, GOVERNORATES, PROMOS, SEED_PARTS, SHIP_FLAT_KWD } from '../lib/data.js';
import { C, IcApple, IcBox, IcCar, IcCard, IcCart, IcChat, IcCheck, IcCheck2, IcChevD, IcChevL, IcChevR, IcClock, IcCross, IcFile, IcFlame, IcFunnel, IcGauge, IcGlobe, IcGoogle, IcImage, IcKnet, IcLayers, IcMinus, IcMoon, IcOut, IcPackage, IcPencil, IcPercent, IcPhone, IcPin, IcPlus, IcPrint, IcReset, IcSearch, IcSend, IcShield, IcSort, IcSparkle, IcSpinner, IcStar, IcSun, IcTag, IcTrash, IcTruck, IcUpload, IcUser, IcWrench, IcX, IcZap, P, R, makeIcon } from '../components/icons.jsx';
import { LOCALE, PRIO, brandOf, clamp, cx, dateFmt, money, store, timeFmt, uid } from '../lib/util.js';
import { Ctx, useApp, useT } from '../lib/ctx.js';
import { ART, ArtBattery, ArtBrake, ArtCoilover, ArtDefs, ArtExhaust, ArtFilter, ArtGearbox, ArtHeadlight, ArtPlug, ArtRadiator, ArtTurbo, ArtWheel, ArtWing, PartArt, Stage, bolts, hatch, holes } from '../components/art.jsx';
import { EXPLODE_DIR, Helix, REDUCED, createStage, fadeTexture, finTexture } from '../three/stage.js';

/* ============================================================================
   9 · UI PRIMITIVES
   ========================================================================== */

const BTN = {
  primary: 'bg-accent text-ground hover:brightness-110 border-transparent font-semibold',
  solid: 'bg-ink text-ground hover:opacity-90 border-transparent font-semibold',
  outline: 'border-line hover:border-accent hover:text-accent bg-transparent',
  ghost: 'border-transparent hover:bg-raised',
  danger: 'border-transparent bg-bad/12 text-bad hover:bg-bad/20',
  glass: 'glass hover:border-accent/50'
};
function Btn({ variant = 'outline', size = 'md', className, children, ...rest }) {
  const sz = size === 'sm' ? 'h-8 px-3 text-[.8rem] gap-1.5'
    : size === 'lg' ? 'h-12 px-6 text-[.95rem] gap-2.5'
    : 'h-10 px-4 text-[.875rem] gap-2';
  return (
    <button
      className={cx('inline-flex items-center justify-center rounded-xl border transition-all duration-200 active:scale-[.97] disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap', sz, BTN[variant], className)}
      {...rest}
    >{children}</button>
  );
}

function Field({ label, hint, error, children, className }) {
  return (
    <label className={cx('flex flex-col gap-1.5', className)}>
      <span className="eyebrow text-faint">{label}</span>
      {children}
      {error ? <span className="text-[.75rem] text-bad">{error}</span>
        : hint ? <span className="text-[.75rem] text-faint">{hint}</span> : null}
    </label>
  );
}
const inputCls = 'h-11 w-full rounded-xl border border-line bg-raised px-3.5 text-[.9rem] placeholder:text-faint/70 transition focus:border-accent focus:bg-surface';
const Input = props => <input {...props} className={cx(inputCls, props.className)} />;
const Select = ({ children, ...p }) => (
  <div className="relative">
    <select {...p} className={cx(inputCls, 'appearance-none pe-9', p.className)}>{children}</select>
    <IcChevD size={15} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-faint" />
  </div>
);

function Chip({ tone = 'line', children, className, ...rest }) {
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-md px-2 py-[3px] text-[.7rem] font-semibold leading-none', className)}
      style={{ background: 'rgb(' + tone + ' / .14)', color: 'rgb(' + tone + ')' }} {...rest}>{children}</span>
  );
}

function useLockBody(active) {
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [active]);
}
function useEsc(active, cb) {
  useEffect(() => {
    if (!active) return;
    const h = e => { if (e.key === 'Escape') cb(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [active, cb]);
}

function Modal({ open, onClose, children, size = 'md', label }) {
  useLockBody(open);
  useEsc(open, onClose);
  if (!open) return null;
  const w = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-3xl' : size === 'xl' ? 'max-w-5xl' : 'max-w-xl';
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={label}>
      <div className="fixed inset-0 bg-[#04060a]/70 backdrop-blur-sm" onClick={onClose} />
      <div className={cx('relative w-full rounded-t-2xl border border-line bg-surface shadow-lift sm:rounded-2xl', w)}
        style={{ animation: 'riseIn .32s cubic-bezier(.22,1,.36,1) both' }}>
        {children}
      </div>
    </div>
  );
}
function ModalHead({ title, sub, onClose, icon }) {
  const t = useT();
  return (
    <div className="flex items-start gap-3 border-b border-line px-5 py-4">
      {icon && <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent">{icon}</div>}
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-[1.05rem] font-semibold leading-tight">{title}</h2>
        {sub && <p className="mt-0.5 text-[.82rem] text-muted">{sub}</p>}
      </div>
      <button onClick={onClose} aria-label={t('close')}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line text-muted transition hover:text-ink"><IcX size={16} /></button>
    </div>
  );
}

function Drawer({ open, onClose, children, label }) {
  useLockBody(open);
  useEsc(open, onClose);
  const { dir } = useApp();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={label}>
      <div className="absolute inset-0 bg-[#04060a]/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cx('absolute inset-y-0 flex w-full max-w-[27rem] flex-col border-line bg-surface shadow-lift',
          dir === 'rtl' ? 'start-0 border-e' : 'end-0 border-s')}
        style={{ animation: 'riseIn .3s cubic-bezier(.22,1,.36,1) both' }}
      >{children}</div>
    </div>
  );
}

function Menu({ button, children, align = 'end', width = 'w-56' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const k = e => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', h);
    document.addEventListener('keydown', k);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', k); };
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      {button(() => setOpen(o => !o), open)}
      {open && (
        <div onClick={() => setOpen(false)}
          className={cx('absolute top-[calc(100%+8px)] z-40 overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-lift',
            width, align === 'end' ? 'end-0' : 'start-0')}
          style={{ animation: 'riseIn .18s ease-out both' }}>{children}</div>
      )}
    </div>
  );
}
const MenuItem = ({ active, children, ...p }) => (
  <button {...p} className={cx('flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start text-[.85rem] transition hover:bg-raised',
    active && 'text-accent')}>{children}</button>
);

function Toasts({ items }) {
  return (
    <div className="pointer-events-none fixed bottom-24 start-1/2 z-[60] flex w-max max-w-[92vw] -translate-x-1/2 flex-col items-center gap-2 rtl:translate-x-1/2">
      {items.map(t => (
        <div key={t.id} className="glass flex items-center gap-2 rounded-full px-4 py-2 text-[.82rem] font-medium shadow-lift"
          style={{ animation: 'riseIn .25s ease-out both' }}>
          <span className="grid h-5 w-5 place-items-center rounded-full bg-good/20 text-good"><IcCheck size={12} /></span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}


export { BTN, Btn, Chip, Drawer, Field, Input, Menu, MenuItem, Modal, ModalHead, Select, Toasts, inputCls, useEsc, useLockBody };
