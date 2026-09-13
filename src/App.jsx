import React, { useState, useEffect, useMemo, useRef, useCallback, createContext, useContext, memo } from 'react';
import { LANGS, STR } from './lib/i18n.js';
import { ANCHOR_LABEL, ART_LABEL, ART_PRESETS, BRANDS, CURRENCIES, FREE_SHIP_OVER_KWD, GOVERNORATES, PROMOS, SEED_PARTS, SHIP_FLAT_KWD } from './lib/data.js';
import { C, IcApple, IcBox, IcCar, IcCard, IcCart, IcChat, IcCheck, IcCheck2, IcChevD, IcChevL, IcChevR, IcClock, IcCross, IcFile, IcFlame, IcFunnel, IcGauge, IcGlobe, IcGoogle, IcImage, IcKnet, IcLayers, IcMinus, IcMoon, IcOut, IcPackage, IcPencil, IcPercent, IcPhone, IcPin, IcPlus, IcPrint, IcReset, IcSearch, IcSend, IcShield, IcSort, IcSparkle, IcSpinner, IcStar, IcSun, IcTag, IcTrash, IcTruck, IcUpload, IcUser, IcWrench, IcX, IcZap, P, R, makeIcon } from './components/icons.jsx';
import { LOCALE, PRIO, brandOf, clamp, cx, dateFmt, money, store, timeFmt, uid } from './lib/util.js';
import { Ctx, useApp, useT } from './lib/ctx.js';
import { ART, ArtBattery, ArtBrake, ArtCoilover, ArtDefs, ArtExhaust, ArtFilter, ArtGearbox, ArtHeadlight, ArtPlug, ArtRadiator, ArtTurbo, ArtWheel, ArtWing, PartArt, Stage, bolts, hatch, holes } from './components/art.jsx';
import { EXPLODE_DIR, Helix, REDUCED, createStage, fadeTexture, finTexture } from './three/stage.js';
import { BTN, Btn, Chip, Drawer, Field, Input, Menu, MenuItem, Modal, ModalHead, Select, Toasts, inputCls, useEsc, useLockBody } from './components/ui.jsx';
import { DB, SUPABASE_KEY, SUPABASE_URL, fromDbPart, sb, toDbPart, toJson, toTuple, uid2 } from './lib/db.js';

/* ============================================================================
   10 · HEADER
   ========================================================================== */

function Logo() {
  const t = useT();
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-ink text-ground">
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
          <path d="M3 14.5h18" /><path d="M6 14.5V11l2.4-4.6A2 2 0 0 1 10.2 5.3h3.6a2 2 0 0 1 1.8 1.1L18 11v3.5" />
          <circle cx="7.5" cy="17.5" r="2" /><circle cx="16.5" cy="17.5" r="2" />
        </svg>
      </div>
      <div className="hidden leading-none sm:block">
        <div className="font-display text-[1.02rem] font-semibold tracking-tight">{t('brand')}</div>
        <div className="mt-1 text-[.66rem] uppercase tracking-[.14em] text-faint">{t('tagline')}</div>
      </div>
    </div>
  );
}

function Header() {
  const app = useApp();
  const t = useT();
  const [mobile, setMobile] = useState(false);
  const tabs = [
    ['shop', 'nav_shop', IcBox], ['wishlist', 'nav_wishlist', IcStar],
    ['garage', 'nav_garage', IcCar], ['orders', 'nav_orders', IcTruck]
  ];
  const count = app.cart.reduce((s, l) => s + l.qty, 0);

  const langMenu = (
    <Menu width="w-44" button={(toggle, open) => (
      <Btn variant="ghost" size="sm" onClick={toggle} aria-expanded={open} className="px-2.5">
        <IcGlobe size={16} />
        <span className="hidden font-semibold uppercase md:inline">{app.lang}</span>
        <IcChevD size={13} className="opacity-60" />
      </Btn>
    )}>
      <div className="px-3 pb-1 pt-2 eyebrow text-faint">{t('lang_label')}</div>
      {LANGS.map(l => (
        <MenuItem key={l.code} active={l.code === app.lang} onClick={() => app.setLang(l.code)}>
          <span className="w-8 font-mono text-[.7rem] uppercase text-faint">{l.code}</span>
          <span className="flex-1">{l.native}</span>
          {l.code === app.lang && <IcCheck size={14} />}
        </MenuItem>
      ))}
    </Menu>
  );

  const curMenu = (
    <Menu width="w-56" button={(toggle, open) => (
      <Btn variant="ghost" size="sm" onClick={toggle} aria-expanded={open} className="px-2.5">
        <span className="font-mono text-[.78rem] font-semibold">{app.cur.code}</span>
        <IcChevD size={13} className="opacity-60" />
      </Btn>
    )}>
      <div className="px-3 pb-1 pt-2 eyebrow text-faint">{t('cur_label')}</div>
      {CURRENCIES.map(c => (
        <MenuItem key={c.code} active={c.code === app.cur.code} onClick={() => app.setCur(c.code)}>
          <span className="w-10 font-mono text-[.72rem] font-semibold">{c.code}</span>
          <span className="flex-1 text-[.8rem] text-muted">{c.name[app.li]}</span>
          {c.code === app.cur.code && <IcCheck size={14} />}
        </MenuItem>
      ))}
      <div className="mt-1 border-t border-line px-3 py-2 text-[.7rem] leading-snug text-faint">
        1 KWD = {new Intl.NumberFormat(LOCALE[app.li], { maximumFractionDigits: 3 }).format(app.cur.rate)} {app.cur.code}
      </div>
    </Menu>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ground/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6">
        <button onClick={() => app.setView('shop')} className="shrink-0"><Logo /></button>

        <nav className="ms-2 hidden items-center gap-0.5 rounded-xl border border-line bg-raised p-1 lg:flex">
          {tabs.map(([id, key, Icon]) => (
            <button key={id} onClick={() => app.setView(id)}
              className={cx('flex items-center gap-2 rounded-lg px-3 py-1.5 text-[.82rem] font-medium transition',
                app.view === id ? 'bg-surface text-accent shadow-sm' : 'text-muted hover:text-ink')}>
              <Icon size={15} />{t(key)}
            </button>
          ))}
        </nav>

        <div className="relative ms-auto hidden max-w-xs flex-1 md:block lg:max-w-sm">
          <IcSearch size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={app.q} onChange={e => { app.setQ(e.target.value); app.setView('shop'); }}
            placeholder={t('search_ph')} aria-label={t('search_ph')}
            className="h-10 w-full rounded-xl border border-line bg-raised ps-9 pe-3 text-[.85rem] placeholder:text-faint/70 focus:border-accent focus:bg-surface"
          />
        </div>

        <div className="ms-auto flex items-center gap-1 md:ms-0">
          {langMenu}
          {curMenu}
          <Btn variant="ghost" size="sm" onClick={app.toggleTheme} className="px-2.5"
            aria-label={app.dark ? t('theme_light') : t('theme_dark')}>
            {app.dark ? <IcSun size={16} /> : <IcMoon size={16} />}
          </Btn>

          <button onClick={() => app.setCartOpen(true)} aria-label={t('cart_label')}
            className="relative grid h-9 w-9 place-items-center rounded-xl border border-line transition hover:border-accent hover:text-accent">
            <IcCart size={17} />
            {count > 0 && (
              <span className="absolute -end-1.5 -top-1.5 grid h-5 min-w-[20px] place-items-center rounded-full bg-accent px-1 font-mono text-[.65rem] font-bold text-ground">{count}</span>
            )}
          </button>

          {app.user ? (
            <Menu width="w-60" button={toggle => (
              <button onClick={toggle} className="ms-1 flex items-center gap-2 rounded-xl border border-line p-1 pe-2 transition hover:border-accent">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent/15 font-display text-[.75rem] font-bold text-accent">{app.user.initials}</span>
                <IcChevD size={13} className="text-faint" />
              </button>
            )}>
              <div className="px-3 py-2">
                <div className="truncate text-[.88rem] font-semibold">{app.user.name}</div>
                <div className="truncate text-[.75rem] text-faint">{app.user.email}</div>
              </div>
              <div className="my-1 border-t border-line" />
              <MenuItem onClick={() => app.setView('garage')}><IcCar size={15} />{t('nav_garage')}
                <span className="ms-auto font-mono text-[.7rem] text-faint">{app.user.garage.length}</span></MenuItem>
              <MenuItem onClick={() => app.setView('orders')}><IcTruck size={15} />{t('nav_orders')}
                <span className="ms-auto font-mono text-[.7rem] text-faint">{app.orders.length}</span></MenuItem>
              <MenuItem onClick={app.signOut}><IcOut size={15} />{t('sign_out')}</MenuItem>
            </Menu>
          ) : (
            <Btn variant="primary" size="sm" className="ms-1 hidden sm:inline-flex" onClick={() => app.setAuth('signin')}>
              <IcUser size={15} />{t('sign_in')}
            </Btn>
          )}

          <button onClick={() => setMobile(m => !m)} aria-label={t('menu')}
            className="grid h-9 w-9 place-items-center rounded-xl border border-line lg:hidden">
            {mobile ? <IcX size={16} /> : <IcLayers size={16} />}
          </button>
        </div>
      </div>

      {mobile && (
        <div className="border-t border-line bg-surface px-4 py-3 lg:hidden" style={{ animation: 'riseIn .2s ease-out both' }}>
          <div className="relative mb-3 md:hidden">
            <IcSearch size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-faint" />
            <input value={app.q} onChange={e => app.setQ(e.target.value)} placeholder={t('search_ph')}
              className="h-10 w-full rounded-xl border border-line bg-raised ps-9 pe-3 text-[.85rem]" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {tabs.map(([id, key, Icon]) => (
              <button key={id} onClick={() => { app.setView(id); setMobile(false); }}
                className={cx('flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[.85rem]',
                  app.view === id ? 'border-accent/60 bg-accent/10 text-accent' : 'border-line')}>
                <Icon size={16} />{t(key)}
              </button>
            ))}
          </div>
          {!app.user && (
            <Btn variant="primary" className="mt-3 w-full" onClick={() => { app.setAuth('signin'); setMobile(false); }}>
              <IcUser size={15} />{t('sign_in')}
            </Btn>
          )}
        </div>
      )}
    </header>
  );
}

/* ============================================================================
   11 · AUTH
   ========================================================================== */

function AuthModal() {
  const app = useApp();
  const t = useT();
  const mode = app.auth;
  const [form, setForm] = useState({ name: '', email: '', pass: '' });
  const [err, setErr] = useState({});
  const [busy, setBusy] = useState(false);
  const open = mode === 'signin' || mode === 'register';
  const isReg = mode === 'register';

  useEffect(() => { if (open) { setErr({}); setBusy(false); } }, [open, mode]);

  /* Supabase reports a taken address under more than one shape: a typed code on
     newer clients, a bare message on older ones. Match every form so a duplicate
     sign-up never falls through to the generic failure text. */
  const isDuplicate = error => {
    if (!error) return false;
    if (error.code === 'user_already_exists' || error.code === 'email_exists') return true;
    return /already\s*(registered|exists|in use)/i.test(error.message || '');
  };

  /* Maps auth errors to messages that do not reveal whether an account exists. */
  const messageFor = error => {
    switch (error && error.code) {
      case 'invalid_credentials': return t('auth_wrong');
      case 'email_not_confirmed': return t('auth_unconfirmed');
      case 'user_already_exists':
      case 'email_exists': return t('auth_exists');
      case 'weak_password': return t('auth_bad_pass');
      case 'over_request_rate_limit':
      case 'over_email_send_rate_limit': return t('auth_rate');
      default: return error && error.status === 429 ? t('auth_rate') : t('auth_failed');
    }
  };

  const submit = async e => {
    e.preventDefault();
    const next = {};
    if (isReg && form.name.trim().length < 2) next.name = t('auth_bad_name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) next.email = t('auth_bad_email');
    if (form.pass.length < 6) next.pass = t('auth_bad_pass');
    setErr(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    const email = form.email.trim().toLowerCase();

    if (isReg) {
      const { data, error } = await sb.auth.signUp({
        email, password: form.pass,
        options: { data: { full_name: form.name.trim() }, emailRedirectTo: window.location.href }
      });
      setBusy(false);
      if (error) return setErr({ form: isDuplicate(error) ? t('auth_exists') : messageFor(error) });
      // A duplicate does not always arrive as an error. When Supabase is set to
      // hide whether an address is taken it answers 200 with a decoy user whose
      // identities array is empty, so read that as "already registered" too.
      const identities = data && data.user && data.user.identities;
      if (Array.isArray(identities) && identities.length === 0)
        return setErr({ form: t('auth_exists') });
      // Email confirmation on -> a user but no session yet.
      if (!data.session) return setErr({ notice: t('auth_check_email') });
      app.setAuth(null);
      app.toast(t('toast_signin'));
      return;
    }

    const { data, error } = await sb.auth.signInWithPassword({ email, password: form.pass });
    setBusy(false);

    // The whole point: a bad password comes back as `error`, NOT as a throw.
    if (error) return setErr({ form: messageFor(error) });
    // And a 2xx with no session is still a failed sign-in.
    if (!data || !data.session) return setErr({ form: t('auth_failed') });

    app.setAuth(null);
    app.toast(t('toast_signin'));
  };

  const social = async provider => {
    setBusy(true);
    const { error } = await sb.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.href }
    });
    setBusy(false);
    // Providers must be switched on in the Supabase dashboard first; until then
    // this returns a validation error rather than redirecting.
    if (error) setErr({ form: t('auth_provider_off') });
  };

  return (
    <Modal open={open} onClose={() => app.setAuth(null)} size="sm" label={t('sign_in')}>
      <div className="px-6 pb-6 pt-7">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-[1.35rem] font-semibold leading-tight">{isReg ? t('auth_create') : t('auth_welcome')}</h2>
            <p className="mt-1 max-w-[24rem] text-[.85rem] leading-snug text-muted">{t('auth_sub')}</p>
          </div>
          <button onClick={() => app.setAuth(null)} aria-label={t('close')}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-muted hover:text-ink"><IcX size={15} /></button>
        </div>

        <div className="grid gap-2">
          <button onClick={() => social('google')} disabled={busy}
            className="flex h-12 items-center justify-center gap-3 rounded-xl border border-line bg-surface text-[.9rem] font-medium transition hover:border-accent/60 hover:bg-raised disabled:opacity-50">
            <IcGoogle size={18} />{t('auth_google')}
          </button>
          <button onClick={() => social('apple')} disabled={busy}
            className="flex h-12 items-center justify-center gap-3 rounded-xl border border-transparent bg-ink text-[.9rem] font-medium text-ground transition hover:opacity-90 disabled:opacity-50">
            <IcApple size={18} />{t('auth_apple')}
          </button>
        </div>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-line" />
          <span className="eyebrow text-faint">{t('auth_or')}</span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={submit} className="grid gap-3.5" noValidate>
          {isReg && (
            <Field label={t('auth_name')} error={err.name}>
              <Input value={form.name} autoComplete="name" onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Yousef Al-Ahmad" />
            </Field>
          )}
          <Field label={t('auth_email')} error={err.email}>
            <Input type="email" dir="ltr" value={form.email} autoComplete="email"
              onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          </Field>
          <Field label={t('auth_pass')} error={err.pass}>
            <Input type="password" dir="ltr" value={form.pass} autoComplete={isReg ? 'new-password' : 'current-password'}
              onChange={e => setForm({ ...form, pass: e.target.value })} placeholder="••••••••" />
          </Field>
          {(err.form || err.notice) && (
            <p role="alert" aria-live="polite"
              className={cx('flex items-start gap-2 rounded-xl border px-3 py-2 text-[.82rem] leading-snug',
                err.form ? 'border-bad/40 bg-bad/10 text-bad' : 'border-good/40 bg-good/10 text-good')}>
              {err.form ? <IcFlame size={14} className="mt-0.5 shrink-0" /> : <IcCheck size={14} className="mt-0.5 shrink-0" />}
              {err.form || err.notice}
            </p>
          )}
          <Btn type="submit" variant="primary" size="lg" className="mt-1 w-full" disabled={busy}>
            {busy ? <IcSpinner size={16} className="animate-spin" /> : null}
            {isReg ? t('auth_do_reg') : t('auth_do_signin')}
          </Btn>
        </form>

        <div className="mt-4 flex items-center justify-between gap-2 text-[.8rem]">
          <button className="text-accent hover:underline" onClick={() => app.setAuth(isReg ? 'signin' : 'register')}>
            {isReg ? t('auth_to_signin') : t('auth_to_reg')}
          </button>
          {!isReg && <button className="text-faint hover:text-ink">{t('auth_forgot')}</button>}
        </div>
        <p className="mt-5 flex items-center gap-1.5 text-[.72rem] text-faint">
          <IcShield size={13} />{t('auth_demo')}
        </p>
      </div>
    </Modal>
  );
}

