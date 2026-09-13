import { createClient } from '@supabase/supabase-js';
import { LANGS, STR } from '../lib/i18n.js';
import { ANCHOR_LABEL, ART_LABEL, ART_PRESETS, BRANDS, CURRENCIES, FREE_SHIP_OVER_KWD, GOVERNORATES, PROMOS, SEED_PARTS, SHIP_FLAT_KWD } from '../lib/data.js';
import { C, IcApple, IcBox, IcCar, IcCard, IcCart, IcChat, IcCheck, IcCheck2, IcChevD, IcChevL, IcChevR, IcClock, IcCross, IcFile, IcFlame, IcFunnel, IcGauge, IcGlobe, IcGoogle, IcImage, IcKnet, IcLayers, IcMinus, IcMoon, IcOut, IcPackage, IcPencil, IcPercent, IcPhone, IcPin, IcPlus, IcPrint, IcReset, IcSearch, IcSend, IcShield, IcSort, IcSparkle, IcSpinner, IcStar, IcSun, IcTag, IcTrash, IcTruck, IcUpload, IcUser, IcWrench, IcX, IcZap, P, R, makeIcon } from '../components/icons.jsx';
import { LOCALE, PRIO, brandOf, clamp, cx, dateFmt, money, store, timeFmt, uid } from '../lib/util.js';
import { Ctx, useApp, useT } from '../lib/ctx.js';
import { ART, ArtBattery, ArtBrake, ArtCoilover, ArtDefs, ArtExhaust, ArtFilter, ArtGearbox, ArtHeadlight, ArtPlug, ArtRadiator, ArtTurbo, ArtWheel, ArtWing, PartArt, Stage, bolts, hatch, holes } from '../components/art.jsx';
import { EXPLODE_DIR, Helix, REDUCED, createStage, fadeTexture, finTexture } from '../three/stage.js';
import { BTN, Btn, Chip, Drawer, Field, Input, Menu, MenuItem, Modal, ModalHead, Select, Toasts, inputCls, useEsc, useLockBody } from '../components/ui.jsx';

/* ============================================================================
   21 · DATA LAYER — Supabase
   Every read and write goes through here. Nothing else in the app talks to
   the network, so the UI components stayed exactly as they were.
   ========================================================================== */

const SUPABASE_URL = 'https://bzsrnypedhkbbxttdcln.supabase.co';
const SUPABASE_KEY = 'sb_publishable_vB2GchzdJq9MA2K4QKPEWQ_4pe_ysR3';

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,      // survives a reload
    autoRefreshToken: true,    // renews the access token before it expires
    detectSessionInUrl: true,  // picks the token out of a confirmation link
    flowType: 'pkce',
    storageKey: 'carbon-souq-auth'
  }
});

/* jsonb {en,ar,fr} <-> the [en, ar, fr] tuples the UI already speaks */
const toTuple = j => {
  if (!j) return ['', '', ''];
  if (Array.isArray(j)) return j;
  if (typeof j === 'string') return [j, j, j];
  return [j.en || '', j.ar || j.en || '', j.fr || j.en || ''];
};
const toJson = v => {
  if (Array.isArray(v)) return { en: v[0] || '', ar: v[1] || v[0] || '', fr: v[2] || v[0] || '' };
  return { en: String(v || '') };
};

const fromDbPart = r => ({
  id: r.id,
  name: toTuple(r.name),
  oem: r.oem || '',
  brand: r.brand,
  price: Number(r.price_kwd),
  prio: r.priority,
  art: r.art,
  anchor: r.anchor,
  spec: toTuple(r.spec),
  photo: r.photo_url || '',
  bought: !!r.bought,
  added: r.created_at ? new Date(r.created_at).getTime() : 0,
  readOnly: !!r.readOnly
});

const toDbPart = p => ({
  name: toJson(p.name),
  oem: p.oem || null,
  brand: p.brand,
  price_kwd: p.price,
  priority: p.prio,
  art: p.art,
  anchor: p.anchor,
  spec: p.spec ? toJson(p.spec) : null,
  photo_url: p.photo || null
});

