/* ==========================================================================
   LIVE BROWSER MOUNT FOR SHADCN SUSHI-CONVEYOR-MENU WITH PARLE PRODUCTS
   ========================================================================== */

const { createPortal } = ReactDOM;

type DishTier = 1 | 2 | 3 | 4 | 5;

interface ConveyorDish {
  id: string;
  name: string;
  description?: string;
  price: string;
  tier?: DishTier;
  image: string;
  details?: string[];
}

interface SushiConveyorMenuLabels {
  add: string;
  close: string;
  previous: string;
  next: string;
  pause?: string;
}

const SPACING = 1.35;
const CURVE = 0.95;
const BAND = 1.22;
const TILT = 0.8;
const SLAT = 0.34;
const LIFT_Y = -6;
const LIFT_SCALE = 0.08;
const BACK_SHADE = 0.15;
const CHIP_ROOM = 34;
const WIDE = 1024;
const HOLD = 1400;
const RUN = 0;
const SEEK = 1;
const DRAG = 2;
const DEFAULT_LABELS: SushiConveyorMenuLabels = {
  add: "Add to Tasting Box",
  close: "Close",
  previous: "Previous Parle creation",
  next: "Next Parle creation",
  pause: "Pause belt"
};

const TIERS = [
  { ring: "border-[#B8292F]", dot: "bg-[#B8292F]" },
  { ring: "border-[#D89B3C]", dot: "bg-[#D89B3C]" },
  { ring: "border-[#8E4716]", dot: "bg-[#8E4716]" },
  { ring: "border-[#4B2814]", dot: "bg-[#4B2814]" },
  { ring: "border-[#1F8A4C]", dot: "bg-[#1F8A4C]" },
] as const;

const THEME =
  "[--belt:#2C1E14] [--belt-side:#1A110B] [--rail:#D89B3C] [--island:#FAF7F2] [--island-low:#EFE7D8] [--island-wall:#D4C5B1]";

type Geo = {
  width: number; height: number; d: number; r: number; s: number; l: number; pitch: number; n: number;
  kb: number; cx: number; ym: number; a: number; b: number; band: number; slats: number; side: number; edgeTop: number;
};
type Point = { x: number; z: number; nx: number; nz: number; tx: number; tz: number };
type Sim = {
  offset: number; v: number; mode: number; target: number;
  lift: number[]; vlift: number[]; z: number[]; lane: string[];
  raf: number; last: number; visible: boolean; init: boolean; touched: boolean; l: number; center: number; published: string;
  px: number; py: number; inside: boolean; lock: boolean; lockX: number; lockY: number;
};