/* ============================================================================
   12 · HERO — WebGL stage, hotspots and the part HUD
   ========================================================================== */

function Stage3D() {
  const app = useApp();
  const t = useT();
  const canvasRef = useRef(null);
  const apiRef = useRef(null);
  const hotRefs = useRef({});
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [exploded, setExploded] = useState(false);

  const part = app.parts.find(p => p.id === app.selectedId) || null;
  const anchor = part ? part.anchor : null;

  useEffect(() => {
    let api;
    try {
      api = createStage(canvasRef.current, frames => {
        for (let i = 0; i < frames.length; i++) {
          const f = frames[i];
          const el = hotRefs.current[f.anchor];
          if (!el) continue;
          el.style.transform = 'translate3d(' + Math.round(f.x) + 'px,' + Math.round(f.y) + 'px,0) translate(-50%,-50%)';
          el.style.opacity = f.on ? String(clamp(1.5 - f.depth / 12, 0.28, 1)) : '0';
          el.style.pointerEvents = f.on ? 'auto' : 'none';
        }
      });
      apiRef.current = api;
      setReady(true);
    } catch (e) {
      setFailed(true);
    }
    return () => { if (api) api.dispose(); apiRef.current = null; };
  }, []);

  useEffect(() => {
    if (!apiRef.current) return;
    apiRef.current.select(anchor);
    if (anchor) setExploded(true);
  }, [anchor]);

  useEffect(() => { if (apiRef.current) apiRef.current.setTheme(app.dark); }, [app.dark]);

  const toggleExplode = () => {
    const next = !exploded;
    setExploded(next);
    if (apiRef.current) apiRef.current.setExplode(next);
    if (!next) app.setSelected(null);
  };
  const reset = () => {
    setExploded(false);
    app.setSelected(null);
    if (apiRef.current) { apiRef.current.setExplode(false); apiRef.current.reset(); }
  };

  const pick = a => {
    const hit = app.parts.find(p => p.anchor === a);
    if (hit) app.setSelected(hit.id);
    else if (apiRef.current) { setExploded(true); apiRef.current.setExplode(true); apiRef.current.select(a); }
  };

  return (
    <section className="carbon-weave relative isolate overflow-hidden border-b border-line bg-ground">
      <div className="relative h-[clamp(430px,66vh,680px)] w-full">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full"
          style={{ touchAction: 'none', cursor: 'grab' }} aria-label="Interactive 3D car" />

        {failed && (
          <div className="absolute inset-0 grid place-items-center px-6 text-center">
            <div>
              <IcCar size={40} className="mx-auto text-faint" />
              <p className="mt-3 max-w-sm text-[.9rem] text-muted">
                WebGL is unavailable in this browser, so the 3D stage is off. Everything else works.
              </p>
            </div>
          </div>
        )}

        {/* hotspots */}
        {!failed && Object.keys(ANCHOR_LABEL).map(a => {
          const on = anchor === a;
          const has = app.parts.some(p => p.anchor === a);
          return (
            <button key={a} data-hotspot="1" ref={el => { hotRefs.current[a] = el; }}
              onClick={() => pick(a)} title={ANCHOR_LABEL[a][app.li]}
              className="absolute start-0 top-0 z-10 grid place-items-center rounded-full transition-[width,height] duration-200"
              style={{ opacity: 0, width: on ? 26 : 18, height: on ? 26 : 18 }}
              aria-label={ANCHOR_LABEL[a][app.li]}>
              <span className={cx('block rounded-full border-2 transition-all',
                on ? 'h-[26px] w-[26px] border-accent bg-accent/25 pulse-ring'
                   : has ? 'h-3 w-3 border-accent/80 bg-ground/70 hover:h-4 hover:w-4'
                         : 'h-2.5 w-2.5 border-faint/70 bg-ground/60 hover:border-accent')} />
            </button>
          );
        })}

        {/* headline */}
        <div className="pointer-events-none absolute inset-x-0 top-0 p-4 sm:p-6">
          <div className="pointer-events-auto max-w-[30rem] rise">
            <div className="eyebrow flex items-center gap-2 text-accent">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />{t('hero_eyebrow')}
            </div>
            <h1 className="mt-2 font-display text-[clamp(1.7rem,4.4vw,2.9rem)] font-semibold leading-[1.05] tracking-tight">
              {t('hero_title')}
            </h1>
            <p className="mt-2 max-w-[26rem] text-[.9rem] leading-snug text-muted">{t('hero_sub')}</p>
          </div>
        </div>

        {/* stage controls */}
        <div className="absolute end-4 top-4 flex flex-col gap-2 sm:end-6 sm:top-6">
          <Btn variant="glass" size="sm" onClick={toggleExplode} className="justify-start">
            <IcLayers size={15} className={exploded ? 'text-accent' : ''} />
            <span className="hidden sm:inline">{exploded ? t('hero_assembled') : t('hero_explode')}</span>
          </Btn>
          <Btn variant="glass" size="sm" onClick={reset} className="justify-start">
            <IcReset size={15} /><span className="hidden sm:inline">{t('hero_reset')}</span>
          </Btn>
        </div>

        {/* HUD */}
        <div className="absolute inset-x-3 bottom-3 sm:inset-x-6 sm:bottom-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            {part ? (
              <div key={part.id} className="glass flex w-full max-w-[30rem] items-stretch gap-3 rounded-2xl p-2.5 shadow-hud" style={{ animation: 'riseIn .3s cubic-bezier(.22,1,.36,1) both' }}>
                <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl border border-line">
                  <PartArt art={part.art} photo={part.photo} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="eyebrow text-accent">{t('hero_position')}</span>
                  </div>
                  <div className="truncate font-display text-[.98rem] font-semibold">{app.nameOf(part)}</div>
                  <div className="mt-0.5 truncate text-[.75rem] text-muted">{ANCHOR_LABEL[part.anchor] ? ANCHOR_LABEL[part.anchor][app.li] : ''}</div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="num font-mono text-[.88rem] font-bold text-ignite">{money(part.price, app.cur, app.li)}</span>
                    <span className="font-mono text-[.68rem] text-faint">{part.oem}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col justify-between gap-1.5">
                  <button onClick={() => app.setSelected(null)} aria-label={t('close')}
                    className="grid h-7 w-7 place-items-center self-end rounded-lg border border-line text-muted hover:text-ink"><IcX size={13} /></button>
                  <Btn variant="primary" size="sm" onClick={() => app.addToCart(part.id)}>
                    <IcCart size={14} /><span className="hidden sm:inline">{t('card_add')}</span>
                  </Btn>
                </div>
              </div>
            ) : (
              <div className="glass w-full max-w-[26rem] rounded-2xl p-3.5 shadow-hud">
                <div className="eyebrow text-faint">{t('hero_nosel')}</div>
                <p className="mt-1 text-[.85rem] leading-snug text-muted">{t('hero_nosel_hint')}</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {['brakeFL', 'turbo', 'exhaust', 'wheelFL'].map(a => (
                    <button key={a} onClick={() => pick(a)}
                      className="rounded-lg border border-line px-2.5 py-1 text-[.75rem] text-muted transition hover:border-accent hover:text-accent">
                      {ANCHOR_LABEL[a][app.li]}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="hidden items-center gap-2 rounded-full border border-line bg-surface/60 px-3 py-1.5 text-[.72rem] text-faint backdrop-blur sm:flex">
              <IcCross size={13} />{t('hero_drag')}
            </div>
          </div>
        </div>

        {!ready && !failed && (
          <div className="absolute inset-0 grid place-items-center bg-ground">
            <div className="text-center">
              <div className="mx-auto h-1 w-40 overflow-hidden rounded-full bg-line">
                <div className="h-full w-1/3 rounded-full bg-accent" style={{ animation: 'sweep 1.2s ease-in-out infinite' }} />
              </div>
              <div className="mt-3 eyebrow text-faint">Building the car</div>
            </div>
          </div>
        )}
      </div>

      {/* instrument strip */}
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 divide-x divide-line border-t border-line sm:grid-cols-4 rtl:divide-x-reverse">
        {[
          [String(app.parts.length), t('hero_stat_parts'), IcBox],
          [String(BRANDS.length), t('hero_stat_brands'), IcCar],
          [t('hero_stat_ship_v'), t('hero_stat_ship'), IcTruck],
          ['K-Net', t('co_pay_method'), IcCard]
        ].map(([v, l, Icon], i) => (
          <div key={i} className={cx('flex items-center gap-3 px-4 py-3.5 sm:px-6', i > 1 && 'border-t border-line sm:border-t-0')}>
            <Icon size={17} className="shrink-0 text-accent" />
            <div className="min-w-0">
              <div className="num font-display text-[1.05rem] font-semibold leading-none">{v}</div>
              <div className="mt-1 truncate text-[.72rem] text-faint">{l}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================================
   13 · CATALOG
   ========================================================================== */

function PartCard({ part }) {
  const app = useApp();
  const t = useT();
  const [confirm, setConfirm] = useState(false);
  const prio = PRIO[part.prio];
  const Pi = prio.Icon;
  const b = brandOf(part.brand);
  const inCart = app.cart.some(l => l.id === part.id);
  const fits = app.user && app.user.garage.some(v => v.brand === part.brand);
  const selected = app.selectedId === part.id;

  return (
    <article className={cx('group relative flex flex-col overflow-hidden rounded-2xl border bg-surface transition-all duration-300',
      selected ? 'border-accent/70 shadow-lift' : 'border-line hover:border-accent/40 hover:shadow-lift')}>
      <span className="absolute inset-y-0 start-0 z-10 w-[3px]" style={{ background: 'rgb(' + prio.rgb + ')' }} />

      <div className="relative aspect-[4/3] overflow-hidden bg-[#0b0e12]">
        <PartArt art={part.art} photo={part.photo} className="transition-transform duration-500 group-hover:scale-[1.04]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#05070a] to-transparent" />
        <div className="absolute start-3 top-3 flex flex-wrap items-center gap-1.5">
          <span className="rounded-md bg-[#05070a]/70 px-2 py-1 text-[.68rem] font-semibold uppercase tracking-wide text-white/90 backdrop-blur">
            {app.li === 1 ? b.ar : b.label}
          </span>
          {fits && (
            <span className="flex items-center gap-1 rounded-md bg-good/85 px-2 py-1 text-[.68rem] font-semibold text-[#05100b] backdrop-blur">
              <IcCheck size={11} />{t('card_fits')}
            </span>
          )}
        </div>
        <span className="absolute end-3 top-3 flex items-center gap-1 rounded-md px-2 py-1 text-[.68rem] font-bold backdrop-blur"
          style={{ background: 'rgb(' + prio.rgb + ' / .2)', color: 'rgb(' + prio.rgb + ')' }}>
          <Pi size={11} />{t(prio.key)}
        </span>
        <span className="absolute bottom-3 end-3 num rounded-lg bg-[#05070a]/80 px-2.5 py-1.5 font-mono text-[.92rem] font-bold text-white backdrop-blur">
          {money(part.price, app.cur, app.li)}
        </span>
        {part.bought && (
          <div className="absolute inset-0 grid place-items-center bg-[#05070a]/60 backdrop-blur-[2px]">
            <span className="flex items-center gap-1.5 rounded-full border border-good/60 bg-good/15 px-3 py-1.5 text-[.78rem] font-semibold text-good">
              <IcCheck2 size={14} />{t('card_purchased')}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4 ps-5">
        <h3 className="font-display text-[1rem] font-semibold leading-tight">{app.nameOf(part)}</h3>
        <div className="flex items-center gap-1.5 font-mono text-[.72rem] text-faint">
          <span className="eyebrow tracking-normal">{t('card_oem')}</span>
          <span dir="ltr" className="truncate">{part.oem || '—'}</span>
        </div>
        {app.specOf(part) && <p className="mt-0.5 text-[.8rem] leading-snug text-muted">{app.specOf(part)}</p>}

        <div className="mt-auto flex items-center gap-1.5 pt-3.5">
          <Btn variant={inCart ? 'outline' : 'primary'} size="sm" className="flex-1"
            onClick={() => app.addToCart(part.id)} disabled={inCart}>
            {inCart ? <IcCheck size={14} /> : <IcCart size={14} />}
            {inCart ? t('card_incart') : t('card_add')}
          </Btn>
          <button onClick={() => app.setSelected(selected ? null : part.id)} title={t('card_locate')} aria-label={t('card_locate')}
            className={cx('grid h-8 w-8 place-items-center rounded-lg border transition',
              selected ? 'border-accent bg-accent/12 text-accent' : 'border-line text-muted hover:border-accent hover:text-accent')}>
            <IcCross size={15} />
          </button>
          <button onClick={() => app.togglePurchased(part.id)} title={part.bought ? t('card_unbought') : t('card_bought')}
            aria-label={part.bought ? t('card_unbought') : t('card_bought')}
            className={cx('grid h-8 w-8 place-items-center rounded-lg border transition',
              part.bought ? 'border-good bg-good/12 text-good' : 'border-line text-muted hover:border-good hover:text-good')}>
            <IcCheck2 size={15} />
          </button>
          <button onClick={() => app.editPart(part)} title={t('card_edit')} aria-label={t('card_edit')}
            className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition hover:border-ink hover:text-ink">
            <IcPencil size={14} />
          </button>
          <button onClick={() => setConfirm(true)} title={t('card_del')} aria-label={t('card_del')}
            className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition hover:border-bad hover:text-bad">
            <IcTrash size={14} />
          </button>
        </div>
      </div>

      {confirm && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-surface/92 p-5 backdrop-blur-sm">
          <div className="text-center">
            <p className="font-display text-[.95rem] font-semibold">{t('card_del_q')}</p>
            <p className="mt-1 text-[.82rem] text-muted">{app.nameOf(part)}</p>
            <div className="mt-4 flex justify-center gap-2">
              <Btn size="sm" variant="outline" onClick={() => setConfirm(false)}>{t('form_cancel')}</Btn>
              <Btn size="sm" variant="danger" onClick={() => app.removePart(part.id)}>
                <IcTrash size={14} />{t('card_del')}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function Toolbar() {
  const app = useApp();
  const t = useT();
  const dirty = app.q || app.brand !== 'all' || app.prio !== 'all' || app.sort !== 'new';
  return (
    <div className="sticky top-16 z-30 -mx-4 mb-6 border-b border-line bg-ground/90 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl border border-line bg-raised p-1">
          {[['open', 'tab_open'], ['bought', 'tab_bought']].map(([id, key]) => (
            <button key={id} onClick={() => app.setTab(id)}
              className={cx('rounded-lg px-3 py-1.5 text-[.82rem] font-medium transition',
                app.tab === id ? 'bg-surface text-accent shadow-sm' : 'text-muted hover:text-ink')}>
              {t(key)}
              <span className="ms-1.5 font-mono text-[.7rem] text-faint">
                {app.parts.filter(p => (id === 'bought') === !!p.bought).length}
              </span>
            </button>
          ))}
        </div>

        <div className="relative md:hidden">
          <IcSearch size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-faint" />
          <input value={app.q} onChange={e => app.setQ(e.target.value)} placeholder={t('search_ph')}
            className="h-9 w-[13rem] rounded-xl border border-line bg-raised ps-8 pe-3 text-[.82rem]" />
        </div>

        <label className="relative">
          <span className="sr-only">{t('f_all_brands')}</span>
          <IcFunnel size={14} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-faint" />
          <select value={app.brand} onChange={e => app.setBrand(e.target.value)}
            className="h-9 appearance-none rounded-xl border border-line bg-raised ps-8 pe-8 text-[.82rem] focus:border-accent">
            <option value="all">{t('f_all_brands')}</option>
            {BRANDS.map(b => <option key={b.id} value={b.id}>{app.li === 1 ? b.ar : b.label}</option>)}
          </select>
          <IcChevD size={13} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-faint" />
        </label>

        <label className="relative">
          <span className="sr-only">{t('prio_label')}</span>
          <select value={app.prio} onChange={e => app.setPrio(e.target.value)}
            className="h-9 appearance-none rounded-xl border border-line bg-raised ps-3 pe-8 text-[.82rem] focus:border-accent">
            <option value="all">{t('f_all_prio')}</option>
            {Object.keys(PRIO).map(k => <option key={k} value={k}>{t(PRIO[k].key)}</option>)}
          </select>
          <IcChevD size={13} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-faint" />
        </label>

        <label className="relative">
          <span className="sr-only">{t('f_sort')}</span>
          <IcSort size={14} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-faint" />
          <select value={app.sort} onChange={e => app.setSort(e.target.value)}
            className="h-9 appearance-none rounded-xl border border-line bg-raised ps-8 pe-8 text-[.82rem] focus:border-accent">
            <option value="new">{t('sort_new')}</option>
            <option value="hi">{t('sort_hi')}</option>
            <option value="lo">{t('sort_lo')}</option>
            <option value="prio">{t('sort_prio')}</option>
          </select>
          <IcChevD size={13} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-faint" />
        </label>

        {dirty && (
          <Btn size="sm" variant="ghost" onClick={app.clearFilters} className="text-faint">
            <IcX size={13} />{t('cat_clear')}
          </Btn>
        )}

        <Btn variant="primary" size="sm" className="ms-auto" onClick={() => app.editPart(null)}>
          <IcPlus size={15} />{t('cat_add')}
        </Btn>
      </div>
    </div>
  );
}

function Catalog() {
  const app = useApp();
  const t = useT();
  const list = app.visibleParts;
  return (
    <section className="mx-auto max-w-[1400px] px-4 pb-16 pt-8 sm:px-6">
      <div className="mb-1 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow text-accent">{t('nav_shop')}</div>
          <h2 className="mt-1.5 font-display text-[1.6rem] font-semibold leading-tight">{t('cat_title')}</h2>
          <p className="mt-1 text-[.9rem] text-muted">{t('cat_sub')}</p>
        </div>
        <p className="num text-[.82rem] text-faint">
          {t('cat_showing')} <span className="font-mono font-semibold text-ink">{list.length}</span> {t('cat_of')}{' '}
          <span className="font-mono">{app.parts.length}</span>
        </p>
      </div>

      <Toolbar />

      {list.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-line py-20 text-center">
          <IcSearch size={26} className="text-faint" />
          <p className="mt-3 font-display text-[1.05rem] font-semibold">{t('cat_empty')}</p>
          <p className="mt-1 text-[.85rem] text-muted">{t('cat_empty_hint')}</p>
          <Btn size="sm" variant="outline" className="mt-4" onClick={app.clearFilters}>{t('cat_clear')}</Btn>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p, i) => (
            <div key={p.id} style={{ animation: 'riseIn .4s cubic-bezier(.22,1,.36,1) both', animationDelay: Math.min(i * 40, 320) + 'ms' }}>
              <PartCard part={p} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ============================================================================
   14 · ADD / EDIT PART
   ========================================================================== */

const EMPTY_PART = { name: '', oem: '', brand: 'toyota', price: '', prio: 'medium', art: 'brake', spec: '', anchor: 'brakeFL', photo: '' };

function PartForm() {
  const app = useApp();
  const t = useT();
  const open = app.formOpen;
  const editing = app.formPart;
  const [f, setF] = useState(EMPTY_PART);
  const [err, setErr] = useState({});
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setErr({});
    setF(editing ? {
      name: app.nameOf(editing), oem: editing.oem, brand: editing.brand,
      price: String(editing.price), prio: editing.prio, art: editing.art,
      spec: app.specOf(editing), anchor: editing.anchor, photo: editing.photo || ''
    } : EMPTY_PART);
  }, [open, editing]);

  const upd = (k, v) => setF(prev => ({ ...prev, [k]: v }));

  /* accept="image/*" only filters the picker; it is a convenience, not a rule.
     Check the real type and size before reading anything. */
  const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const PHOTO_MAX = 2 * 1024 * 1024;

  const onFile = e => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (PHOTO_TYPES.indexOf(file.type) === -1 || file.size > PHOTO_MAX) {
      setErr(prev => Object.assign({}, prev, { photo: t('form_err_photo') }));
      return;
    }
    setErr(prev => { const n = Object.assign({}, prev); delete n.photo; return n; });
    const r = new FileReader();
    r.onload = () => upd('photo', String(r.result));
    r.readAsDataURL(file);
  };

  const submit = e => {
    e.preventDefault();
    const next = {};
    if (!f.name.trim()) next.name = t('form_err_name');
    const price = parseFloat(f.price);
    if (!(price > 0)) next.price = t('form_err_price');
    setErr(next);
    if (Object.keys(next).length) return;
    app.savePart({ ...f, price });
  };

  return (
    <Modal open={open} onClose={app.closeForm} size="lg" label={editing ? t('form_edit') : t('form_new')}>
      <ModalHead icon={<IcWrench size={17} />} onClose={app.closeForm}
        title={editing ? t('form_edit') : t('form_new')}
        sub={editing ? editing.oem : t('form_img_hint')} />
      <form onSubmit={submit} className="scroll-thin max-h-[70vh] overflow-y-auto px-5 py-5" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('form_name')} error={err.name} className="sm:col-span-2">
            <Input value={f.name} onChange={e => upd('name', e.target.value)} placeholder={t('form_name_ph')} autoFocus />
          </Field>
          <Field label={t('form_oem')}>
            <Input value={f.oem} dir="ltr" onChange={e => upd('oem', e.target.value)} placeholder={t('form_oem_ph')} className="font-mono" />
          </Field>
          <Field label={t('form_brand')}>
            <Select value={f.brand} onChange={e => upd('brand', e.target.value)}>
              {BRANDS.map(b => <option key={b.id} value={b.id}>{app.li === 1 ? b.ar : b.label}</option>)}
            </Select>
          </Field>
          <Field label={t('form_price') + ' · KWD'} error={err.price}
            hint={f.price > 0 && app.cur.code !== 'KWD' ? money(parseFloat(f.price) || 0, app.cur, app.li) : t('form_price_note')}>
            <div className="relative">
              <span className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 font-mono text-[.8rem] text-faint">KD</span>
              <input type="number" step="0.001" min="0" value={f.price} onChange={e => upd('price', e.target.value)}
                placeholder="0.000" dir="ltr" className={cx(inputCls, 'ps-10 font-mono')} />
            </div>
          </Field>
          <Field label={t('form_spec')}>
            <Input value={f.spec} onChange={e => upd('spec', e.target.value)} placeholder={t('form_spec_ph')} />
          </Field>

          <div className="sm:col-span-2">
            <span className="eyebrow text-faint">{t('prio_label')}</span>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {['high', 'medium', 'low'].map(k => {
                const P2 = PRIO[k].Icon;
                const on = f.prio === k;
                return (
                  <button type="button" key={k} onClick={() => upd('prio', k)}
                    className={cx('flex h-11 items-center justify-center gap-2 rounded-xl border text-[.85rem] font-medium transition',
                      on ? 'border-transparent' : 'border-line text-muted hover:text-ink')}
                    style={on ? { background: 'rgb(' + PRIO[k].rgb + ' / .16)', color: 'rgb(' + PRIO[k].rgb + ')', borderColor: 'rgb(' + PRIO[k].rgb + ' / .5)' } : undefined}>
                    <P2 size={15} />{t(PRIO[k].key)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <span className="eyebrow text-faint">{t('form_img')}</span>
              <button type="button" onClick={() => fileRef.current && fileRef.current.click()}
                className="flex items-center gap-1.5 text-[.78rem] text-accent hover:underline">
                <IcUpload size={13} />{t('form_upload')}
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} className="hidden" />
            </div>
            <p className="mt-1 text-[.75rem] text-faint">{t('form_img_hint')}</p>
            <div className="mt-2.5 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {f.photo && (
                <button type="button" onClick={() => upd('photo', '')}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg border-2 border-accent">
                  <img src={f.photo} alt={t('form_uploaded')} className="h-full w-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-[#05070a]/80 py-0.5 text-center text-[.6rem] text-white">{t('form_uploaded')}</span>
                </button>
              )}
              {ART_PRESETS.map(a => (
                <button type="button" key={a} onClick={() => { upd('art', a); upd('photo', ''); }}
                  title={ART_LABEL[a][app.li]}
                  className={cx('aspect-[4/3] overflow-hidden rounded-lg border-2 transition',
                    !f.photo && f.art === a ? 'border-accent' : 'border-line hover:border-accent/50')}>
                  <PartArt art={a} />
                </button>
              ))}
            </div>
          </div>

          <Field label={t('hero_position')} className="sm:col-span-2">
            <Select value={f.anchor} onChange={e => upd('anchor', e.target.value)}>
              {Object.keys(ANCHOR_LABEL).map(a => <option key={a} value={a}>{ANCHOR_LABEL[a][app.li]}</option>)}
            </Select>
          </Field>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2 border-t border-line pt-4">
          <Btn type="button" variant="ghost" onClick={app.closeForm}>{t('form_cancel')}</Btn>
          <Btn type="submit" variant="primary"><IcCheck size={15} />{t('form_save')}</Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ============================================================================
   15 · GARAGE
   ========================================================================== */

function Garage() {
  const app = useApp();
  const t = useT();
  const [v, setV] = useState({ brand: 'toyota', model: '', year: '2023', plate: '' });

  if (!app.user) {
    return (
      <section className="mx-auto max-w-[1400px] px-4 py-20 text-center sm:px-6">
        <IcCar size={30} className="mx-auto text-faint" />
        <h2 className="mt-3 font-display text-[1.3rem] font-semibold">{t('gar_signed_out')}</h2>
        <p className="mt-1 text-[.88rem] text-muted">{t('gar_sub')}</p>
        <Btn variant="primary" className="mt-5" onClick={() => app.setAuth('signin')}><IcUser size={15} />{t('sign_in')}</Btn>
      </section>
    );
  }

  const add = e => {
    e.preventDefault();
    if (!v.model.trim()) return;
    app.addVehicle({ ...v, model: v.model.trim() });
    setV({ brand: 'toyota', model: '', year: '2023', plate: '' });
  };

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <div className="eyebrow text-accent">{t('nav_garage')}</div>
      <h2 className="mt-1.5 font-display text-[1.6rem] font-semibold leading-tight">{t('gar_title')}</h2>
      <p className="mt-1 text-[.9rem] text-muted">{t('gar_sub')}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div>
          {app.user.garage.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-line py-16 text-center">
              <IcCar size={26} className="text-faint" />
              <p className="mt-3 font-display font-semibold">{t('gar_empty')}</p>
              <p className="mt-1 text-[.85rem] text-muted">{t('gar_empty_hint')}</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {app.user.garage.map(car => {
                const b = brandOf(car.brand);
                const fitting = app.parts.filter(p => p.brand === car.brand).length;
                return (
                  <div key={car.id} className="relative overflow-hidden rounded-2xl border border-line bg-surface p-4">
                    <div className="absolute inset-x-0 top-0 h-24 opacity-[.16]"
                      style={{ background: 'radial-gradient(120% 90% at 20% 0%, hsl(' + b.hue + ' 85% 55%), transparent 70%)' }} />
                    <div className="relative flex items-start gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line bg-raised text-accent">
                        <IcCar size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-display text-[1rem] font-semibold">{app.li === 1 ? b.ar : b.label} {car.model}</h3>
                          {car.primary && <Chip tone="var(--accent-rgb)">{t('gar_primary')}</Chip>}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[.72rem] text-faint">
                          <span>{car.year}</span>
                          {car.plate && <span dir="ltr">· {car.plate}</span>}
                        </div>
                        <p className="mt-2 text-[.78rem] text-muted">
                          <span className="font-mono font-semibold text-good">{fitting}</span> {t('gar_fitting')}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2 border-t border-line pt-3">
                      {!car.primary && (
                        <Btn size="sm" variant="ghost" onClick={() => app.setPrimaryVehicle(car.id)}>
                          <IcStar size={13} />{t('gar_make_primary')}
                        </Btn>
                      )}
                      <Btn size="sm" variant="ghost" className="ms-auto text-faint hover:text-bad" onClick={() => app.removeVehicle(car.id)}>
                        <IcTrash size={13} />{t('gar_remove')}
                      </Btn>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <form onSubmit={add} className="h-max rounded-2xl border border-line bg-surface p-4">
          <h3 className="font-display text-[1rem] font-semibold">{t('gar_add')}</h3>
          <div className="mt-3 grid gap-3">
            <Field label={t('form_brand')}>
              <Select value={v.brand} onChange={e => setV({ ...v, brand: e.target.value })}>
                {BRANDS.map(b => <option key={b.id} value={b.id}>{app.li === 1 ? b.ar : b.label}</option>)}
              </Select>
            </Field>
            <Field label={t('gar_model')}>
              <Input value={v.model} onChange={e => setV({ ...v, model: e.target.value })} placeholder={t('gar_model_ph')} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('gar_year')}>
                <Input type="number" min="1970" max="2027" dir="ltr" value={v.year} onChange={e => setV({ ...v, year: e.target.value })} className="font-mono" />
              </Field>
              <Field label={t('gar_plate')}>
                <Input value={v.plate} dir="ltr" onChange={e => setV({ ...v, plate: e.target.value })} placeholder="4 / 12345" className="font-mono" />
              </Field>
            </div>
            <Btn type="submit" variant="primary" className="mt-1 w-full"><IcPlus size={15} />{t('gar_add')}</Btn>
          </div>
        </form>
      </div>
    </section>
  );
}

/* ============================================================================
   15b · CUSTOMER REVIEWS
   Avatars are CC0 placeholder portraits from pravatar.cc. The published page
   runs under a CSP that blocks off-origin images, so each avatar sits on top
   of a drawn monogram and removes itself if the request fails — the photos
   appear on any normal host, the monogram covers everywhere else.
   ========================================================================== */

const REVIEWS = [
  {
    id: 'r1',
    name: ['Yousef Al-Mutairi', 'يوسف المطيري', 'Yousef Al-Mutairi'],
    role: ['Independent BMW specialist · Shuwaikh Industrial', 'أخصائي بي إم دبليو · الشويخ الصناعية', 'Spécialiste BMW indépendant · Shuwaikh'],
    stars: 5, at: '2026-08-21', part: 'p1', hue: 200,
    quote: [
      'I send the OEM number and they confirm fitment before anything ships. Two years, not one wrong caliper — in a workshop that alone pays for itself.',
      'أرسل رقم القطعة الأصلي فيتحققون من المطابقة قبل الشحن. سنتان دون كاليبر خاطئ واحد — وهذا وحده يكفي أي ورشة.',
      'J’envoie la référence OEM et ils confirment la compatibilité avant expédition. Deux ans sans un seul étrier erroné — rentable pour un atelier.'
    ]
  },
  {
    id: 'r2',
    name: ['Dana Al-Fahad', 'دانة الفهد', 'Dana Al-Fahad'],
    role: ['Track-day driver · Kuwait Motor Town', 'سائقة حلبة · كويت موتور تاون', 'Pilote track-day · Kuwait Motor Town'],
    stars: 5, at: '2026-08-09', part: 'p4', hue: 320,
    quote: [
      'Ordered coilovers on Tuesday, fitted them Wednesday night, was on track Thursday morning. Prices are quoted to the fils, so what I see is exactly what K-Net charges.',
      'طلبت المساعدات الثلاثاء، وركّبتها ليلة الأربعاء، وكنت على الحلبة صباح الخميس. الأسعار محددة بالفلس، وما أراه هو ما يخصمه كي نت بالضبط.',
      'Combinés commandés mardi, montés mercredi soir, sur piste jeudi matin. Les prix sont affichés au fils près : ce que je vois est ce que K-Net débite.'
    ]
  },
  {
    id: 'r3',
    name: ['Faisal Al-Harbi', 'فيصل الحربي', 'Faisal Al-Harbi'],
    role: ['Fleet supervisor · 40 vehicles · Farwaniya', 'مشرف أسطول · ٤٠ مركبة · الفروانية', 'Responsable de flotte · 40 véhicules'],
    stars: 4, at: '2026-07-28', part: 'p7', hue: 150,
    quote: [
      'K-Net plus a proper PDF invoice on every order keeps accounting quiet. One radiator went on backorder and they told me the same day instead of letting me wait.',
      'كي نت وفاتورة PDF لكل طلب يريحان قسم الحسابات. تأخر أحد الردياتيرات فأبلغوني في اليوم نفسه بدل أن يتركوني أنتظر.',
      'K-Net et une vraie facture PDF par commande : la compta est tranquille. Un radiateur en rupture, et j’ai été prévenu le jour même.'
    ]
  },
  {
    id: 'r4',
    name: ['Meshari Al-Ajmi', 'مشاري العجمي', 'Meshari Al-Ajmi'],
    role: ['Land Cruiser owner · Jahra', 'مالك لاندكروزر · الجهراء', 'Propriétaire de Land Cruiser · Jahra'],
    stars: 5, at: '2026-08-30', part: 'p3', hue: 40,
    quote: [
      'Out in Jahra, ordering parts usually means waiting. This came the next afternoon and the intake bolted straight on — no adapters, no drilling.',
      'في الجهراء يعني طلب القطع الانتظار عادةً. وصلت الطلبية عصر اليوم التالي وتركّب نظام السحب مباشرةً — بلا وصلات ولا تخريم.',
      'À Jahra, commander une pièce veut dire attendre. Celle-ci est arrivée le lendemain après-midi et l’admission s’est montée directement.'
    ]
  },
  {
    id: 'r5',
    name: ['Noura Al-Qattan', 'نورة القطان', 'Noura Al-Qattan'],
    role: ['Workshop owner · Salmiya', 'صاحبة ورشة · السالمية', 'Propriétaire d’atelier · Salmiya'],
    stars: 5, at: '2026-09-02', part: 'p11', hue: 265,
    quote: [
      'Half my customers read Arabic, half of them want the price in dirhams. Switching the site does both, and My Garage keeps a wishlist per car so nothing gets ordered twice.',
      'نصف عملائي يقرأون العربية، ونصفهم يريد السعر بالدرهم. تبديل الموقع يوفّر الاثنين، و«جراجي» يحفظ قائمة لكل سيارة فلا يُطلب شيء مرتين.',
      'La moitié de mes clients lisent l’arabe, l’autre veut le prix en dirhams. Le site fait les deux, et Mon garage garde une liste par voiture.'
    ]
  }
];

const STAR_D = 'M12 2.4l2.86 5.79 6.39.93-4.62 4.5 1.09 6.37L12 16.98l-5.72 3.01 1.09-6.37-4.62-4.5 6.39-.93z';

function Stars({ n, size = 14, label }) {
  return (
    <span className="flex items-center gap-[3px]" role="img" aria-label={label}>
      {[0, 1, 2, 3, 4].map(i => (
        <svg key={i} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
          <path d={STAR_D} fill={i < n ? 'rgb(var(--ignite-rgb))' : 'rgb(var(--line-rgb))'} />
        </svg>
      ))}
    </span>
  );
}

function Avatar({ person, size = 46 }) {
  const [failed, setFailed] = useState(false);
  const initials = (person.name[0] || '').split(/\s+/).map(s => s[0]).slice(0, 2).join('');
  return (
    <span className="relative grid shrink-0 place-items-center overflow-hidden rounded-full"
      style={{
        width: size, height: size,
        background: 'linear-gradient(140deg, hsl(' + person.hue + ' 62% 46%), hsl(' + ((person.hue + 40) % 360) + ' 58% 26%))',
        boxShadow: '0 0 0 2px rgb(var(--accent-rgb) / .28)'
      }}>
      <span className="font-display font-bold text-white/95" style={{ fontSize: size * 0.33 }}>{initials}</span>
      {!failed && person.avatar && (
        <img src={person.avatar} alt="" width={size} height={size} loading="lazy" decoding="async"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover" />
      )}
    </span>
  );
}

function ReviewCard({ r, featured }) {
  const app = useApp();
  const t = useT();
  const part = app.parts.find(p => p.id === r.part);
  return (
    <article className={cx('group relative flex h-full flex-col rounded-2xl border border-line bg-surface p-5 transition-all duration-300 hover:border-accent/40 hover:shadow-lift',
      featured && 'xl:col-span-2')}>
      <span aria-hidden="true"
        className="pointer-events-none absolute end-5 top-3 font-display text-[3.4rem] leading-none text-accent/12 select-none">”</span>

      <div className="flex items-center gap-3">
        <Avatar person={r} size={featured ? 54 : 46} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-display text-[.95rem] font-semibold leading-tight">{app.nameOf(r)}</h3>
            <span title={t('rev_verified')} className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-good/20 text-good">
              <IcCheck size={10} sw={3} />
            </span>
          </div>
          <p className="mt-0.5 truncate text-[.75rem] text-faint">{r.role[app.li] || r.role[0]}</p>
        </div>
      </div>

      <div className="mt-3.5 flex items-center gap-2">
        <Stars n={r.stars} label={r.stars + ' / 5'} />
        <span className="num font-mono text-[.72rem] font-semibold text-ignite">{r.stars}.0</span>
        <span className="num ms-auto font-mono text-[.7rem] text-faint">{dateFmt(new Date(r.at).getTime(), app.li)}</span>
      </div>

      <blockquote className={cx('mt-3 flex-1 text-muted', featured ? 'text-[1rem] leading-relaxed' : 'text-[.88rem] leading-relaxed')}>
        {r.quote[app.li] || r.quote[0]}
      </blockquote>

      {part && (
        <button onClick={() => { app.setSelected(part.id); window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }); }}
          className="mt-4 flex items-center gap-2.5 rounded-xl border border-line bg-raised p-2 text-start transition hover:border-accent/50">
          <span className="h-9 w-11 shrink-0 overflow-hidden rounded-lg border border-line">
            <PartArt art={part.art} photo={part.photo} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block eyebrow text-faint">{t('rev_bought')}</span>
            <span className="block truncate text-[.8rem] font-medium">{app.nameOf(part)}</span>
          </span>
          <IcChevR size={14} className="shrink-0 text-faint transition group-hover:text-accent" />
        </button>
      )}
    </article>
  );
}

function Testimonials() {
  const app = useApp();
  const t = useT();
  // Live rows from public.reviews; the bundled copy is the fallback while the
  // first request is in flight or if the database is unreachable.
  const list = app.reviews && app.reviews.length ? app.reviews : REVIEWS;
  const avg = useMemo(() => list.reduce((s, r) => s + r.stars, 0) / (list.length || 1), [list]);
  const spread = useMemo(() => {
    const counts = [5, 4, 3, 2, 1].map(n => list.filter(r => r.stars === n).length);
    const max = Math.max.apply(null, counts.concat([1]));
    return counts.map((c, i) => ({ n: 5 - i, c, pct: Math.round((c / max) * 100) }));
  }, [list]);

  return (
    <section className="carbon-weave relative border-t border-line bg-ground">
      <div className="relative mx-auto max-w-[1400px] px-4 py-14 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-end">
          <div>
            <div className="eyebrow flex items-center gap-2 text-accent">
              <IcShield size={14} />{t('rev_eyebrow')}
            </div>
            <h2 className="mt-2 max-w-[22ch] font-display text-[clamp(1.5rem,3vw,2.1rem)] font-semibold leading-[1.1] tracking-tight">
              {t('rev_title')}
            </h2>
            <p className="mt-2 max-w-[52ch] text-[.92rem] leading-relaxed text-muted">{t('rev_sub')}</p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-center gap-4">
              <div>
                <div className="num font-display text-[2.6rem] font-semibold leading-none text-ignite">
                  {new Intl.NumberFormat(LOCALE[app.li], { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(avg)}
                </div>
                <Stars n={Math.round(avg)} size={13} label={avg + ' / 5'} />
              </div>
              <div className="min-w-0 border-s border-line ps-4 text-[.78rem] leading-snug text-muted">
                <div className="font-semibold text-ink">{t('rev_of5')}</div>
                <div className="num mt-0.5">{list.length} {t('rev_count')}</div>
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-accent/12 px-1.5 py-0.5 text-[.66rem] font-semibold text-accent">
                  {t('rev_sample')}
                </div>
              </div>
            </div>
            <dl className="mt-4 space-y-1.5">
              {spread.map(row => (
                <div key={row.n} className="flex items-center gap-2">
                  <dt className="num w-8 shrink-0 font-mono text-[.7rem] text-faint">{row.n}★</dt>
                  <dd className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                    <span className="block h-full rounded-full bg-ignite/70" style={{ width: row.pct + '%' }} />
                  </dd>
                  <span className="num w-4 shrink-0 text-end font-mono text-[.7rem] text-faint">{row.c}</span>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((r, i) => (
            <div key={r.id} className={cx(i === 0 && 'xl:col-span-2')}
              style={{ animation: 'riseIn .45s cubic-bezier(.22,1,.36,1) both', animationDelay: Math.min(i * 60, 300) + 'ms' }}>
              <ReviewCard r={r} featured={i === 0} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   16 · CART
   ========================================================================== */

function CartPanel() {
  const app = useApp();
  const t = useT();
  const [code, setCode] = useState('');
  const [bad, setBad] = useState(false);
  const { subtotal, ship, discount, total, count } = app.totals;

  // Codes are validated against public.promo_codes, not a hard-coded list, so
  // a code can be added or switched off in the database without a redeploy.
  const apply = async () => {
    const key = code.trim().toUpperCase();
    if (!key) return;
    const ok = await app.setPromo(key);
    if (!ok) { setBad(true); return; }
    setBad(false);
    setCode('');
    app.toast(t('toast_promo'));
  };

  return (
    <Drawer open={app.cartOpen} onClose={() => app.setCartOpen(false)} label={t('cart_title')}>
      <div className="flex items-center gap-3 border-b border-line px-5 py-4">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent/12 text-accent"><IcCart size={17} /></div>
        <div className="flex-1">
          <h2 className="font-display text-[1.05rem] font-semibold leading-none">{t('cart_title')}</h2>
          <p className="mt-1 num text-[.78rem] text-faint">{count} {count === 1 ? t('cart_item') : t('cart_items')}</p>
        </div>
        <button onClick={() => app.setCartOpen(false)} aria-label={t('close')}
          className="grid h-9 w-9 place-items-center rounded-xl border border-line text-muted hover:text-ink"><IcX size={16} /></button>
      </div>

      {app.cart.length === 0 ? (
        <div className="grid flex-1 place-items-center px-8 text-center">
          <div>
            <IcCart size={28} className="mx-auto text-faint" />
            <p className="mt-3 font-display text-[1rem] font-semibold">{t('cart_empty')}</p>
            <p className="mt-1 text-[.85rem] text-muted">{t('cart_empty_hint')}</p>
            <Btn variant="outline" size="sm" className="mt-4" onClick={() => app.setCartOpen(false)}>{t('cart_keep')}</Btn>
          </div>
        </div>
      ) : (
        <>
          <div className="scroll-thin flex-1 divide-y divide-line overflow-y-auto">
            {app.cart.map(line => {
              const p = app.parts.find(x => x.id === line.id);
              if (!p) return null;
              return (
                <div key={line.id} className="flex gap-3 p-4">
                  <div className="h-[68px] w-[84px] shrink-0 overflow-hidden rounded-xl border border-line">
                    <PartArt art={p.art} photo={p.photo} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <h3 className="min-w-0 flex-1 truncate text-[.88rem] font-semibold leading-snug">{app.nameOf(p)}</h3>
                      <button onClick={() => app.setQty(line.id, 0)} aria-label={t('cart_remove')}
                        className="shrink-0 text-faint transition hover:text-bad"><IcX size={14} /></button>
                    </div>
                    <div dir="ltr" className="mt-0.5 font-mono text-[.7rem] text-faint">{p.oem || '—'}</div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center rounded-lg border border-line">
                        <button onClick={() => app.setQty(line.id, line.qty - 1)} aria-label="−"
                          className="grid h-7 w-7 place-items-center text-muted hover:text-ink"><IcMinus size={13} /></button>
                        <span className="num w-7 text-center font-mono text-[.8rem] font-semibold">{line.qty}</span>
                        <button onClick={() => app.setQty(line.id, line.qty + 1)} aria-label="+"
                          className="grid h-7 w-7 place-items-center text-muted hover:text-ink"><IcPlus size={13} /></button>
                      </div>
                      <span className="num font-mono text-[.86rem] font-bold">{money(p.price * line.qty, app.cur, app.li)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-line p-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <IcTag size={14} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-faint" />
                <input value={code} onChange={e => { setCode(e.target.value); setBad(false); }}
                  placeholder={t('cart_promo_ph')} aria-label={t('cart_promo')} dir="ltr"
                  className={cx('h-10 w-full rounded-xl border bg-raised ps-8 pe-3 font-mono text-[.82rem] uppercase',
                    bad ? 'border-bad' : 'border-line focus:border-accent')} />
              </div>
              <Btn variant="outline" onClick={apply}>{t('cart_apply')}</Btn>
            </div>
            {bad && <p className="mt-1.5 text-[.75rem] text-bad">{t('cart_promo_bad')}</p>}
            {app.promo && (
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-good/10 px-3 py-2 text-[.78rem] text-good">
                <IcPercent size={13} /><span className="font-mono font-semibold">{app.promo}</span>
                <button onClick={() => app.setPromo(null)} className="ms-auto opacity-70 hover:opacity-100"><IcX size={12} /></button>
              </div>
            )}

            <dl className="mt-3.5 space-y-2 text-[.85rem]">
              <div className="flex justify-between"><dt className="text-muted">{t('cart_sub')}</dt>
                <dd className="num font-mono">{money(subtotal, app.cur, app.li)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">{t('cart_ship')}</dt>
                <dd className="num font-mono">{ship === 0 ? <span className="text-good">{t('cart_free')}</span> : money(ship, app.cur, app.li)}</dd></div>
              {discount > 0 && (
                <div className="flex justify-between text-good"><dt>{t('cart_discount')}</dt>
                  <dd className="num font-mono">−{money(discount, app.cur, app.li)}</dd></div>
              )}
              <div className="flex items-baseline justify-between border-t border-line pt-2.5">
                <dt className="font-display text-[.95rem] font-semibold">{t('cart_total')}</dt>
                <dd className="num font-mono text-[1.15rem] font-bold text-ignite">{money(total, app.cur, app.li)}</dd>
              </div>
            </dl>

            {ship > 0 && (
              <p className="mt-2 text-[.72rem] text-faint">
                {t('cart_free_over')} <span className="font-mono">{money(FREE_SHIP_OVER_KWD, app.cur, app.li)}</span>
              </p>
            )}
            <Btn variant="primary" size="lg" className="mt-3 w-full" onClick={app.startCheckout}>
              <IcShield size={16} />{t('cart_checkout')}
            </Btn>
          </div>
        </>
      )}
    </Drawer>
  );
}

/* ============================================================================
   17 · CHECKOUT — Kuwait address, map pin, local payment rails
   ========================================================================== */

const KUWAIT_PATH = 'M17 13 L61 9 L67 21 L57 26 L51 21 L45 30 L57 35 L62 45 L58 57 L53 71 L47 87 L39 89 L25 79 L13 61 L9 39 Z';

function MapPicker({ open, onClose, onPick, value }) {
  const app = useApp();
  const t = useT();
  const [pin, setPin] = useState(value || null);
  const place = e => {
    const r = e.currentTarget.getBoundingClientRect();
    setPin({
      x: +(((e.clientX - r.left) / r.width) * 100).toFixed(1),
      y: +(((e.clientY - r.top) / r.height) * 100).toFixed(1)
    });
  };
  const near = useMemo(() => {
    if (!pin) return null;
    let best = null, d = Infinity;
    GOVERNORATES.forEach(g => {
      const dd = Math.hypot(g.xy[0] - pin.x, g.xy[1] - pin.y);
      if (dd < d) { d = dd; best = g; }
    });
    return best;
  }, [pin]);

  return (
    <Modal open={open} onClose={onClose} size="lg" label={t('co_map_title')}>
      <ModalHead icon={<IcPin size={17} />} title={t('co_map_title')} sub={t('co_map_hint')} onClose={onClose} />
      <div className="p-5">
        <div className="relative overflow-hidden rounded-2xl border border-line bg-[#080c12]">
          <div onClick={place} className="relative cursor-crosshair">
            <svg viewBox="0 0 100 100" className="block h-[46vh] w-full">
              <defs>
                <linearGradient id="kw-land" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#16202c" /><stop offset="1" stopColor="#0d141c" />
                </linearGradient>
              </defs>
              <rect width="100" height="100" fill="#070b10" />
              {Array.from({ length: 20 }, (_, i) => (
                <g key={i}>
                  <line x1={i * 5} y1="0" x2={i * 5} y2="100" stroke="#131b25" strokeWidth=".2" />
                  <line x1="0" y1={i * 5} x2="100" y2={i * 5} stroke="#131b25" strokeWidth=".2" />
                </g>
              ))}
              <path d={KUWAIT_PATH} fill="url(#kw-land)" stroke="#22e1ff" strokeWidth=".45" strokeOpacity=".55" />
              <path d="M67 21 L57 26 L51 21" fill="none" stroke="#22e1ff" strokeWidth=".7" strokeOpacity=".8" />
              <ellipse cx="72" cy="15" rx="3.4" ry="2" fill="#141d28" stroke="#2b3646" strokeWidth=".25" />
              <ellipse cx="66" cy="30" rx="2" ry="1.4" fill="#141d28" stroke="#2b3646" strokeWidth=".25" />
              {GOVERNORATES.map(g => (
                <g key={g.id}>
                  <circle cx={g.xy[0]} cy={g.xy[1]} r=".9" fill="#22e1ff" fillOpacity=".7" />
                  <text x={g.xy[0] + 2} y={g.xy[1] + 1} fontSize="2.4" fill="#7c8797" fontFamily="Barlow, sans-serif">
                    {app.li === 1 ? g.ar : g.en}
                  </text>
                </g>
              ))}
              <text x="50" y="97" textAnchor="middle" fontSize="2.2" fill="#3d4753" fontFamily="JetBrains Mono, monospace">
                SCHEMATIC · NOT TO SCALE
              </text>
            </svg>
            {pin && (
              <div className="pointer-events-none absolute" style={{ left: pin.x + '%', top: pin.y + '%', transform: 'translate(-50%,-100%)' }}>
                <IcPin size={26} className="text-accent drop-shadow-[0_0_10px_rgba(34,225,255,.8)]" />
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 text-[.82rem]">
            {pin ? (
              <span className="flex flex-wrap items-center gap-2">
                <Chip tone="var(--accent-rgb)"><IcCheck size={11} />{t('co_pinned')}</Chip>
                <span className="font-mono text-[.75rem] text-faint">{pin.x}, {pin.y}</span>
                {near && <span className="text-muted">· {app.li === 1 ? near.ar : near.en}</span>}
              </span>
            ) : <span className="text-faint">{t('co_map_hint')}</span>}
          </div>
          <Btn variant="ghost" onClick={onClose}>{t('form_cancel')}</Btn>
          <Btn variant="primary" disabled={!pin} onClick={() => { onPick(pin, near); onClose(); }}>
            <IcPin size={15} />{t('co_map_use')}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

const EMPTY_ADDR = { gov: 'asimah', area: '', block: '', street: '', ave: '', house: '', floor: '', phone: '', notes: '', pin: null };

function Checkout() {
  const app = useApp();
  const t = useT();
  const [step, setStep] = useState(0);
  const [addr, setAddr] = useState(() => store.get('addr', EMPTY_ADDR));
  const [method, setMethod] = useState('knet');

  const [err, setErr] = useState({});
  const [mapOpen, setMapOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { subtotal, ship, discount, total } = app.totals;
  const gov = GOVERNORATES.find(g => g.id === addr.gov) || GOVERNORATES[0];

  useEffect(() => { if (app.checkoutOpen) { setStep(0); setErr({}); setBusy(false); } }, [app.checkoutOpen]);

  const upd = (k, v) => setAddr(a => ({ ...a, [k]: v }));

  const validate = () => {
    const next = {};
    ['area', 'block', 'street', 'house'].forEach(k => { if (!String(addr[k]).trim()) next[k] = true; });
    const digits = addr.phone.replace(/\D/g, '');
    if (digits.length !== 8) next.phone = t('co_bad_phone');
    setErr(next);
    return Object.keys(next).length === 0;
  };

  const place = () => {
    setBusy(true);
    setTimeout(() => {
      app.placeOrder({ addr, method, card: null });
      store.set('addr', addr);
      setBusy(false);
    }, 1300);
  };

  const steps = [t('co_s1'), t('co_s2'), t('co_s3')];

  return (
    <>
      <Modal open={app.checkoutOpen} onClose={app.closeCheckout} size="lg" label={t('co_title')}>
        <ModalHead icon={<IcShield size={17} />} title={t('co_title')} onClose={app.closeCheckout}
          sub={money(total, app.cur, app.li) + ' · ' + app.totals.count + ' ' + t('cart_items')} />

        <div className="flex items-center gap-1 border-b border-line px-5 py-3">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className={cx('flex items-center gap-2 text-[.8rem]', i === step ? 'text-accent' : i < step ? 'text-good' : 'text-faint')}>
                <span className={cx('grid h-6 w-6 place-items-center rounded-full border font-mono text-[.7rem] font-bold',
                  i === step ? 'border-accent bg-accent/12' : i < step ? 'border-good bg-good/12' : 'border-line')}>
                  {i < step ? <IcCheck size={12} /> : i + 1}
                </span>
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < 2 && <div className={cx('h-px flex-1', i < step ? 'bg-good' : 'bg-line')} />}
            </React.Fragment>
          ))}
        </div>

        <div className="scroll-thin max-h-[62vh] overflow-y-auto px-5 py-5">
          {step === 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('co_gov')}>
                <Select value={addr.gov} onChange={e => { upd('gov', e.target.value); upd('area', ''); }}>
                  {GOVERNORATES.map(g => <option key={g.id} value={g.id}>{app.li === 1 ? g.ar : app.li === 2 ? g.fr : g.en}</option>)}
                </Select>
              </Field>
              <Field label={t('co_area')} error={err.area ? t('co_required') : null}>
                <Select value={addr.area} onChange={e => upd('area', e.target.value)}
                  className={err.area ? 'border-bad' : ''}>
                  <option value="">—</option>
                  {gov.areas.map(a => {
                    const [en, ar] = a.split('|');
                    return <option key={en} value={en}>{app.li === 1 ? ar : en}</option>;
                  })}
                </Select>
              </Field>
              <div className="grid grid-cols-3 gap-3 sm:col-span-2">
                {[['block', 'co_block'], ['street', 'co_street'], ['ave', 'co_ave']].map(([k, key]) => (
                  <Field key={k} label={t(key) + (k === 'ave' ? ' · ' + t('co_optional') : '')} error={err[k] ? t('co_required') : null}>
                    <Input value={addr[k]} dir="ltr" onChange={e => upd(k, e.target.value)}
                      className={cx('font-mono', err[k] && 'border-bad')} placeholder={k === 'block' ? '4' : k === 'street' ? '12' : '3'} />
                  </Field>
                ))}
              </div>
              <Field label={t('co_house')} error={err.house ? t('co_required') : null}>
                <Input value={addr.house} onChange={e => upd('house', e.target.value)}
                  className={err.house ? 'border-bad' : ''} placeholder="House 27" />
              </Field>
              <Field label={t('co_floor') + ' · ' + t('co_optional')}>
                <Input value={addr.floor} onChange={e => upd('floor', e.target.value)} placeholder="Floor 3, Apt 12" />
              </Field>
              <Field label={t('co_phone')} error={err.phone || null}>
                <div className="flex gap-2">
                  <span className="grid h-11 shrink-0 place-items-center rounded-xl border border-line bg-raised px-3 font-mono text-[.85rem] text-muted">+965</span>
                  <input value={addr.phone} dir="ltr" inputMode="tel" onChange={e => upd('phone', e.target.value.replace(/[^\d\s]/g, ''))}
                    placeholder="5551 2345" className={cx(inputCls, 'font-mono', err.phone && 'border-bad')} />
                </div>
              </Field>
              <Field label={t('co_pick_map')} className="justify-end">
                <Btn type="button" variant={addr.pin ? 'outline' : 'primary'} className="w-full" onClick={() => setMapOpen(true)}>
                  <IcPin size={15} />{addr.pin ? t('co_pinned') + ' · ' + addr.pin.x + ', ' + addr.pin.y : t('co_pick_map')}
                </Btn>
              </Field>
              <Field label={t('co_notes')} className="sm:col-span-2">
                <textarea value={addr.notes} onChange={e => upd('notes', e.target.value)} rows="2"
                  placeholder={t('co_notes_ph')}
                  className="w-full rounded-xl border border-line bg-raised p-3 text-[.88rem] placeholder:text-faint/70 focus:border-accent" />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-3">
              {[
                ['knet', t('co_knet'), t('co_knet_sub'), <IcKnet size={36} />],
                ['apple', t('co_apple'), t('co_apple_sub'), <IcApple size={20} />],
                ['card', t('co_card'), t('co_card_sub'), <IcCard size={20} />]
              ].map(([id, title, sub, icon]) => (
                <button key={id} type="button" onClick={() => setMethod(id)}
                  className={cx('flex items-center gap-3.5 rounded-2xl border p-4 text-start transition',
                    method === id ? 'border-accent bg-accent/[.07]' : 'border-line hover:border-accent/50')}>
                  <span className="grid h-11 w-14 shrink-0 place-items-center rounded-xl border border-line bg-raised">{icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[.95rem] font-semibold">{title}</span>
                    <span className="block text-[.78rem] text-muted">{sub}</span>
                  </span>
                  <span className={cx('grid h-5 w-5 shrink-0 place-items-center rounded-full border-2',
                    method === id ? 'border-accent' : 'border-line')}>
                    {method === id && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
                  </span>
                </button>
              ))}

              {/* No card fields. Card details belong on the payment provider's
                  own page, never on ours. */}
              <p className="mt-1 flex items-center gap-1.5 text-[.75rem] text-faint"><IcShield size={13} />{t('co_secure')}</p>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4">
              <div className="rounded-2xl border border-line">
                <div className="border-b border-line px-4 py-2.5 eyebrow text-faint">{t('co_summary')}</div>
                <div className="divide-y divide-line">
                  {app.cart.map(line => {
                    const p = app.parts.find(x => x.id === line.id);
                    if (!p) return null;
                    return (
                      <div key={line.id} className="flex items-center gap-3 px-4 py-2.5">
                        <div className="h-10 w-12 shrink-0 overflow-hidden rounded-lg border border-line"><PartArt art={p.art} photo={p.photo} /></div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[.85rem] font-medium">{app.nameOf(p)}</div>
                          <div className="num font-mono text-[.7rem] text-faint">× {line.qty}</div>
                        </div>
                        <div className="num font-mono text-[.85rem] font-semibold">{money(p.price * line.qty, app.cur, app.li)}</div>
                      </div>
                    );
                  })}
                </div>
                <dl className="space-y-1.5 border-t border-line px-4 py-3 text-[.84rem]">
                  <div className="flex justify-between"><dt className="text-muted">{t('cart_sub')}</dt><dd className="num font-mono">{money(subtotal, app.cur, app.li)}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">{t('cart_ship')}</dt>
                    <dd className="num font-mono">{ship === 0 ? <span className="text-good">{t('cart_free')}</span> : money(ship, app.cur, app.li)}</dd></div>
                  {discount > 0 && <div className="flex justify-between text-good"><dt>{t('cart_discount')}</dt><dd className="num font-mono">−{money(discount, app.cur, app.li)}</dd></div>}
                  <div className="flex items-baseline justify-between border-t border-line pt-2">
                    <dt className="font-semibold">{t('cart_total')}</dt>
                    <dd className="num font-mono text-[1.1rem] font-bold text-ignite">{money(total, app.cur, app.li)}</dd>
                  </div>
                </dl>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-line p-4">
                  <div className="eyebrow text-faint">{t('co_deliver_to')}</div>
                  <p className="mt-2 text-[.85rem] leading-relaxed">
                    {addr.house}{addr.floor ? ', ' + addr.floor : ''}<br />
                    {t('co_block')} {addr.block} · {t('co_street')} {addr.street}{addr.ave ? ' · ' + t('co_ave') + ' ' + addr.ave : ''}<br />
                    {addr.area}, {app.li === 1 ? gov.ar : gov.en}<br />
                    <span dir="ltr" className="font-mono text-[.8rem] text-muted">+965 {addr.phone}</span>
                  </p>
                </div>
                <div className="rounded-2xl border border-line p-4">
                  <div className="eyebrow text-faint">{t('co_pay_method')}</div>
                  <div className="mt-2 flex items-center gap-2.5">
                    {method === 'knet' ? <IcKnet size={40} /> : method === 'apple' ? <IcApple size={20} /> : <IcCard size={20} />}
                    <div className="text-[.88rem] font-medium">
                      {method === 'knet' ? t('co_knet') : method === 'apple' ? t('co_apple') : t('co_card')}
                      
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-line px-5 py-4">
          {step > 0 && <Btn variant="ghost" onClick={() => setStep(s => s - 1)}><IcChevL size={15} />{t('co_back')}</Btn>}
          <div className="ms-auto flex items-center gap-2">
            {step < 2 ? (
              <Btn variant="primary" size="lg" onClick={() => { if (step === 0 && !validate()) return; setStep(s => s + 1); }}>
                {t('co_next')}<IcChevR size={15} />
              </Btn>
            ) : (
              <Btn variant="primary" size="lg" onClick={place} disabled={busy}>
                {busy ? <IcSpinner size={16} className="animate-spin" /> : <IcShield size={16} />}
                {busy ? t('co_placing') : t('co_place')}
              </Btn>
            )}
          </div>
        </div>
      </Modal>

      <MapPicker open={mapOpen} onClose={() => setMapOpen(false)} value={addr.pin}
        onPick={(pin, near) => { upd('pin', pin); if (near) upd('gov', near.id); }} />
    </>
  );
}

/* ============================================================================
   18 · ORDERS + TIMELINE
   ========================================================================== */

const STAGES = [
  { key: 'ord_stage1', sub: 'ord_stage1s', rgb: 'var(--ignite-rgb)', Icon: IcCheck },
  { key: 'ord_stage2', sub: 'ord_stage2s', rgb: 'var(--accent-rgb)', Icon: IcPackage },
  { key: 'ord_stage3', sub: 'ord_stage3s', rgb: 'var(--violet-rgb)', Icon: IcTruck },
  { key: 'ord_stage4', sub: 'ord_stage4s', rgb: 'var(--good-rgb)', Icon: IcCheck2 }
];

function Timeline({ order }) {
  const app = useApp();
  const t = useT();
  return (
    <ol className="relative grid gap-0 md:grid-cols-4">
      {STAGES.map((s, i) => {
        const done = i < order.stage;
        const now = i === order.stage;
        const on = done || now;
        const Si = s.Icon;
        return (
          <li key={s.key} className="relative flex gap-3 pb-5 md:block md:pb-0 md:pe-4">
            <div className="relative flex flex-col items-center md:h-9 md:w-full md:flex-row">
              <span className={cx('z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 transition-all',
                now && 'pulse-ring')}
                style={{
                  borderColor: on ? 'rgb(' + s.rgb + ')' : 'rgb(var(--line-rgb))',
                  background: on ? 'rgb(' + s.rgb + ' / .16)' : 'rgb(var(--raised-rgb))',
                  color: on ? 'rgb(' + s.rgb + ')' : 'rgb(var(--faint-rgb))'
                }}>
                <Si size={16} />
              </span>
              <span className={cx('absolute start-[17px] top-9 h-full w-[2px] md:start-9 md:top-[17px] md:h-[2px] md:w-[calc(100%-2.25rem)]',
                i === 3 && 'hidden')}
                style={{ background: done ? 'rgb(' + s.rgb + ')' : 'rgb(var(--line-rgb))' }} />
            </div>
            <div className="min-w-0 pb-1 md:mt-3">
              <div className={cx('text-[.86rem] font-semibold leading-tight', on ? '' : 'text-faint')}>{t(s.key)}</div>
              <div className="mt-1 text-[.76rem] leading-snug text-muted">{t(s.sub)}</div>
              {on && order.stamps[i] && (
                <div className="num mt-1 font-mono text-[.7rem] text-faint">
                  {dateFmt(order.stamps[i], app.li)} · {timeFmt(order.stamps[i], app.li)}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Orders() {
  const app = useApp();
  const t = useT();
  if (app.orders.length === 0) {
    return (
      <section className="mx-auto max-w-[1400px] px-4 py-20 text-center sm:px-6">
        <IcTruck size={30} className="mx-auto text-faint" />
        <h2 className="mt-3 font-display text-[1.3rem] font-semibold">{t('ord_empty')}</h2>
        <p className="mt-1 text-[.88rem] text-muted">{t('ord_empty_hint')}</p>
        <Btn variant="primary" className="mt-5" onClick={() => app.setView('shop')}><IcBox size={15} />{t('nav_shop')}</Btn>
      </section>
    );
  }
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <div className="eyebrow text-accent">{t('nav_orders')}</div>
      <h2 className="mt-1.5 font-display text-[1.6rem] font-semibold leading-tight">{t('ord_title')}</h2>
      <p className="mt-1 text-[.9rem] text-muted">{t('ord_sub')}</p>

      <div className="mt-6 grid gap-5">
        {app.orders.map(o => {
          const gov = GOVERNORATES.find(g => g.id === o.addr.gov) || GOVERNORATES[0];
          const stage = STAGES[o.stage];
          return (
            <article key={o.id} className="overflow-hidden rounded-2xl border border-line bg-surface">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line px-5 py-4">
                <div>
                  <div className="eyebrow text-faint">{t('ord_no')}</div>
                  <div className="num font-mono text-[1rem] font-bold" dir="ltr">{o.id}</div>
                </div>
                <div className="hidden sm:block">
                  <div className="eyebrow text-faint">{t('ord_placed')}</div>
                  <div className="num text-[.85rem]">{dateFmt(o.placedAt, app.li)}</div>
                </div>
                <div>
                  <div className="eyebrow text-faint">{t('cart_total')}</div>
                  <div className="num font-mono text-[.95rem] font-bold text-ignite">{money(o.totalKwd, app.cur, app.li)}</div>
                </div>
                <span className="ms-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[.78rem] font-semibold"
                  style={{ background: 'rgb(' + stage.rgb + ' / .14)', color: 'rgb(' + stage.rgb + ')' }}>
                  <span className="h-2 w-2 rounded-full" style={{ background: 'rgb(' + stage.rgb + ')' }} />
                  {t(stage.key)}
                </span>
              </div>

              <div className="px-5 py-5">
                <Timeline order={o} />
              </div>

              <div className="grid gap-4 border-t border-line px-5 py-4 md:grid-cols-[1fr_auto]">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <div className="eyebrow text-faint">{t('ord_items')}</div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      {o.items.slice(0, 4).map((it, i) => (
                        <div key={i} className="h-9 w-11 overflow-hidden rounded-lg border border-line" title={app.nameOf(it)}>
                          <PartArt art={it.art} photo={it.photo} />
                        </div>
                      ))}
                      {o.items.length > 4 && <span className="num font-mono text-[.75rem] text-faint">+{o.items.length - 4}</span>}
                    </div>
                  </div>
                  <div>
                    <div className="eyebrow text-faint">{t('ord_paid')}</div>
                    <div className="mt-1.5 flex items-center gap-2 text-[.84rem]">
                      {o.method === 'knet' ? <IcKnet size={32} /> : o.method === 'apple' ? <IcApple size={16} /> : <IcCard size={16} />}
                      <span>{o.method === 'knet' ? t('co_knet') : o.method === 'apple' ? t('co_apple') : t('co_card')}</span>
                      {o.card && <span className="font-mono text-[.74rem] text-faint">•••• {o.card}</span>}
                    </div>
                  </div>
                  <div>
                    <div className="eyebrow text-faint">{t('ord_eta')}</div>
                    <div className="num mt-1.5 text-[.84rem]">{dateFmt(o.eta, app.li)}</div>
                    <div className="mt-0.5 text-[.76rem] text-muted">{o.addr.area}, {app.li === 1 ? gov.ar : gov.en}</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-start gap-2 md:justify-end">
                  <Btn size="sm" variant="primary" onClick={() => app.setInvoice(o.id)}><IcFile size={14} />{t('ord_invoice')}</Btn>
                  {app.user && app.user.staff && (
                    <label className="flex items-center gap-1.5 rounded-lg border border-violet/50 bg-violet/10 px-2 py-1">
                      <span className="eyebrow text-violet">{t('ord_staff')}</span>
                      <span className="sr-only">{t('ord_stage_set')}</span>
                      <select value={o.stage} aria-label={t('ord_stage_set')}
                        onChange={e => app.setOrderStage(o.rowId, parseInt(e.target.value, 10))}
                        className="h-7 rounded-md border border-line bg-surface px-1.5 text-[.78rem]">
                        {STAGES.map((s, i) => <option key={s.key} value={i}>{t(s.key)}</option>)}
                      </select>
                    </label>
                  )}
                  <Btn size="sm" variant="ghost" onClick={() => app.setSupport(true)}><IcChat size={14} />{t('ord_support')}</Btn>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================================
   19 · INVOICE  (portalled to <body> so print CSS can isolate it)
   ========================================================================== */

function Invoice() {
  const app = useApp();
  const t = useT();
  const o = app.orders.find(x => x.id === app.invoiceId);
  useLockBody(!!o);
  useEsc(!!o, () => app.setInvoice(null));
  if (!o) return null;
  const gov = GOVERNORATES.find(g => g.id === o.addr.gov) || GOVERNORATES[0];
  const cur = app.cur, li = app.li;

  const node = (
    <div id="invoice-print" className="fixed inset-0 z-[70] overflow-y-auto bg-[#04060a]/80 p-0 backdrop-blur-sm sm:p-6">
      <div className="mx-auto max-w-3xl">
        <div className="no-print flex items-center justify-between gap-3 px-4 py-3 sm:px-0">
          <div className="flex items-center gap-2 text-white">
            <IcFile size={17} />
            <span className="font-display text-[.95rem] font-semibold">{t('inv_title')} · <span className="font-mono" dir="ltr">{o.id}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Btn size="sm" variant="primary" onClick={() => window.print()}><IcPrint size={14} />{t('inv_print')}</Btn>
            <button onClick={() => app.setInvoice(null)} aria-label={t('close')}
              className="grid h-8 w-8 place-items-center rounded-lg border border-white/20 text-white/80 hover:text-white"><IcX size={15} /></button>
          </div>
        </div>

        <div id="invoice-sheet" className="bg-white p-7 text-[#0b1220] shadow-lift sm:rounded-2xl sm:p-10" dir={app.dir}>
          <div className="flex items-start justify-between gap-6 border-b-2 border-[#0b1220] pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#0b1220] text-white">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                    <path d="M3 14.5h18" /><path d="M6 14.5V11l2.4-4.6A2 2 0 0 1 10.2 5.3h3.6a2 2 0 0 1 1.8 1.1L18 11v3.5" />
                    <circle cx="7.5" cy="17.5" r="2" /><circle cx="16.5" cy="17.5" r="2" />
                  </svg>
                </div>
                <div>
                  <div className="font-display text-[1.15rem] font-bold leading-none">{t('brand')}</div>
                  <div className="mt-1 text-[.7rem] uppercase tracking-[.12em] text-[#5b6577]">{t('tagline')}</div>
                </div>
              </div>
              <p className="mt-3 text-[.75rem] leading-relaxed text-[#5b6577]">{t('inv_lic')}</p>
            </div>
            <div className="text-end">
              <div className="font-display text-[1.5rem] font-bold uppercase leading-none tracking-tight">{t('inv_title')}</div>
              <div className="mt-2 text-[.78rem]">
                <div><span className="text-[#5b6577]">{t('inv_no')} </span><span className="font-mono font-semibold" dir="ltr">{o.id}</span></div>
                <div><span className="text-[#5b6577]">{t('inv_date')} </span><span className="num">{dateFmt(o.placedAt, li)}</span></div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 py-6 sm:grid-cols-2">
            <div>
              <div className="eyebrow text-[#5b6577]">{t('inv_billed')}</div>
              <p className="mt-2 text-[.85rem] leading-relaxed">
                <span className="font-semibold">{o.customer}</span><br />
                {o.addr.house}{o.addr.floor ? ', ' + o.addr.floor : ''}<br />
                {t('co_block')} {o.addr.block} · {t('co_street')} {o.addr.street}{o.addr.ave ? ' · ' + t('co_ave') + ' ' + o.addr.ave : ''}<br />
                {o.addr.area}, {li === 1 ? gov.ar : gov.en}, {li === 1 ? 'الكويت' : 'Kuwait'}<br />
                <span dir="ltr" className="font-mono">+965 {o.addr.phone}</span>
              </p>
            </div>
            <div className="sm:text-end">
              <div className="eyebrow text-[#5b6577]">{t('inv_paid_via')}</div>
              <p className="mt-2 text-[.85rem]">
                {o.method === 'knet' ? t('co_knet') : o.method === 'apple' ? t('co_apple') : t('co_card')}
                {o.card && <span className="ms-1 font-mono">•••• {o.card}</span>}
              </p>
              <div className="mt-3 eyebrow text-[#5b6577]">{t('ord_eta')}</div>
              <p className="num mt-1 text-[.85rem]">{dateFmt(o.eta, li)}</p>
            </div>
          </div>

          <table className="w-full border-collapse text-[.85rem]">
            <thead>
              <tr className="border-y border-[#0b1220]/20 text-[.7rem] uppercase tracking-wider text-[#5b6577]">
                <th className="py-2.5 text-start font-semibold">{t('inv_desc')}</th>
                <th className="py-2.5 text-center font-semibold">{t('inv_qty')}</th>
                <th className="py-2.5 text-end font-semibold">{t('inv_unit')}</th>
                <th className="py-2.5 text-end font-semibold">{t('inv_amount')}</th>
              </tr>
            </thead>
            <tbody>
              {o.items.map((it, i) => (
                <tr key={i} className="border-b border-[#0b1220]/10">
                  <td className="py-3 pe-3">
                    <div className="font-medium">{app.nameOf(it)}</div>
                    <div className="font-mono text-[.7rem] text-[#5b6577]" dir="ltr">{t('card_oem')} {it.oem || '—'}</div>
                  </td>
                  <td className="num py-3 text-center font-mono">{it.qty}</td>
                  <td className="num py-3 text-end font-mono">{money(it.price, cur, li, false)}</td>
                  <td className="num py-3 text-end font-mono font-semibold">{money(it.price * it.qty, cur, li, false)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-5 flex justify-end">
            <dl className="w-full max-w-xs space-y-1.5 text-[.85rem]">
              <div className="flex justify-between"><dt className="text-[#5b6577]">{t('cart_sub')}</dt><dd className="num font-mono">{money(o.subtotalKwd, cur, li, false)}</dd></div>
              <div className="flex justify-between"><dt className="text-[#5b6577]">{t('cart_ship')}</dt><dd className="num font-mono">{money(o.shipKwd, cur, li, false)}</dd></div>
              {o.discountKwd > 0 && <div className="flex justify-between"><dt className="text-[#5b6577]">{t('cart_discount')} · {o.promo}</dt><dd className="num font-mono">−{money(o.discountKwd, cur, li, false)}</dd></div>}
              <div className="flex items-baseline justify-between border-t-2 border-[#0b1220] pt-2">
                <dt className="font-display font-bold">{t('cart_total')} · {cur.code}</dt>
                <dd className="num font-mono text-[1.15rem] font-bold">{money(o.totalKwd, cur, li, false)}</dd>
              </div>
            </dl>
          </div>

          <p className="mt-8 border-t border-[#0b1220]/15 pt-4 text-[.75rem] leading-relaxed text-[#5b6577]">
            {t('inv_note')}
          </p>
          <p className="mt-2 font-display text-[.9rem] font-semibold">{t('inv_thanks')}</p>
        </div>
        <div className="h-6" />
      </div>
    </div>
  );
  return ReactDOM.createPortal(node, document.body);
}

/* ============================================================================
   20 · SUPPORT
   ========================================================================== */

const WA_NUMBER = '96598591088'; /* your own number, country code, no + */

function Support() {
  const app = useApp();
  const t = useT();
  const [msgs, setMsgs] = useState(() => [{ me: false, text: STR.sup_greet[app.li], at: Date.now() }]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const listRef = useRef(null);
  const open = app.support;

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [msgs, typing, open]);

  const push = (me, str) => setMsgs(m => m.concat([{ me, text: str, at: Date.now() }]));

  const send = (str, answer) => {
    const body = (str || text).trim();
    if (!body) return;
    push(true, body);
    setText('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      push(false, answer || t('sup_ack'));
    }, 900);
  };

  const quick = [['sup_q1', 'sup_a1'], ['sup_q2', 'sup_a2'], ['sup_q3', 'sup_a3']];

  return (
    <>
      <button onClick={() => app.setSupport(!open)} aria-label={t('sup_help')}
        className="fixed bottom-5 end-5 z-40 flex h-14 items-center gap-2.5 rounded-full border border-accent/40 bg-surface px-4 shadow-lift transition hover:border-accent glow-accent">
        {open ? <IcX size={20} className="text-accent" /> : <IcChat size={20} className="text-accent" />}
        <span className="hidden font-display text-[.88rem] font-semibold sm:inline">{t('sup_help')}</span>
      </button>

      {open && (
        <div className="fixed bottom-24 end-5 z-40 flex max-h-[70vh] w-[min(23rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-lift"
          style={{ animation: 'riseIn .28s cubic-bezier(.22,1,.36,1) both' }}>
          <div className="flex items-center gap-3 border-b border-line bg-raised px-4 py-3">
            <span className="relative grid h-9 w-9 place-items-center rounded-full bg-accent/15 font-display text-[.8rem] font-bold text-accent">
              F<span className="absolute -bottom-0.5 -end-0.5 h-3 w-3 rounded-full border-2 border-raised bg-good" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate font-display text-[.9rem] font-semibold leading-none">{t('sup_agent')}</div>
              <div className="mt-1 truncate text-[.7rem] text-faint">{t('sup_sub')}</div>
            </div>
            <button onClick={() => app.setSupport(false)} aria-label={t('close')} className="text-faint hover:text-ink"><IcX size={16} /></button>
          </div>

          <div ref={listRef} className="scroll-thin flex-1 space-y-2.5 overflow-y-auto p-4">
            {msgs.map((m, i) => (
              <div key={i} className={cx('flex', m.me ? 'justify-end' : 'justify-start')}>
                <div className={cx('max-w-[85%] rounded-2xl px-3.5 py-2 text-[.83rem] leading-snug',
                  m.me ? 'rounded-ee-md bg-accent text-ground' : 'rounded-es-md bg-raised')}>
                  {m.text}
                  <div className={cx('num mt-1 font-mono text-[.62rem]', m.me ? 'text-ground/70' : 'text-faint')}>
                    {timeFmt(m.at, app.li)}
                  </div>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-2xl rounded-es-md bg-raised px-3.5 py-3">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="h-1.5 w-1.5 rounded-full bg-faint"
                      style={{ animation: 'pulseRing 1s ease-in-out infinite', animationDelay: i * 0.15 + 's' }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-line p-3">
            <div className="no-scrollbar mb-2.5 flex gap-1.5 overflow-x-auto">
              {quick.map(([q, a]) => (
                <button key={q} onClick={() => send(t(q), t(a))}
                  className="shrink-0 rounded-full border border-line px-3 py-1.5 text-[.75rem] text-muted transition hover:border-accent hover:text-accent">
                  {t(q)}
                </button>
              ))}
            </div>
            <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2">
              <input value={text} onChange={e => setText(e.target.value)} placeholder={t('sup_ph')}
                className="h-10 min-w-0 flex-1 rounded-xl border border-line bg-raised px-3 text-[.85rem] focus:border-accent" />
              <Btn type="submit" variant="primary" className="w-10 shrink-0 px-0" aria-label={t('sup_send')}><IcSend size={15} /></Btn>
            </form>
            {WA_NUMBER && <a href={'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent('Carbon Souq — ')}
              target="_blank" rel="noopener noreferrer"
              className="mt-2.5 flex h-10 items-center justify-center gap-2 rounded-xl bg-[#25D366] text-[.85rem] font-semibold text-[#062b13] transition hover:brightness-105">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.02c-.24.68-1.4 1.3-1.93 1.35-.53.06-1.03.08-1.77-.11-.44-.11-1.01-.3-1.75-.62-3.08-1.33-5.09-4.43-5.25-4.64-.15-.2-1.24-1.65-1.24-3.15S6.68 6.9 6.95 6.6c.27-.3.6-.37.8-.37h.57c.18 0 .43-.07.67.51.24.58.83 2.02.9 2.17.07.14.12.31.02.51-.1.2-.37.6-.55.79-.18.19-.28.31-.13.6.15.29.66 1.1 1.42 1.78.98.87 1.72 1.14 1.98 1.27.26.13.42.11.57-.07.15-.18.65-.76.82-1.02.17-.26.35-.22.58-.13.23.09 1.48.7 1.74.82.26.13.43.19.5.3.06.11.06.65-.18 1.33Z" />
              </svg>
              {t('sup_wa')}
            </a>}
          </div>
        </div>
      )}
    </>
  );
}

function Footer() {
  const app = useApp();
  const t = useT();
  return (
    <footer className="carbon-weave relative border-t border-line bg-ground px-4 py-10 sm:px-6">
      <div className="relative mx-auto flex max-w-[1400px] flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-3 text-[.8rem] leading-relaxed text-faint">{t('foot_note')}</p>
        </div>
        <div className="flex flex-wrap gap-x-10 gap-y-4 text-[.82rem]">
          <div>
            <div className="eyebrow text-faint">{t('foot_ship')}</div>
            <ul className="mt-2 space-y-1 text-muted">
              {GOVERNORATES.map(g => <li key={g.id}>{app.li === 1 ? g.ar : app.li === 2 ? g.fr : g.en}</li>)}
            </ul>
          </div>
          <div>
            <div className="eyebrow text-faint">{t('co_pay_method')}</div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <IcKnet size={44} />
              <span className="flex h-7 items-center gap-1.5 rounded-md border border-line px-2 text-[.72rem]"><IcApple size={13} />Pay</span>
              <span className="flex h-7 items-center gap-1.5 rounded-md border border-line px-2 text-[.72rem]"><IcCard size={13} />Visa · MC</span>
            </div>
            <div className="mt-4 eyebrow text-faint">{t('cur_label')}</div>
            <div className="mt-2 font-mono text-[.75rem] text-muted">
              {CURRENCIES.map(c => c.code).join(' · ')}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


/* ============================================================================
   22 · APP ROOT
   ========================================================================== */

function App() {
  const [lang, setLangRaw] = useState(() => store.get('lang', 'en'));
  const [curCode, setCurCode] = useState(() => store.get('cur', 'KWD'));
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);
  const [offline, setOffline] = useState(null);

  const [parts, setParts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [promo, setPromoRaw] = useState(null);
  const [promoRow, setPromoRow] = useState(null);

  const [view, setView] = useState('shop');
  const [q, setQ] = useState('');
  const [brand, setBrand] = useState('all');
  const [prio, setPrio] = useState('all');
  const [sort, setSort] = useState('new');
  const [tab, setTab] = useState('open');
  const [selectedId, setSelected] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [auth, setAuth] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formPart, setFormPart] = useState(null);
  const [invoiceId, setInvoice] = useState(null);
  const [support, setSupport] = useState(false);
  const [placedId, setPlacedId] = useState(null);
  const [toasts, setToasts] = useState([]);

  const langDef = LANGS.find(l => l.code === lang) || LANGS[0];
  const li = langDef.i;
  const dir = langDef.dir;
  const cur = CURRENCIES.find(c => c.code === curCode) || CURRENCIES[0];
  const uid = user ? user.id : null;

  const toast = useCallback(msg => {
    const id = uid2();
    setToasts(t => t.concat([{ id, msg }]));
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2400);
  }, []);

  /* ---- session: resolve BEFORE first paint, then track changes ---- */
  useEffect(() => {
    let alive = true;

    sb.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setBooting(false);
    });

    const { data: { subscription } } = sb.auth.onAuthStateChange((event, s) => {
      setSession(s ?? null);
      setUser(s?.user ?? null);
      setBooting(false);
      // Never await a supabase call inside this callback — it deadlocks the
      // client. Any follow-up work is done by the effects below instead.
    });

    return () => { alive = false; subscription.unsubscribe(); };
  }, []);

  /* ---- reference data: available signed out ---- */
  useEffect(() => {
    DB.reviews().then(setReviews).catch(() => {});
  }, []);

  /* ---- load everything that belongs to the signed-in user ---- */
  const reload = useCallback(async () => {
    try {
      if (!uid) {
        setParts(await DB.catalog());
        setCart([]); setOrders([]);
        setOffline(null);
        return;
      }
      const [p, c, o, prof] = await Promise.all([DB.parts(), DB.cart(), DB.orders(), DB.profile()]);
      setParts(p); setCart(c); setOrders(o);
      if (prof) {
        if (prof.locale && prof.locale !== lang) setLangRaw(prof.locale);
        if (prof.currency) setCurCode(prof.currency);
        setUser(u => u && ({ ...u, profile: prof }));
      }
      setOffline(null);
    } catch (e) {
      setOffline(e.message || 'Could not reach the database.');
    }
  }, [uid]);

  useEffect(() => { reload(); }, [reload]);

  /* ---- garage ---- */
  const [garage, setGarage] = useState([]);
  const reloadGarage = useCallback(async () => {
    if (!uid) return setGarage([]);
    try { setGarage(await DB.vehicles()); } catch (e) { /* surfaced by reload() */ }
  }, [uid]);
  useEffect(() => { reloadGarage(); }, [reloadGarage]);

  /* ---- preferences ---- */
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    store.set('lang', lang);
    if (uid) DB.saveProfile(uid, { locale: lang }).then(() => {}, () => {});
  }, [lang, dir, uid]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', dark);
    store.set('theme', dark ? 'dark' : 'light');
    if (uid) DB.saveProfile(uid, { theme: dark ? 'dark' : 'light' }).then(() => {}, () => {});
  }, [dark, uid]);

  useEffect(() => {
    store.set('cur', curCode);
    if (uid) DB.saveProfile(uid, { currency: curCode }).then(() => {}, () => {});
  }, [curCode, uid]);

  useEffect(() => {
    const boot = document.getElementById('boot');
    if (boot && !booting) {
      boot.style.transition = 'opacity .35s'; boot.style.opacity = '0';
      setTimeout(() => boot.remove(), 400);
    }
  }, [booting]);

  const nameOf = useCallback(p => {
    if (!p) return '';
    return Array.isArray(p.name) ? (p.name[li] || p.name[0]) : (p.name || '');
  }, [li]);
  const specOf = useCallback(p => {
    if (!p || !p.spec) return '';
    return Array.isArray(p.spec) ? (p.spec[li] || p.spec[0]) : p.spec;
  }, [li]);

  const visibleParts = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = parts.filter(p => {
      if ((tab === 'bought') !== !!p.bought) return false;
      if (brand !== 'all' && p.brand !== brand) return false;
      if (prio !== 'all' && p.prio !== prio) return false;
      if (!needle) return true;
      const hay = (Array.isArray(p.name) ? p.name.join(' ') : p.name) + ' ' + (p.oem || '');
      return hay.toLowerCase().includes(needle);
    }).slice();
    if (sort === 'hi') list.sort((a, b) => b.price - a.price);
    else if (sort === 'lo') list.sort((a, b) => a.price - b.price);
    else if (sort === 'prio') list.sort((a, b) => PRIO[a.prio].rank - PRIO[b.prio].rank || b.price - a.price);
    else list.sort((a, b) => (b.added || 0) - (a.added || 0));
    return list;
  }, [parts, q, brand, prio, sort, tab]);

  const totals = useMemo(() => {
    const subtotal = cart.reduce((s, l) => {
      const p = parts.find(x => x.id === l.id);
      return p ? s + p.price * l.qty : s;
    }, 0);
    const rate = promoRow ? Number(promoRow.discount_rate) : 0;
    const discount = +(subtotal * rate).toFixed(3);
    const freeShip = subtotal === 0 || subtotal >= FREE_SHIP_OVER_KWD || (promoRow && promoRow.free_shipping);
    const ship = freeShip ? 0 : SHIP_FLAT_KWD;
    return {
      subtotal, discount, ship,
      total: +(subtotal - discount + ship).toFixed(3),
      count: cart.reduce((s, l) => s + l.qty, 0)
    };
  }, [cart, parts, promoRow]);

  /* Actions that need an account bounce to the auth modal instead of failing. */
  const needsAuth = () => {
    if (uid) return false;
    setAuth('signin');
    return true;
  };

  const api = {
    lang, li, dir, cur, dark, view, q, brand, prio, sort, tab,
    parts, visibleParts, cart, promo, orders, reviews, totals, offline, booting,
    user: user ? {
      name: (user.profile && user.profile.full_name) || user.user_metadata?.full_name || (user.email || '').split('@')[0],
      email: user.email,
      initials: ((user.profile && user.profile.full_name) || user.email || '?')
        .split(/[\s@.]+/).map(s => s[0]).slice(0, 2).join('').toUpperCase(),
      staff: !!(user.profile && user.profile.is_staff),
      garage
    } : null,
    selectedId, cartOpen, checkoutOpen, auth, formOpen, formPart, invoiceId, support, placedId,
    nameOf, specOf, toast,
    setLang: setLangRaw,
    setCur: setCurCode,
    toggleTheme: () => setDark(d => !d),
    setView: v => { setView(v); window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }); },
    setQ, setBrand, setPrio, setSort, setTab, setSelected, setCartOpen, setAuth, setInvoice, setSupport,
    clearFilters: () => { setQ(''); setBrand('all'); setPrio('all'); setSort('new'); },

    async setPromo(code) {
      if (!code) { setPromoRaw(null); setPromoRow(null); return true; }
      const row = await DB.promo(code);
      if (!row) return false;
      setPromoRaw(row.code); setPromoRow(row);
      return true;
    },

    signOut: async () => {
      await sb.auth.signOut();
      setView('shop');
      toast(STR.toast_signout[li]);
    },

    addVehicle: async v => {
      if (needsAuth()) return;
      const { error } = await DB.addVehicle(uid, v, garage.length === 0);
      if (error) return toast(STR.err_write[li]);
      reloadGarage();
      toast(STR.toast_vehicle[li]);
    },
    removeVehicle: async id => { await DB.removeVehicle(id); reloadGarage(); },
    setPrimaryVehicle: async id => { await DB.setPrimaryVehicle(uid, id); reloadGarage(); },

    editPart: p => { if (needsAuth()) return; setFormPart(p); setFormOpen(true); },
    closeForm: () => { setFormOpen(false); setFormPart(null); },
    savePart: async data => {
      if (needsAuth()) return;
      try {
        if (formPart) {
          const row = await DB.updatePart(formPart.id, toDbPart(data));
          setParts(list => list.map(p => p.id === row.id ? row : p));
        } else {
          const row = await DB.addPart(uid, data);
          setParts(list => [row].concat(list));
          setTab('open');
        }
        setFormOpen(false); setFormPart(null);
        toast(STR.toast_saved[li]);
      } catch (e) { toast(STR.err_write[li]); }
    },
    removePart: async id => {
      const { error } = await DB.deletePart(id);
      if (error) return toast(STR.err_write[li]);
      setParts(list => list.filter(p => p.id !== id));
      setCart(c => c.filter(l => l.id !== id));
      if (selectedId === id) setSelected(null);
      toast(STR.toast_deleted[li]);
    },
    togglePurchased: async id => {
      const p = parts.find(x => x.id === id);
      if (!p || needsAuth()) return;
      setParts(list => list.map(x => x.id === id ? { ...x, bought: !x.bought } : x)); // optimistic
      const { error } = await DB.updatePart(id, { bought: !p.bought }).catch(e => ({ error: e }));
      if (error) { setParts(list => list.map(x => x.id === id ? { ...x, bought: p.bought } : x)); return toast(STR.err_write[li]); }
      if (!p.bought) toast(STR.toast_bought[li]);
    },

    addToCart: async id => {
      if (needsAuth()) return;
      if (cart.some(l => l.id === id)) return;
      setCart(c => c.concat([{ id, qty: 1 }]));
      const { error } = await DB.addToCart(uid, id);
      if (error) { setCart(c => c.filter(l => l.id !== id)); return toast(STR.err_write[li]); }
      toast(STR.toast_added[li]);
    },
    setQty: async (id, qty) => {
      const before = cart;
      setCart(c => qty <= 0 ? c.filter(l => l.id !== id) : c.map(l => l.id === id ? { ...l, qty: Math.min(qty, 99) } : l));
      const { error } = await DB.setQty(uid, id, Math.min(qty, 99));
      if (error) { setCart(before); toast(STR.err_write[li]); }
    },

    startCheckout: () => { if (needsAuth()) return; setCartOpen(false); setCheckoutOpen(true); },
    closeCheckout: () => setCheckoutOpen(false),
    placeOrder: async ({ addr, method, card }) => {
      if (needsAuth()) return;
      try {
        /* No prices or totals are sent. The server reads the cart and the
           catalogue itself, so a tampered figure in the browser buys nothing. */
        const created = await DB.placeOrder(uid, {
          customer: (user.profile && user.profile.full_name) || user.email,
          promo, method, card_last4: card || null,
          address: addr
        });
        await DB.saveAddress(uid, addr).then(() => {}, () => {});
        await DB.clearCart(uid);
        setCart([]); setPromoRaw(null); setPromoRow(null);
        setCheckoutOpen(false);
        setOrders(await DB.orders());
        setParts(await DB.parts());
        setPlacedId(created.order_no);
      } catch (e) {
        toast(STR.err_write[li]);
      }
    },
    closePlaced: () => setPlacedId(null),

    /* Staff only. Customers have no rights on orders at all; the database
       rejects this call for them regardless of what the browser shows. */
    setOrderStage: async (rowId, stage) => {
      const { error } = await DB.setOrderStage(rowId, stage);
      if (error) return toast(STR.err_staff[li]);
      setOrders(await DB.orders());
      toast(STR.toast_stage[li]);
    }
  };

  const t = key => STR[key] ? (STR[key][li] || STR[key][0]) : key;

  return (
    <Ctx.Provider value={api}>
      <ArtDefs />
      <Header />

      {offline && (
        <div className="border-b border-bad/40 bg-bad/10 px-4 py-2 text-center text-[.82rem] text-bad">
          {t('err_db')} <span className="font-mono opacity-70">{offline}</span>
        </div>
      )}

      <main>
        {view === 'shop' && <><Stage3D /><Catalog /><Testimonials /></>}
        {view === 'wishlist' && <Catalog />}
        {view === 'garage' && <Garage />}
        {view === 'orders' && <Orders />}
      </main>
      <Footer />

      <CartPanel />
      <Checkout />
      <PartForm />
      <AuthModal />
      <Invoice />
      <Support />

      <Modal open={!!placedId} onClose={api.closePlaced} size="sm" label={t('co_done')}>
        <div className="px-6 py-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-good/15 text-good pulse-ring">
            <IcCheck2 size={26} />
          </div>
          <h2 className="mt-4 font-display text-[1.25rem] font-semibold">{t('co_done')}</h2>
          <p className="mt-1.5 text-[.87rem] text-muted">{t('co_done_sub')}</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-line px-3.5 py-2">
            <span className="eyebrow text-faint">{t('ord_no')}</span>
            <span className="num font-mono text-[.9rem] font-bold" dir="ltr">{placedId}</span>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <Btn variant="primary" size="lg" onClick={() => { api.closePlaced(); api.setView('orders'); }}>
              <IcTruck size={16} />{t('co_view')}
            </Btn>
            <Btn variant="ghost" onClick={() => { api.closePlaced(); api.setInvoice(placedId); }}>
              <IcFile size={15} />{t('ord_invoice')}
            </Btn>
          </div>
        </div>
      </Modal>

      <Toasts items={toasts} />
    </Ctx.Provider>
  );
}


export default App;