const DB = {
  /* ---- reference data · readable signed out ---- */
  async catalog() {
    const { data, error } = await sb.from('catalog_parts').select('*').order('sort_order');
    if (error) throw error;
    return data.map(r => fromDbPart({ ...r, readOnly: true }));
  },
  async reviews() {
    const { data, error } = await sb.from('reviews').select('*').order('sort_order');
    if (error) throw error;
    return data.map(r => ({
      id: r.id, name: toTuple(r.name), role: toTuple(r.role), quote: toTuple(r.quote),
      avatar: r.avatar_url, hue: r.hue, stars: r.stars, at: r.reviewed_at, part: r.part_ref
    }));
  },
  /* The code list is not readable any more. check_promo answers for one code
     at a time, so a stranger cannot enumerate the discounts. */
  async promo(code) {
    const { data, error } = await sb.rpc('check_promo', { p_code: code });
    if (error || !data || !data.length) return null;
    return data[0];
  },

  /* ---- everything below is RLS-scoped to the signed-in user ---- */
  async profile() {
    const { data } = await sb.from('profiles').select('*').maybeSingle();
    return data;
  },
  /* profiles.id IS the auth user id. PostgREST rejects a filterless UPDATE
     outright (SQLSTATE 21000), so the row has to be named explicitly. */
  saveProfile: (uid, patch) => sb.from('profiles').update(patch).eq('id', uid),

  async parts() {
    const { data, error } = await sb.from('parts').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(fromDbPart);
  },
  async addPart(uid, p) {
    const { data, error } = await sb.from('parts')
      .insert({ ...toDbPart(p), user_id: uid }).select().single();
    if (error) throw error;
    return fromDbPart(data);
  },
  async updatePart(id, patch) {
    const { data, error } = await sb.from('parts').update(patch).eq('id', id).select().single();
    if (error) throw error;
    return fromDbPart(data);
  },
  deletePart: id => sb.from('parts').delete().eq('id', id),

  async cart() {
    const { data, error } = await sb.from('cart_items').select('part_id, qty');
    if (error) throw error;
    return data.map(r => ({ id: r.part_id, qty: r.qty }));
  },
  addToCart: (uid, partId) => sb.from('cart_items')
    .upsert({ user_id: uid, part_id: partId, qty: 1 }, { onConflict: 'user_id,part_id', ignoreDuplicates: true }),
  setQty: (uid, partId, qty) => qty <= 0
    ? sb.from('cart_items').delete().eq('part_id', partId)
    : sb.from('cart_items').update({ qty }).eq('part_id', partId),
  clearCart: uid => sb.from('cart_items').delete().eq('user_id', uid),

  async vehicles() {
    const { data, error } = await sb.from('vehicles').select('*').order('created_at');
    if (error) throw error;
    return data.map(v => ({ id: v.id, brand: v.brand, model: v.model, year: String(v.year || ''), plate: v.plate || '', primary: v.is_primary }));
  },
  addVehicle: (uid, v, first) => sb.from('vehicles')
    .insert({ user_id: uid, brand: v.brand, model: v.model, year: parseInt(v.year, 10) || null, plate: v.plate || null, is_primary: first }),
  removeVehicle: id => sb.from('vehicles').delete().eq('id', id),
  async setPrimaryVehicle(uid, id) {
    // the partial unique index allows one primary per user, so clear first
    await sb.from('vehicles').update({ is_primary: false }).eq('user_id', uid);
    return sb.from('vehicles').update({ is_primary: true }).eq('id', id);
  },

  async orders() {
    const { data, error } = await sb.from('orders')
      .select('*, order_items(*)').order('placed_at', { ascending: false });
    if (error) throw error;
    return data.map(o => ({
      id: o.order_no,
      rowId: o.id,
      placedAt: new Date(o.placed_at).getTime(),
      stamps: [o.placed_at, o.packed_at, o.shipped_at, o.delivered_at].map(t => t ? new Date(t).getTime() : null),
      stage: o.stage,
      customer: o.customer,
      subtotalKwd: Number(o.subtotal_kwd),
      shipKwd: Number(o.ship_kwd),
      discountKwd: Number(o.discount_kwd),
      totalKwd: Number(o.total_kwd),
      promo: o.promo,
      method: o.method,
      card: o.card_last4,
      eta: new Date(o.eta).getTime(),
      addr: o.address,
      items: (o.order_items || []).map(i => ({
        id: i.id, name: toTuple(i.name), oem: i.oem, price: Number(i.price_kwd),
        qty: i.qty, art: i.art, photo: i.photo_url || ''
      }))
    }));
  },
  /* The browser no longer sends any money figure. place_order reads the cart
     on the server, prices it from the catalogue, and writes the order itself.
     Customers have no insert or update rights on orders at all. */
  async placeOrder(uid, payload) {
    const { data, error } = await sb.rpc('place_order', {
      p_address: payload.address,
      p_method: payload.method,
      p_card_last4: payload.card_last4 || null,
      p_promo: payload.promo || null,
      p_customer: payload.customer || ''
    });
    if (error) throw error;
    return data;
  },

  /* Staff only. The database checks the caller's staff flag itself — this call
     failing is the expected result for a customer, not something to hide. */
  setOrderStage: (orderId, stage) =>
    sb.rpc('set_order_stage', { p_order_id: orderId, p_stage: stage }),

  saveAddress: (uid, a) => sb.from('addresses').upsert({
    user_id: uid, governorate: a.gov, area: a.area, block: a.block, street: a.street,
    avenue: a.ave || null, house: a.house, floor: a.floor || null,
    phone: a.phone.replace(/\D/g, ''), notes: a.notes || null,
    pin_x: a.pin ? a.pin.x : null, pin_y: a.pin ? a.pin.y : null
  })
};


/* `uid` is shadowed inside App by the signed-in user's id, so keep an alias. */
const uid2 = uid;


export { DB, SUPABASE_KEY, SUPABASE_URL, fromDbPart, sb, toDbPart, toJson, toTuple, uid2 };