function makeSim(): Sim {
  return { offset: 0, v: 0, mode: RUN, target: 0, lift: [], vlift: [], z: [], lane: [], raf: 0, last: 0, visible: true, init: false, touched: false, l: 0, center: -1, published: "", px: 0, py: 0, inside: false, lock: false, lockX: 0, lockY: 0 };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function tierStyle(tier: number | undefined) {
  return TIERS[clamp(Math.round(tier ?? 1), 1, 5) - 1] ?? TIERS[0];
}

function along(g: Geo, u: number): Point {
  const { s, r } = g;
  let t = ((u % g.l) + g.l) % g.l;
  if (t < s) return { x: s / 2 - t, z: r, nx: 0, nz: 1, tx: -1, tz: 0 };
  t -= s;
  const arc = Math.PI * r;
  if (t < arc) {
    const f = t / r;
    const sin = Math.sin(f);
    const cos = Math.cos(f);
    return { x: -s / 2 - r * sin, z: r * cos, nx: -sin, nz: cos, tx: -cos, tz: -sin };
  }
  t -= arc;
  if (t < s) return { x: -s / 2 + t, z: -r, nx: 0, nz: -1, tx: 1, tz: 0 };
  t -= s;
  const f = Math.min(Math.PI, t / r);
  const sin = Math.sin(f);
  const cos = Math.cos(f);
  return { x: s / 2 + r * sin, z: -r * cos, nx: sin, nz: -cos, tx: cos, tz: sin };
}

function project(g: Geo, x: number, z: number) {
  const k = g.a + g.b * z;
  return { x: g.cx + x * k, y: g.ym + TILT * (g.a * z + (g.b * z * z) / 2), k };
}

function makeGeo(width: number, n: number, d: number, kb: number): Geo {
  const l = Math.max(1, n) * SPACING * d;
  const r = Math.min(CURVE * d, l / (2 * Math.PI));
  const s = Math.max(0, (l - 2 * Math.PI * r) / 2);
  const g: Geo = { width, height: 0, d, r, s, l, pitch: l / Math.max(1, n), n: Math.max(1, n), kb, cx: width / 2, ym: 0, a: (1 + kb) / 2, b: (1 - kb) / (2 * r), band: BAND * d, slats: Math.max(10, Math.round(l / (SLAT * d))), side: Math.max(3, d * 0.07), edgeTop: 0 };
  let top = Infinity;
  let bottom = -Infinity;
  let edge = Infinity;
  for (let j = 0; j < 120; j++) {
    const p = along(g, (j / 120) * l);
    const rim = project(g, p.x + (p.nx * g.band) / 2, p.z + (p.nz * g.band) / 2);
    const plate = project(g, p.x, p.z);
    const half = (plate.k * d * TILT) / 2;
    edge = Math.min(edge, rim.y);
    top = Math.min(top, rim.y, plate.y + (LIFT_Y / 100) * half * 2 - half * (1 + LIFT_SCALE) - CHIP_ROOM);
    bottom = Math.max(bottom, rim.y + g.side + d * 0.06, plate.y + half + d * 0.08);
  }
  g.ym = Math.ceil(-top) + 2;
  g.height = Math.ceil(bottom - top) + 4;
  g.edgeTop = edge + g.ym;
  return g;
}

function halfSpan(g: Geo) {
  let span = 0;
  for (let j = 0; j < 120; j++) {
    const p = along(g, (j / 120) * g.l);
    const rim = project(g, p.x + (p.nx * g.band) / 2, p.z + (p.nz * g.band) / 2);
    const plate = project(g, p.x, p.z);
    span = Math.max(span, Math.abs(rim.x - g.cx) + 3, Math.abs(plate.x - g.cx) + (plate.k * g.d * (1 + LIFT_SCALE)) / 2);
  }
  return span;
}

function edgePath(g: Geo, offset: number) {
  let d = "";
  const steps = 168;
  for (let j = 0; j < steps; j++) {
    const p = along(g, (j / steps) * g.l);
    const q = project(g, p.x + p.nx * offset, p.z + p.nz * offset);
    d += `${j ? "L" : "M"}${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
  }
  return `${d}Z`;
}

function slatPath(g: Geo, offset: number, shift: number) {
  const half = g.band * 0.46;
  const pitch = g.l / g.slats;
  const bulge = pitch * 0.2;
  let d = "";
  for (let j = 0; j < g.slats; j++) {
    const p = along(g, offset + shift + j * pitch);
    const inner = project(g, p.x - p.nx * half, p.z - p.nz * half);
    const outer = project(g, p.x + p.nx * half, p.z + p.nz * half);
    const mid = project(g, p.x + p.tx * bulge, p.z + p.tz * bulge);
    d += `M${inner.x.toFixed(1)} ${inner.y.toFixed(1)}Q${(2 * mid.x - (inner.x + outer.x) / 2).toFixed(1)} ${(2 * mid.y - (inner.y + outer.y) / 2).toFixed(1)} ${outer.x.toFixed(1)} ${outer.y.toFixed(1)}`;
  }
  return d;
}

function pose(g: Geo, offset: number, i: number) {
  const p = along(g, offset - i * g.pitch);
  const q = project(g, p.x, p.z);
  return { x: q.x, y: q.y, k: q.k, depth: (p.z + g.r) / (2 * g.r) };
}

function centerOf(g: Geo, offset: number) {
  return ((Math.round((offset - g.s / 2) / g.pitch) % g.n) + g.n) % g.n;
}

function legendEntries(items: ConveyorDish[], legend: { [tier: number]: string } | undefined) {
  const out = [] as { tier: number; label: string }[];
  for (let tier = 1; tier <= 5; tier++) {
    const label = legend ? legend[tier] : items.find((item) => (item.tier ?? 1) === tier)?.price;
    if (label) out.push({ tier, label });
  }
  return out;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function SushiConveyorMenu({
  items,
  eyebrow,
  heading,
  caption,
  action,
  speed = 26,
  paused: pausedProp,
  onPausedChange,
  autoplay = false,
  interval = 3000,
  active: activeProp,
  onActiveChange,
  onOpenChange,
  onAdd,
  legend,
  labels = DEFAULT_LABELS,
  className,
}: any) {
  const uid = "parle-belt";
  const count = items.length;
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const beltRef = React.useRef<HTMLDivElement | null>(null);
  const seamRef = React.useRef<SVGPathElement | null>(null);
  const glintRef = React.useRef<SVGPathElement | null>(null);
  const plates = React.useRef<(HTMLButtonElement | null)[]>([]);
  const lifts = React.useRef<(HTMLSpanElement | null)[]>([]);
  const shades = React.useRef<(HTMLSpanElement | null)[]>([]);
  const shadows = React.useRef<(HTMLSpanElement | null)[]>([]);
  const anchors = React.useRef<(HTMLSpanElement | null)[]>([]);
  const sim = React.useRef(makeSim());
  const pointer = React.useRef({ id: -1, index: -1, x: 0, y: 0, moved: false, start: 0, lane: 1, lastX: 0, lastT: 0, v: 0 });
  const pendingOpen = React.useRef(-1);
  const returnFocus = React.useRef<number | null>(null);
  const autoActive = React.useRef<number | null>(null);
  const autoLast = React.useRef<number | null>(null);
  const [size, setSize] = React.useState({ section: 0, stage: 0 });
  const [innerActive, setInnerActive] = React.useState<number | null>(null);
  const [innerPaused, setInnerPaused] = React.useState(false);
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const [lifted, setLifted] = React.useState<number | null>(null);
  const [reduced, setReduced] = React.useState(false);
  const [playing, setPlaying] = React.useState(autoplay);
  const [center, setCenter] = React.useState(0);
  const [failed, setFailed] = React.useState<{ [id: string]: boolean }>({});

  const requested = activeProp !== undefined ? activeProp : innerActive;
  const active = requested !== null && requested >= 0 && requested < count ? requested : null;
  const paused = pausedProp ?? innerPaused;
  const wide = size.section >= WIDE;
  const narrow = size.section > 0 && size.section < 480;
  const kb = narrow ? 0.6 : 0.68;

  const geo = React.useMemo(() => {
    if (!size.stage || count === 0) return null;
    const span = halfSpan(makeGeo(1000, count, 100, kb)) / 100;
    const cap = wide ? 150 : clamp(size.section * 0.143, 96, 150);
    const fit = (size.stage - 8) / (2 * span);
    return makeGeo(size.stage, count, Math.round(clamp(fit, Math.min(96, cap), cap)), kb);
  }, [size.stage, size.section, count, kb, wide]);

  const live = React.useRef({
    geo: null as Geo | null, active: null as number | null, paused: false, reduced: false, open: false, count: 0, speed: 26,
    activeControlled: false, pausedControlled: false,
    onActiveChange: undefined as any, onPausedChange: undefined as any, onOpenChange: undefined as any, onAdd: undefined as any,
  });
  live.current = {
    geo, active, paused, reduced, open: openIndex !== null, count, speed: Math.max(0, speed),
    activeControlled: activeProp !== undefined, pausedControlled: pausedProp !== undefined,
    onActiveChange, onPausedChange, onOpenChange, onAdd,
  };

  const paintPlate = React.useCallback((i: number) => {
    const L = live.current;
    const g = L.geo;
    const s = sim.current;
    const button = plates.current[i];
    if (!g || !button) return;
    const q = pose(g, s.offset, i);
    const e = s.lift[i] ?? 0;
    button.style.transform = `translate3d(${(q.x - g.d / 2).toFixed(2)}px,${(q.y - (g.d * TILT) / 2).toFixed(2)}px,0) scale(${q.k.toFixed(4)})`;
    const z = i === L.active ? 2000 : 100 + Math.round(q.y);
    if (s.z[i] !== z) { s.z[i] = z; button.style.zIndex = String(z); }
    const lane = q.depth >= 0.5 ? "front" : "back";
    if (s.lane[i] !== lane) { s.lane[i] = lane; button.dataset.lane = lane; }
    const lift = lifts.current[i];
    if (lift) lift.style.transform = `translateY(${(LIFT_Y * e).toFixed(3)}%) scale(${(1 + LIFT_SCALE * e).toFixed(4)})`;
    const shade = shades.current[i];
    if (shade) shade.style.opacity = (BACK_SHADE * clamp(1 - q.depth, 0, 1) * (1 - 0.7 * clamp(e, 0, 1))).toFixed(3);
    const shadow = shadows.current[i];
    if (shadow) {
      shadow.style.transform = `translate3d(0,${(g.d * TILT * 0.05 * e).toFixed(2)}px,0) scale(${(1 + 0.14 * e).toFixed(3)})`;
      shadow.style.opacity = (1 - 0.5 * clamp(e, 0, 1)).toFixed(3);
    }
    const anchor = anchors.current[i];
    if (anchor) anchor.style.transform = `scale(${(1 / (q.k * (1 + LIFT_SCALE * e))).toFixed(4)})`;
  }, []);

  const paintBelt = React.useCallback(() => {
    const L = live.current;
    const g = L.geo;
    const s = sim.current;
    if (!g) return;
    seamRef.current?.setAttribute("d", slatPath(g, s.offset, 0));
    glintRef.current?.setAttribute("d", slatPath(g, s.offset, -Math.max(1.4, g.d * 0.024)));
    const v = (Math.abs(s.v) < 0.005 ? 0 : s.v).toFixed(2);
    if (v !== s.published) { s.published = v; beltRef.current?.style.setProperty("--belt-v", v); }
    const c = centerOf(g, s.offset);
    if (c !== s.center) { s.center = c; setCenter(c); }
  }, []);

  const paintAll = React.useCallback(() => {
    for (let i = 0; i < live.current.count; i++) paintPlate(i);
    paintBelt();
  }, [paintPlate, paintBelt]);

  const hitTest = React.useCallback((px: number, py: number) => {
    const L = live.current;
    const g = L.geo;
    const s = sim.current;
    if (!g) return null;
    let best = null as number | null;
    let bestY = -Infinity;
    for (let i = 0; i < L.count; i++) {
      const q = pose(g, s.offset, i);
      const e = clamp(s.lift[i] ?? 0, 0, 1.2);
      const grow = (1 + LIFT_SCALE * e) * (i === L.active ? 1.1 : 1);
      const rx = (g.d * q.k * grow) / 2;
      const ry = (g.d * TILT * q.k * grow) / 2;
      const dx = (px - q.x) / rx;
      const dy = (py - (q.y + (LIFT_Y / 100) * g.d * TILT * q.k * e)) / ry;
      if (dx * dx + dy * dy > 1) continue;
      if (i === L.active) return i;
      if (q.y > bestY) { best = i; bestY = q.y; }
    }
    return best;
  }, []);

  const hoverRef = React.useRef((hit: number | null) => { void hit; });

  const tick = React.useCallback((now: number) => {
    const s = sim.current;
    const L = live.current;
    const g = L.geo;
    s.raf = 0;
    if (!g || !s.visible) { s.last = 0; return; }
    const dt = s.last ? clamp((now - s.last) / 1000, 0, 0.25) : 1 / 60;
    s.last = now;
    const steps = Math.max(1, Math.ceil(dt / 0.017));
    const h = dt / steps;
    const stopped = L.paused || L.active !== null || L.open;
    const cruise = L.reduced ? 0 : L.speed;
    for (let step = 0; step < steps; step++) {
      if (s.mode === SEEK) {
        const w = 5.6;
        s.v += (w * w * (s.target - s.offset) - 2 * w * s.v) * h;
        s.offset += s.v * h;
        if (Math.abs(s.target - s.offset) < 0.3 && Math.abs(s.v) < 4) { s.offset = s.target; s.v = 0; s.mode = RUN; }
      } else if (s.mode === RUN) {
        if (stopped) {
          s.v *= Math.exp(-7.2 * h);
          if (Math.abs(s.v) < 0.02) s.v = 0;
        } else {
          let e = s.v - cruise;
          if (Math.abs(e) > Math.max(6, cruise * 0.5)) e = Math.sign(e) * Math.max(0, Math.abs(e) * Math.exp(-2.4 * h) - 90 * h);
          else e *= Math.exp(-3.4 * h);
          s.v = cruise + (Math.abs(e) < 0.01 ? 0 : e);
        }
        s.offset += s.v * h;
      }
      for (let i = 0; i < L.count; i++) {
        const goal = i === L.active ? 1 : 0;
        if (L.reduced) { s.lift[i] = goal; s.vlift[i] = 0; continue; }
        const x = s.lift[i] ?? 0;
        const v = (s.vlift[i] ?? 0) + (330 * (goal - x) - 23 * (s.vlift[i] ?? 0)) * h;
        s.lift[i] = x + v * h;
        s.vlift[i] = v;
      }
    }
    let busy = s.mode !== RUN || s.v !== 0 || (!stopped && cruise > 0);
    for (let i = 0; i < L.count; i++) {
      const goal = i === L.active ? 1 : 0;
      if (Math.abs(goal - (s.lift[i] ?? 0)) < 0.002 && Math.abs(s.vlift[i] ?? 0) < 0.02) { s.lift[i] = goal; s.vlift[i] = 0; }
      else busy = true;
    }
    if (s.inside && !s.lock && s.mode === RUN && !L.open && pointer.current.id < 0 && Math.abs(s.v) > 0.3) {
      const hit = hitTest(s.px, s.py);
      if (hit !== null && hit !== L.active) hoverRef.current(hit);
    }
    paintAll();
    if (busy) s.raf = requestAnimationFrame(tick);
    else s.last = 0;
  }, [hitTest, paintAll]);

  const kick = React.useCallback(() => {
    const s = sim.current;
    if (s.raf || !s.visible) return;
    s.last = 0;
    s.raf = requestAnimationFrame(tick);
  }, [tick]);

  const setActive = React.useCallback((next: number | null) => {
    const L = live.current;
    if (L.active === next) return;
    if (!L.activeControlled) { L.active = next; setInnerActive(next); }
    L.onActiveChange?.(next);
    kick();
  }, [kick]);

  const stop = React.useCallback(() => {
    setPlaying(false);
    const s = sim.current;
    s.touched = true;
    if (s.mode === SEEK) s.mode = RUN;
    const auto = autoActive.current;
    if (auto !== null) {
      autoActive.current = null;
      if (live.current.active === auto) setActive(null);
    }
  }, [setActive]);

  const seekTo = React.useCallback((index: number) => {
    const s = sim.current;
    const g = live.current.geo;
    if (!g) return;
    const base = g.s / 2 + index * g.pitch;
    s.target = base + Math.round((s.offset - base) / g.l) * g.l;
    if (live.current.reduced) { s.offset = s.target; s.v = 0; s.mode = RUN; paintAll(); return; }
    s.mode = SEEK;
    kick();
  }, [kick, paintAll]);

  const focusVisible = () => !!stageRef.current?.querySelector("[data-dish]:focus-visible");

  hoverRef.current = (hit: number | null) => {
    const current = live.current.active;
    if (hit === current) {
      if (hit !== null && autoActive.current === hit) { autoActive.current = null; setPlaying(false); }
      return;
    }
    if (hit !== null) { stop(); setActive(hit); return; }
    if (current !== null && current !== autoActive.current && !focusVisible()) setActive(null);
  };

  const open = React.useCallback((index: number) => {
    stop();
    setActive(index);
    const s = sim.current;
    s.v = 0;
    s.mode = RUN;
    live.current.open = true;
    paintBelt();
    setOpenIndex(index);
    live.current.onOpenChange?.(index);
  }, [stop, setActive, paintBelt]);

  const close = React.useCallback(() => {
    live.current.open = false;
    setOpenIndex(null);
    live.current.onOpenChange?.(null);
    kick();
  }, [kick]);

  const go = (index: number, focus: boolean) => {
    if (count === 0) return;
    const next = ((index % count) + count) % count;
    stop();
    if (focus) plates.current[next]?.focus({ preventScroll: true });
    setActive(next);
    seekTo(next);
  };

  const togglePause = () => {
    stop();
    const L = live.current;
    const next = !L.paused;
    if (!L.pausedControlled) { L.paused = next; setInnerPaused(next); }
    L.onPausedChange?.(next);
    if (!next && L.active !== null && !focusVisible() && !sim.current.inside) setActive(null);
    kick();
  };

  React.useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;
    const measure = () => {
      const next = { section: Math.round(section.clientWidth), stage: Math.round(stage.clientWidth) };
      setSize((old) => (old.section === next.section && old.stage === next.stage ? old : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(section);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [count > 0]);

  React.useLayoutEffect(() => {
    const s = sim.current;
    if (!geo) return;
    if (!s.init) {
      s.init = true;
      s.offset = geo.s / 2 - Math.min(live.current.speed * 1.62, geo.pitch * 0.45);
      s.v = live.current.reduced || live.current.paused ? 0 : live.current.speed;
    } else if (s.l > 0 && s.l !== geo.l) {
      const f = geo.l / s.l;
      s.offset *= f;
      s.target *= f;
    }
    s.l = geo.l;
    s.z = [];
    s.lane = [];
    paintAll();
    kick();
  }, [geo, items, reduced, paintAll, kick]);

  React.useEffect(() => { kick(); }, [active, paused, openIndex, reduced, speed, kick]);

  const geoReady = geo !== null;
  React.useEffect(() => {
    if (!playing || reduced || paused || openIndex !== null || count === 0 || !geoReady) return;
    let timer = 0;
    const show = () => {
      const g = live.current.geo;
      if (!g) return;
      const last = autoLast.current;
      const index = last === null ? centerOf(g, sim.current.offset + live.current.speed * 0.25) : (last + 1) % count;
      autoLast.current = index;
      autoActive.current = index;
      setActive(index);
      seekTo(index);
      timer = window.setTimeout(() => {
        if (autoActive.current === index) {
          autoActive.current = null;
          if (live.current.active === index) setActive(null);
        }
        timer = window.setTimeout(show, Math.max(300, interval - HOLD));
      }, HOLD);
    };
    timer = window.setTimeout(show, autoLast.current === null ? 1600 : Math.max(300, interval - HOLD));
    return () => window.clearTimeout(timer);
  }, [playing, reduced, paused, openIndex, count, interval, geoReady, setActive, seekTo]);

  const local = (event: React.PointerEvent) => {
    const box = stageRef.current?.getBoundingClientRect();
    return { x: event.clientX - (box?.left ?? 0), y: event.clientY - (box?.top ?? 0) };
  };

  const onPointerDown = (event: React.PointerEvent) => {
    const g = live.current.geo;
    if (event.button !== 0 || !g) return;
    const at = local(event);
    const hit = hitTest(at.x, at.y);
    pendingOpen.current = -1;
    pointer.current = { id: event.pointerId, index: hit ?? -1, x: event.clientX, y: event.clientY, moved: false, start: sim.current.offset, lane: at.y >= g.ym ? 1 : -1, lastX: event.clientX, lastT: event.timeStamp, v: 0 };
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const s = sim.current;
    const p = pointer.current;
    const stage = stageRef.current;
    const g = live.current.geo;
    if (!stage || !g) return;
    const at = local(event);
    if (event.pointerType === "mouse") { s.px = at.x; s.py = at.y; s.inside = true; }
    if (p.id === event.pointerId) {
      const dx = event.clientX - p.x;
      const now = event.timeStamp;
      if (!p.moved && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(event.clientY - p.y)) {
        p.moved = true;
        stop();
        setActive(null);
        s.mode = DRAG;
        if (stage.isConnected) stage.setPointerCapture(event.pointerId);
      }
      if (p.moved) {
        const v = (event.clientX - p.lastX) / Math.max(1, now - p.lastT);
        p.v = p.v * 0.6 + v * 0.4;
        p.lastX = event.clientX;
        p.lastT = now;
        const scale = p.lane > 0 ? 1 : 1 / g.kb;
        s.offset = p.start - p.lane * dx * scale;
        s.v = live.current.reduced ? 0 : -p.lane * p.v * 1000 * scale;
        kick();
      }
      return;
    }
    if (event.pointerType !== "mouse" || live.current.open) return;
    if (s.lock) {
      if (Math.hypot(at.x - s.lockX, at.y - s.lockY) < 4) return;
      s.lock = false;
    }
    hoverRef.current(hitTest(at.x, at.y));
  };

  const finishPointer = (event: React.PointerEvent, cancelled: boolean) => {
    const p = pointer.current;
    if (p.id !== event.pointerId) return;
    const s = sim.current;
    const stage = stageRef.current;
    if (stage?.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    pointer.current = { ...p, id: -1 };
    if (s.mode === DRAG) {
      s.mode = RUN;
      const carry = Math.exp(-Math.max(0, event.timeStamp - p.lastT) / 70);
      s.v = live.current.reduced ? 0 : clamp(s.v * carry, -1400, 1400);
      if (event.pointerType === "mouse") {
        const at = local(event);
        s.lock = true;
        s.lockX = at.x;
        s.lockY = at.y;
      }
      kick();
      return;
    }
    if (cancelled || p.moved) return;
    const touch = event.pointerType !== "mouse";
    if (p.index < 0) {
      if (touch && live.current.active !== null) { stop(); setActive(null); }
      return;
    }
    stop();
    if (touch && live.current.active !== p.index) setActive(p.index);
    else pendingOpen.current = p.index;
  };

  const openSource = React.useCallback(() => (openIndex === null ? null : lifts.current[openIndex]?.getBoundingClientRect() ?? null), [openIndex]);
  const onLift = React.useCallback((on: boolean) => setLifted(on ? openIndex : null), [openIndex]);
  const onDialogClose = React.useCallback(() => { returnFocus.current = openIndex; close(); }, [openIndex, close]);
  const onDialogAdd = React.useCallback(() => {
    const item = openIndex === null ? undefined : items[openIndex];
    if (item) live.current.onAdd?.(item);
  }, [openIndex, items]);

  const paths = React.useMemo(() => (geo ? { outer: edgePath(geo, geo.band / 2), inner: edgePath(geo, -geo.band / 2), island: edgePath(geo, -geo.band / 2 - geo.d * 0.035) } : null), [geo]);
  const current = active === null ? null : items[active] ?? null;
  const roving = active ?? center;
  const tiers = legendEntries(items, legend);
  const g = geo;
  const control = "inline-flex size-9 items-center justify-center rounded-full border border-[rgba(181,115,25,0.3)] bg-[#FAF7F2] text-[#4D3F32] shadow-sm outline-none transition-colors hover:border-[#B8292F] hover:text-[#B8292F]";

  const header = (eyebrow || heading || tiers.length > 0) && (
    <div
      className="flex flex-col items-center gap-3 px-4 text-center max-w-[840px] mx-auto"
      style={{ width: "100%", maxWidth: "840px", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}
    >
      {eyebrow && <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-[#B8292F]">{eyebrow}</p>}
      {heading && <h2 className="font-serif font-medium tracking-tight text-[#1A130E] text-3xl md:text-4xl lg:text-[2.75rem] leading-[1.12]">{heading}</h2>}
      {tiers.length > 0 && (
        <ul
          aria-hidden="true"
          data-legend
          className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-[11.5px] text-[#6E5D4F]"
          style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", margin: "0 auto" }}
        >
          {tiers.map((entry) => (
            <li key={entry.tier} className="inline-flex items-center gap-1.5">
              <span className={`size-2.5 rounded-full border-2 bg-transparent ${tierStyle(entry.tier).ring}`} />
              {entry.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const captionNode = (
    <div
      id={`${uid}-caption`}
      aria-live="polite"
      data-caption
      className="mx-auto mt-2 max-w-xl px-4 text-center min-h-[3.5rem]"
      style={{ width: "100%", maxWidth: "36rem", margin: "0 auto", textAlign: "center" }}
    >
      <p className={`text-base md:text-lg ${current ? "font-semibold text-[#1A130E]" : "text-[#6E5D4F]"}`}>
        {current ? (
          <>
            {current.name}{" "}
            <span className="font-serif italic text-[14px] md:text-[15px] font-semibold text-[#B8292F]">
              · {current.price}
            </span>
          </>
        ) : (
          caption
        )}
      </p>
      {current?.description && (
        <p className="mt-1 text-[13.5px] leading-relaxed text-[#4D3F32] max-w-[54ch] mx-auto" style={{ margin: "4px auto 0", textAlign: "center" }}>
          {current.description}
        </p>
      )}
    </div>
  );

  const controls = count > 1 && (
    <div className="relative z-10 mt-2 flex items-center justify-center gap-2" style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
      <button type="button" aria-label={labels.previous} onClick={() => go((live.current.active ?? sim.current.center) - 1, false)} className={control}>
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3.5 5.5 8l4.5 4.5" /></svg>
      </button>
      <button type="button" aria-label={labels.pause ?? DEFAULT_LABELS.pause} aria-pressed={paused} onClick={togglePause} className={control}>
        {paused
          ? <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="currentColor"><path d="M5 3.4v9.2a.6.6 0 0 0 .9.5l7.4-4.6a.6.6 0 0 0 0-1L5.9 2.9a.6.6 0 0 0-.9.5Z" /></svg>
          : <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="currentColor"><rect x="4" y="3" width="2.6" height="10" rx="0.8" /><rect x="9.4" y="3" width="2.6" height="10" rx="0.8" /></svg>}
      </button>
      <button type="button" aria-label={labels.next} onClick={() => go((live.current.active ?? sim.current.center) + 1, false)} className={control}>
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3.5 10.5 8 6 12.5" /></svg>
      </button>
    </div>
  );

  const stage = count > 0 && (
    <div
      ref={stageRef}
      data-stage
      role="group"
      aria-label={heading ?? "Parle conveyor belt"}
      className="relative w-full touch-pan-y select-none"
      style={{ height: g ? g.height : 280, width: "100%", maxWidth: "980px", margin: "0 auto", position: "relative", overflowX: "clip" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(event) => finishPointer(event, false)}
      onPointerCancel={(event) => finishPointer(event, true)}
      onPointerLeave={(event) => {
        if (event.pointerType !== "mouse") return;
        const s = sim.current;
        s.inside = false;
        s.lock = false;
        const current = live.current.active;
        if (pointer.current.id < 0 && !live.current.open && current !== null && current !== autoActive.current && !focusVisible()) setActive(null);
      }}
    >
      <div ref={beltRef} data-belt aria-hidden="true" className="pointer-events-none absolute inset-0">
        {g && paths && (
          <svg className="absolute left-0 top-0 overflow-visible" width={g.width} height={g.height} viewBox={`0 0 ${g.width} ${g.height}`} focusable="false">
            <defs>
              <filter id={`${uid}-soft`} x="-10%" y="-30%" width="120%" height="160%">
                <feGaussianBlur stdDeviation={(g.d * 0.06).toFixed(1)} />
              </filter>
              <linearGradient id={`${uid}-island`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" style={{ stopColor: "var(--island)" }} />
                <stop offset="1" style={{ stopColor: "var(--island-low)" }} />
              </linearGradient>
            </defs>
            <path d={paths.outer} transform={`translate(0 ${(g.side + g.d * 0.07).toFixed(1)})`} fill="black" className="opacity-[0.14]" filter={`url(#${uid}-soft)`} />
            <path d={`${paths.outer}${paths.inner}`} fillRule="evenodd" transform={`translate(0 ${g.side.toFixed(1)})`} style={{ fill: "var(--belt-side)" }} />
            <path d={`${paths.outer}${paths.inner}`} fillRule="evenodd" style={{ fill: "var(--belt)" }} />
            <path ref={seamRef} fill="none" stroke="black" strokeOpacity={0.42} strokeWidth={Math.max(1, g.d * 0.013)} strokeLinecap="round" />
            <path ref={glintRef} fill="none" stroke="white" strokeOpacity={0.18} strokeWidth={Math.max(0.8, g.d * 0.009)} strokeLinecap="round" />
            <path d={paths.outer} fill="none" style={{ stroke: "var(--rail)" }} strokeWidth={Math.max(2, g.d * 0.026)} />
            <path d={paths.inner} fill="none" style={{ stroke: "var(--rail)" }} strokeWidth={Math.max(1.6, g.d * 0.02)} />
            <path d={paths.island} style={{ fill: "var(--island-wall)" }} />
            <path d={paths.island} transform={`translate(0 ${(-g.side * 0.6).toFixed(1)})`} style={{ fill: `url(#${uid}-island)` }} />
          </svg>
        )}
      </div>
      {g && items.map((item: ConveyorDish, i: number) => {
        const tier = tierStyle(item.tier);
        const isActive = active === i;
        const broken = !!failed[item.id];
        return (
          <button
            key={item.id}
            ref={(node) => { plates.current[i] = node; }}
            type="button"
            data-dish={i}
            tabIndex={i === roving ? 0 : -1}
            aria-label={`${item.name}, ${item.price}`}
            className="absolute left-0 top-0 cursor-pointer rounded-[50%] outline-none"
            style={{ width: g.d, height: g.d * TILT, visibility: lifted === i ? "hidden" : undefined }}
            onFocus={() => { if (pointer.current.id < 0) { stop(); setActive(i); } }}
            onClick={(event) => { const pending = pendingOpen.current; pendingOpen.current = -1; if (event.detail === 0 || pending === i) open(i); }}
          >
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-45">
              <span ref={(node) => { shadows.current[i] = node; }} className="absolute inset-x-[5%] bottom-[-9%] top-[16%] rounded-[50%] bg-black" style={{ filter: `blur(${Math.max(2, g.d * 0.045).toFixed(1)}px)` }} />
            </span>
            <span ref={(node) => { lifts.current[i] = node; }} data-lift className="absolute inset-0">
              <span aria-hidden="true" className="absolute inset-[2%] rounded-[50%] bg-white shadow-inner" />
              {!broken && (
                <img
                  src={item.image}
                  alt=""
                  draggable={false}
                  onError={() => setFailed((old) => (old[item.id] ? old : { ...old, [item.id]: true }))}
                  className="pointer-events-none absolute inset-[4%] size-[92%] select-none rounded-[50%] object-cover"
                />
              )}
              <span aria-hidden="true" data-ring className={`pointer-events-none absolute -inset-[2%] rounded-[50%] border-[3px] ${tier.ring}`} />
              <span ref={(node) => { anchors.current[i] = node; }} aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 size-0" />
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <section
      ref={sectionRef}
      data-slot="sushi-conveyor-menu"
      className={`relative isolate w-full overflow-hidden bg-white text-[#1A130E] ${THEME} ${className ?? ""}`}
      style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", margin: "0 auto" }}
    >
      <div
        className="mx-auto flex w-full max-w-[1280px] flex-col items-center px-6 pb-12 pt-10 text-center"
        style={{ width: "100%", maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}
      >
        {header}
        <div
          className="mt-6 w-full max-w-[980px] min-w-0 flex justify-center"
          style={{ width: "100%", maxWidth: "980px", margin: "0 auto", display: "flex", justifyContent: "center", alignItems: "center" }}
        >
          {stage}
        </div>
        <div className="mt-2" style={{ margin: "8px auto 0", display: "flex", justifyContent: "center" }}>{controls}</div>
        <div className="mt-3" style={{ margin: "12px auto 0", display: "flex", justifyContent: "center" }}>{captionNode}</div>
        {action && <div className="mt-4 flex justify-center" style={{ margin: "16px auto 0", display: "flex", justifyContent: "center" }}>{action}</div>}
      </div>
      {openIndex !== null && items[openIndex] && (
        <DishDialog
          uid={uid}
          item={items[openIndex]}
          index={openIndex}
          total={count}
          labels={labels}
          reduced={reduced}
          broken={!!failed[items[openIndex].id]}
          source={openSource}
          onLift={onLift}
          onAdd={onDialogAdd}
          onClose={onDialogClose}
        />
      )}
    </section>
  );
}

function DishDialog({ uid, item, index, total, labels, reduced, broken, source, onLift, onAdd, onClose }: any) {
  const dialogRef = React.useRef<HTMLDivElement | null>(null);
  const figureRef = React.useRef<HTMLDivElement | null>(null);
  const closeRef = React.useRef<HTMLButtonElement | null>(null);
  const timer = React.useRef(0);
  const closing = React.useRef(false);
  const [shown, setShown] = React.useState(false);
  const [added, setAdded] = React.useState(false);
  const titleId = `${uid}-dish-title`;
  const tier = tierStyle(item.tier);

  React.useLayoutEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    onLift(true);
    const raf = requestAnimationFrame(() => setShown(true));
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer.current);
      document.body.style.overflow = overflow;
      onLift(false);
    };
  }, [source, reduced, onLift]);

  const dismiss = React.useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    setShown(false);
    onClose();
  }, [onClose]);

  const add = () => {
    if (added || closing.current) return;
    onAdd();
    setAdded(true);
    timer.current = window.setTimeout(dismiss, 450);
  };

  return createPortal(
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} className="fixed inset-0 z-[9500] flex items-center justify-center overflow-y-auto p-4 text-[#1A130E] sm:p-8">
      {/* Dark luxury backdrop blur */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${shown ? "opacity-100" : "opacity-0"}`}
        onClick={dismiss}
      />

      {/* Main Dialog Card */}
      <div
        className={`relative grid w-full max-w-[50rem] items-center gap-8 rounded-3xl border border-[rgba(26,19,14,0.08)] bg-white p-7 sm:p-10 shadow-[0_32px_80px_rgba(26,19,14,0.18),0_8px_24px_rgba(26,19,14,0.06)] sm:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] transition-all duration-300 ease-out ${
          shown ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-3"
        }`}
      >
        {/* Sleek Close Button */}
        <button
          ref={closeRef}
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-5 top-5 z-20 flex size-9 items-center justify-center rounded-full bg-[#F3EDE2] text-[#4D3F32] transition-colors hover:bg-[#B8292F] hover:text-white"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Product Visual Pedestal */}
        <div ref={figureRef} className="relative mx-auto aspect-square w-full max-w-[280px] sm:max-w-none flex items-center justify-center rounded-2xl bg-gradient-to-b from-[#FBF9F5] to-[#F3EDE2] p-6 border border-[rgba(26,19,14,0.06)] shadow-inner">
          <img
            src={item.image}
            alt={item.name}
            draggable={false}
            className="relative max-h-full max-w-full select-none object-contain drop-shadow-[0_16px_28px_rgba(26,19,14,0.16)] transition-transform duration-500 hover:scale-105"
          />
        </div>

        {/* Content Details */}
        <div className="relative flex flex-col gap-3 text-left">
          <div className="flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-[#B8292F]" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#B8292F]">
              TASTING BELT SELECTION • {pad(index + 1)} / {pad(total)}
            </span>
          </div>

          <h3 id={titleId} className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#1A130E]">
            {item.name}
          </h3>

          {item.description && (
            <p className="text-[14.5px] leading-relaxed text-[#5C4D3C]">
              {item.description}
            </p>
          )}

          {item.details && item.details.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {item.details.map((detail: string) => (
                <span
                  key={detail}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#F6F1EA] px-3.5 py-1 font-mono text-[11px] font-medium text-[#4D3F32]"
                >
                  <span className="size-1 rounded-full bg-[#B8292F]/60" />
                  {detail}
                </span>
              ))}
            </div>
          )}

          {/* Action Row */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4 border-t border-[rgba(26,19,14,0.08)] pt-4">
            <div>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-[#847260]">Origin & Craft</span>
              <span className="font-serif text-2xl font-bold text-[#B8292F]">{item.price}</span>
            </div>

            <button
              type="button"
              onClick={add}
              className="inline-flex items-center gap-2.5 rounded-full bg-[#B8292F] px-6 py-2.5 font-sans text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_8px_20px_rgba(184,41,47,0.22)] transition hover:bg-[#8F1A20] active:scale-95"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {added ? "Added to Box" : labels.add}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

const PARLE_BELT_CREATIONS: ConveyorDish[] = [
  {
    id: "parle-g-gold",
    name: "Parle-G Gold",
    price: "Est. 1939",
    tier: 1,
    description: "Sun-ripened Indian wheat and skimmed milk baked to a rich, malted golden crisp. The world's #1 selling biscuit.",
    details: ["Golden Wheat", "Skimmed Milk", "#1 Global Icon"],
    image: "assets/parle-g-white-intact.jpg",
  },
  {
    id: "hide-and-seek",
    name: "Hide & Seek Milano",
    price: "Est. 1996",
    tier: 4,
    description: "India's premier moulded dark cocoa cookie with diagonal fluted ridges and rich Belgian-style chocolate chips.",
    details: ["Dark Choco Chips", "Diagonal Ridges", "Platina Reserve"],
    image: "assets/hideseek-white-3d.jpg",
  },
  {
    id: "melody-chocolaty",
    name: "Melody Chocolaty",
    price: "Est. 1983",
    tier: 3,
    description: "Slow-cooked golden butterscotch caramel shell encasing a dense, velvety dark chocolate truffle core.",
    details: ["Caramel Shell", "Cocoa Ganache", "Dual Core"],
    image: "assets/melody-white-3d.jpg",
  },
  {
    id: "parle-monaco",
    name: "Monaco Classic",
    price: "Est. 1942",
    tier: 2,
    description: "Eighteen-fold flaky laminated golden cracker finished with coarse sea-salt crystals for high-tea canapes.",
    details: ["18-Fold Puff", "Oven Salted", "Cocktail Cracker"],
    image: "assets/monaco-white-3d.jpg",
  },
  {
    id: "kaccha-mango-bite",
    name: "Kaccha Mango Bite",
    price: "Est. 1929",
    tier: 5,
    description: "Translucent emerald-green spun sugar jewel capturing the sharp, unmistakable tang of raw Indian Kairi mangoes.",
    details: ["Raw Kairi Tang", "Spun Sugar", "1929 Sweethouse"],
    image: "assets/mango-white-3d.jpg",
  },
  {
    id: "parle-krackjack",
    name: "Krackjack Sweet & Salty",
    price: "Est. 1972",
    tier: 2,
    description: "The original sweet-and-salty crispy cracker balancing delicate sugar glaze with flaky salted layers.",
    details: ["Sweet & Salty", "Crispy Cracker", "Tea-Time Classic"],
    image: "assets/monaco-white-3d.jpg",
  },
  {
    id: "parle-g-layers",
    name: "Parle-G Artisan Bake",
    price: "Est. 1939",
    tier: 1,
    description: "Four layers of thermodynamic baking perfection: embossed seal, 26-point scalloped rim, and honeycomb crumb.",
    details: ["26 Scallops", "16 Docker Vents", "3.2s Chai Dip"],
    image: "assets/parle-g-white-exploded.jpg",
  },
  {
    id: "platina-choco-reserve",
    name: "Platina Dark Choco",
    price: "Est. 2004",
    tier: 4,
    description: "Double-roasted cocoa shortbread studded with generous dark chocolate chunks from the House of Parle Platina line.",
    details: ["Artisan Cocoa", "Platina Division", "Small Batch"],
    image: "assets/hideseek-white-3d.jpg",
  },
];

const PARLE_BELT_LEGEND = {
  1: "Parle-G Heritage",
  2: "Savory Crackers",
  3: "Caramel Toffee",
  4: "Platina Cocoa",
  5: "Orchard Candy",
};

function ParleConveyorApp() {
  const [count, setCount] = React.useState(0);
  const [flash, setFlash] = React.useState(false);
  const timer = React.useRef(0);

  const add = () => {
    setCount((n) => n + 1);
    setFlash(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setFlash(false), 2400);
  };

  return (
    <div
      className="relative flex w-full items-center justify-center bg-white"
      style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", margin: "0 auto" }}
    >
      <SushiConveyorMenu
        items={PARLE_BELT_CREATIONS}
        legend={PARLE_BELT_LEGEND}
        eyebrow="03 / LIVE BAKERY CONVEYOR BELT"
        heading="The Parle Tasting Belt, turning fresh from the ovens."
        caption="Hover any plate to pause the belt, drag to spin it, or click a Parle creation to inspect."
        autoplay={true}
      />
    </div>
  );
}

const rootEl = document.getElementById("parle-conveyor-root");
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(<ParleConveyorApp />);
}
