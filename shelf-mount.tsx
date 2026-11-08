/* ==========================================================================
   LIVE BROWSER MOUNT FOR SHADCN PRODUCT-SHELF WITH 12 PARLE-G & PARLE CREATIONS
   Mounted right after the "Four Layers of Perfection" (#anatomy) section
   ========================================================================== */

(() => {
  const { useState, useEffect, useRef, useId } = React;
  const { createPortal } = ReactDOM;

  function cn(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  function IconShoppingBag({ className = "size-5", strokeWidth = 1.6 }) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    );
  }

  function IconChevronLeft({ className = "size-4", strokeWidth = 2.2 }) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m15 18-6-6 6-6" />
      </svg>
    );
  }

  function IconChevronDown({ className = "size-4", strokeWidth = 2 }) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m6 9 6 6 6-6" />
      </svg>
    );
  }

  function IconMinus({ className = "size-4" }) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M5 12h14" />
      </svg>
    );
  }

  function IconPlus({ className = "size-4" }) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </svg>
    );
  }

  function IconStar({ className = "size-3.5", fill = "transparent", strokeWidth = 1.4 }) {
    return (
      <svg viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    );
  }

  const DEFAULT_PARLE_PRODUCTS = [
    // Shelf I - The Biscuit Legends
    {
      id: "parle-g",
      name: "Parle-G Original",
      short: "Parle-G",
      sub: "Original Gluco Biscuit",
      category: "The Global Icon",
      price: 10,
      sizes: ["250 g Pack", "800 g Family Pack"],
      image: "assets/shelf-products/parle-g.png?v=60",
      rating: 4.9,
      reviews: 64820,
      tagline: "The world's #1 selling glucose biscuit with sun-ripened wheat and milk.",
      description: "First baked in Vile Parle in 1939. Stamped with the iconic Parle-G girl and 16 steam-release docker holes, it brings morning warmth to over 1.4 billion people.",
      benefits: ["Wholesome wheat & milk nourishment", "3.2s warm chai absorption", "India's eternal tea-time companion"],
      ingredients: "Refined Wheat Flour, Sugar, Edible Vegetable Oil, Invert Sugar Syrup, Milk Solids, Iodized Salt.",
      howTo: "Dunk into hot cutting chai for 3.2 seconds or enjoy straight from the pack.",
    },
    {
      id: "parle-gold",
      name: "Parle-G Gold Reserve",
      short: "Parle-G Gold",
      sub: "Thicker & Crispier",
      category: "Gold Reserve",
      price: 20,
      sizes: ["200 g Pack", "500 g Tin"],
      image: "assets/shelf-products/parle-gold.png?v=60",
      rating: 4.9,
      reviews: 38200,
      tagline: "Heavier, richer, and slow-baked to a deep caramelized crunch.",
      description: "An elevated golden expression of classic Parle-G with extra milk solids, a richer caramelized crust, and a denser crumb snap.",
      benefits: ["Extra milk & honeyed malt", "Thick-cut golden slab", "Rich caramelized butter finish"],
      ingredients: "Wheat Flour, Sugar, Clarified Butterfat, Skimmed Milk Powder, Honey Malt Extract, Raising Agents.",
      howTo: "Pair with artisanal Assam tea or enjoy as an afternoon treat.",
    },
    {
      id: "monaco",
      name: "Monaco Classic",
      short: "Monaco",
      sub: "Salted Cocktail Cracker",
      category: "Salted Cracker",
      price: 15,
      sizes: ["200 g Pack", "400 g Party Box"],
      image: "assets/shelf-products/monaco.png?v=60",
      rating: 4.8,
      reviews: 28400,
      tagline: "Light, crispy, and lightly salted round golden crackers.",
      description: "Baked with 18 delicate flaky puff laminations and dusted with mineral sea-salt crystals. The quintessential high-tea and canapé party cracker.",
      benefits: ["18-fold flaky laminated crunch", "Coarse sea-salt crystal seasoning", "Perfect base for cheese & dips"],
      ingredients: "Wheat Flour, Vegetable Fat, Sugar, Invert Syrup, Salt, Leavening Agents, Yeast.",
      howTo: "Top with mint chutney, cheese cubes, or relish with evening tea.",
    },
    {
      id: "krackjack",
      name: "Krackjack Original",
      short: "Krackjack",
      sub: "Sweet & Salty Cracker",
      category: "Crisp Cracker",
      price: 20,
      sizes: ["200 g Pack", "450 g Family Pack"],
      image: "assets/shelf-products/krackjack.png?v=60",
      rating: 4.9,
      reviews: 34100,
      tagline: "India's first and favourite sweet-and-salty cracker since 1972.",
      description: "The legendary dual-taste cracker that balances golden caramelized sweetness with delicate savory salt flakes in every single bite.",
      benefits: ["Unique sweet & salty balance", "Ultra-crispy multi-layered snap", "Iconic since 1972"],
      ingredients: "Wheat Flour, Edible Vegetable Oil, Sugar, Salt, Liquid Glucose, Milk Solids.",
      howTo: "Enjoy with a steaming cup of ginger chai or as a light midday bite.",
    },

    // Shelf II - Cookies & Cream
    {
      id: "hide-seek",
      name: "Hide & Seek Milano",
      short: "Hide & Seek",
      sub: "Real Chocolate Chip Cookie",
      category: "Platina Reserve",
      price: 35,
      sizes: ["120 g Pack", "350 g Reserve Tin"],
      image: "assets/shelf-products/hide-seek.png?v=60",
      rating: 4.9,
      reviews: 42900,
      tagline: "Rich dark cocoa biscuits studded with melt-in-mouth chocolate chips.",
      description: "Crafted with dark Dutch cocoa dough and loaded with decadent chocolate chips. Stamped with diagonal fluted ridges for an exquisite chocolate experience.",
      benefits: ["Real Belgian-style dark choco chips", "Intense Dutch cocoa roast", "Signature diagonal fluted ridges"],
      ingredients: "Refined Wheat Flour, Sugar, Chocolate Chips (22%), Edible Vegetable Oil, Cocoa Solids, Invert Syrup.",
      howTo: "Pair with cold milk, espresso, or warm slightly for molten chocolate chips.",
    },
    {
      id: "bourbon",
      name: "Fab! Bourbon",
      short: "Fab! Bourbon",
      sub: "Chocolate Cream Sandwich",
      category: "Cream Sandwich",
      price: 30,
      sizes: ["150 g Pack", "300 g Double Pack"],
      image: "assets/shelf-products/bourbon.png?v=60",
      rating: 4.8,
      reviews: 19800,
      tagline: "Crunchy cocoa biscuits sprinkled with sparkling sugar crystals and rich chocolate fudge cream.",
      description: "An indulgent chocolate cream sandwich biscuit featuring dual crunchy biscuits sprinkled with crystal sugar and layered with velvety chocolate cream.",
      benefits: ["Rich chocolate fudge filling", "Sparkling crystal sugar crust", "Melt-in-mouth cocoa indulgence"],
      ingredients: "Wheat Flour, Sugar, Vegetable Fat, Cocoa Powder, Starch, Milk Solids, Chocolate Flavor.",
      howTo: "Twist open, lick the rich chocolate cream, and crunch the biscuit.",
    },
    {
      id: "marie",
      name: "Parle Marie",
      short: "Parle Marie",
      sub: "Traditional Tea Biscuit",
      category: "Tea Companion",
      price: 25,
      sizes: ["250 g Pack", "500 g Value Pack"],
      image: "assets/shelf-products/marie.png?v=60",
      rating: 4.8,
      reviews: 22100,
      tagline: "Crisp, wholesome tea biscuits with a delicate hint of warm milk and vanilla.",
      description: "The timeless companion for afternoon tea. Light, wholesome, and delicately baked for that perfect tea dip without crumbling.",
      benefits: ["Low calorie tea companion", "Wholesome wheat & milk", "Crisp non-crumble snap"],
      ingredients: "Wheat Flour, Sugar, Vegetable Oil, Milk Solids, Malt Extract, Invert Syrup.",
      howTo: "Dip gently into English breakfast or Earl Grey tea.",
    },
    {
      id: "20-20",
      name: "Parle 20-20 Butter Cookies",
      short: "20-20 Cookies",
      sub: "Butter & Cashew Cookies",
      category: "Artisan Cookie",
      price: 20,
      sizes: ["200 g Pack", "400 g Sharing Pack"],
      image: "assets/shelf-products/20-20.png?v=60",
      rating: 4.8,
      reviews: 31200,
      tagline: "Golden baked cookies enriched with creamy butter and crunchy roasted cashews.",
      description: "Melt-in-the-mouth butter cookies packed with real roasted cashew nuts. Warmly spiced and baked golden brown.",
      benefits: ["Rich creamy dairy butter", "Roasted cashew nut chunks", "Golden short-crumb melt"],
      ingredients: "Refined Wheat Flour, Sugar, Edible Vegetable Oil, Butter (4%), Cashew Bits, Milk Solids.",
      howTo: "Serve with hot filter coffee or masala tea.",
    },

    // Shelf III — Confectionery & Savory Treats
    {
      id: "happy-happy",
      name: "Happy Happy Choco Cookies",
      short: "Happy Happy",
      sub: "Choco Chip Delight",
      category: "Joy Cookies",
      price: 10,
      sizes: ["100 g Pack", "250 g Fun Pack"],
      image: "assets/shelf-products/happy-happy.png?v=60",
      rating: 4.7,
      reviews: 17400,
      tagline: "Cheery cookies loaded with chocolate chips for everyday happiness.",
      description: "Crunchy golden cookies studded with fun chocolate chips that bring a smile with every single bite.",
      benefits: ["Generous chocolate chips", "Crispy golden bite", "Everyday joyful snack"],
      ingredients: "Wheat Flour, Sugar, Vegetable Oil, Choco Chips, Cocoa Powder, Leavening Agents.",
      howTo: "Great for lunchboxes, quick breaks, and milk pairing.",
    },
    {
      id: "nice",
      name: "Parle Nice",
      short: "Parle Nice",
      sub: "Coconut & Sugar Crystals",
      category: "Coconut Biscuit",
      price: 20,
      sizes: ["150 g Pack", "300 g Double Pack"],
      image: "assets/shelf-products/nice.png?v=60",
      rating: 4.8,
      reviews: 24300,
      tagline: "Fragrant toasted coconut biscuits sprinkled with shimmering crystal sugar.",
      description: "Crispy golden biscuits infused with natural desiccated coconut flakes and topped with glistening sugar granules.",
      benefits: ["Real toasted coconut flakes", "Crisp sugar-dusted crust", "Tropical tea-time delight"],
      ingredients: "Wheat Flour, Sugar, Vegetable Fat, Desiccated Coconut, Raising Agents, Salt.",
      howTo: "Enjoy alongside warm spiced chai or filter coffee.",
    },
    {
      id: "fulltoss",
      name: "FullToss Masala",
      short: "FullToss",
      sub: "Crunchy Masala Corn Puffs",
      category: "Savory Snack",
      price: 10,
      sizes: ["80 g Pouch", "Family Share"],
      image: "assets/shelf-products/fulltoss.png?v=60",
      rating: 4.7,
      reviews: 14200,
      tagline: "Bold, tangy, and bursting with Indian spices on puffed golden corn.",
      description: "Crispy puffed corn extrusions tossed in an explosion of chatpata desi spices, amchur, and roasted cumin.",
      benefits: ["100% roasted corn puffs", "Authentic chatpata spice blend", "Zero trans fat crunch"],
      ingredients: "Corn Meal, Rice Meal, Edible Vegetable Oil, Desi Spice Mix (Chilli, Amchur, Cumin), Salt.",
      howTo: "Toss into a bowl for movie nights or midday tea-time crunch.",
    },
    {
      id: "melody",
      name: "Melody Chocolaty",
      short: "Melody",
      sub: "Caramel & Choco Truffle",
      category: "Heritage Toffee",
      price: 20,
      sizes: ["Party Pack (100 pcs)", "Tin Box"],
      image: "assets/shelf-products/melody.png?v=60",
      rating: 4.9,
      reviews: 68900,
      tagline: "Melody itni chocolaty kyun hai? Golden caramel shell with a decadent chocolate core.",
      description: "India's ultimate confectionery riddle. A crunchy golden caramel outer shell that gives way to a velvety dark chocolate ganache center.",
      benefits: ["Dual-layer candy architecture", "Velvety dark chocolate core", "Iconic golden caramel shell"],
      ingredients: "Sugar, Liquid Glucose, Cocoa Solids (8%), Milk Solids, Vegetable Oil, Natural Vanilla.",
      howTo: "Crack the crisp caramel shell and relish the molten chocolate rush.",
    },
  ];

  const hexRgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mixRgb = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const css = (c, k = 1, a = 1) => `rgba(${[0, 1, 2].map((i) => Math.round(Math.min(255, Math.max(0, c[i] * k)))).join(",")},${a})`;
  const WHITE = [255, 255, 255];
  const lum = (c) => c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11;

  const rr = (x, y, w, h, r) =>
    `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;

  const ridges = (x, y, w, h, step = 2.6) =>
    Array.from({ length: Math.floor(w / step) }, (_, i) => (
      <line key={i} x1={x + 1 + i * step} y1={y + 1.5} x2={x + 1 + i * step} y2={y + h - 1.5} stroke="#000" strokeOpacity={i % 2 ? 0.14 : 0.06} strokeWidth="1" />
    ));

  const SHAPES = {
    // 1. jar: Vintage Parle-G Embossed Biscuit Tin Canister
    jar: {
      body: "M42 208 H158 Q162 208 162 214 V276 Q162 286 150 286 H50 Q38 286 38 276 V214 Q38 208 42 208 Z",
      box: { x: 38, y: 208, w: 124, h: 78 },
      print: { x: 38, y: 226, w: 124, h: 46 },
      cap: (id) => (
        <g>
          <path d={rr(36, 172, 128, 38, 6)} fill={`url(#${id}-cap)`} />
          <g>{ridges(36, 178, 128, 30, 2.2)}</g>
          <path d={rr(36, 172, 128, 38, 6)} fill={`url(#${id}-capv)`} />
          <path d="M42 173.2 H158" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.2" />
          <rect x="38" y="208" width="124" height="3" fill="#000" opacity="0.22" />
        </g>
      ),
    },

    // 2. vault: Wide Parle-G Gold / Centenary Biscuit Gift Box & Vault
    vault: {
      body: "M40 186 H160 Q164 186 164 192 V274 Q164 286 150 286 H50 Q36 286 36 274 V192 Q36 186 40 186 Z",
      box: { x: 36, y: 186, w: 128, h: 100 },
      print: { x: 36, y: 204, w: 128, h: 64 },
      cap: (id) => (
        <g>
          <path d={rr(34, 152, 132, 36, 5)} fill={`url(#${id}-cap)`} />
          <g>{ridges(34, 158, 132, 28, 2.5)}</g>
          <path d={rr(34, 152, 132, 36, 5)} fill={`url(#${id}-capv)`} />
          <path d="M38 153.5 H162" stroke="#fff" strokeOpacity="0.8" strokeWidth="1.4" />
          <rect x="36" y="186" width="128" height="3.5" fill="#000" opacity="0.25" />
        </g>
      ),
    },

    // 3. caddy: Tall Parle-G Tea & Biscuit Canister / Cookie Caddy
    caddy: {
      body: "M52 110 H148 Q152 110 152 116 V274 Q152 286 140 286 H60 Q48 286 48 274 V116 Q48 110 52 110 Z",
      box: { x: 48, y: 110, w: 104, h: 176 },
      print: { x: 48, y: 146, w: 104, h: 100, paper: true },
      cap: (id) => (
        <g>
          <path d={rr(44, 76, 112, 36, 6)} fill={`url(#${id}-cap)`} />
          <g>{ridges(44, 82, 112, 28, 2.4)}</g>
          <path d={rr(44, 76, 112, 36, 6)} fill={`url(#${id}-capv)`} />
          <path d="M48 77.5 H152" stroke="#fff" strokeOpacity="0.75" strokeWidth="1.2" />
          <rect x="48" y="110" width="104" height="3" fill="#000" opacity="0.2" />
        </g>
      ),
    },

    // 4. pack: Iconic Rectangular Parle-G Biscuit Block Pack
    pack: {
      body: "M44 140 H156 Q160 140 160 148 V272 Q160 282 152 282 H48 Q40 282 40 272 V148 Q40 140 44 140 Z",
      box: { x: 40, y: 140, w: 120, h: 142 },
      print: { x: 40, y: 164, w: 120, h: 86 },
      cap: (id) => (
        <g>
          <path d={rr(38, 120, 124, 22, 3)} fill={`url(#${id}-cap)`} />
          {Array.from({ length: 24 }, (_, i) => (
            <line key={i} x1={40 + i * 5} y1="122" x2={40 + i * 5} y2="140" stroke="#000" strokeOpacity={i % 2 ? 0.12 : 0.05} strokeWidth="1.2" />
          ))}
          <path d={rr(38, 120, 124, 22, 3)} fill={`url(#${id}-capv)`} />
          <path d="M42 121.5 H158" stroke="#fff" strokeOpacity="0.8" strokeWidth="1" />
          <rect x="40" y="140" width="120" height="3" fill="#000" opacity="0.22" />
        </g>
      ),
    },
  };

  // Map legacy / alternative names to authentic biscuit packaging shapes
  SHAPES.perfume = SHAPES.vault;
  SHAPES.tube = SHAPES.pack;
  SHAPES.bottle = SHAPES.caddy;
  SHAPES.pump = SHAPES.caddy;
  SHAPES.dropper = SHAPES.jar;
  SHAPES.mist = SHAPES.vault;
  SHAPES.stick = SHAPES.pack;
  SHAPES.lip = SHAPES.pack;

  const EXTENT = {
    jar: { top: 172, w: 128 },
    vault: { top: 152, w: 132 },
    caddy: { top: 76, w: 112 },
    pack: { top: 120, w: 124 },
    perfume: { top: 152, w: 132 },
    tube: { top: 120, w: 124 },
    bottle: { top: 76, w: 112 },
    pump: { top: 76, w: 112 },
    dropper: { top: 172, w: 128 },
    mist: { top: 152, w: 132 },
    stick: { top: 120, w: 124 },
    lip: { top: 120, w: 124 },
  };
  const pageZoom = (k) => Math.min(2.2, 262 / (290 - EXTENT[k].top), 190 / EXTENT[k].w);

  function ProductArt({ p, spinValue = 0, className = "" }) {
    const spinDeg = (spinValue || 0) * 360;

    return (
      <div
        className={cn("relative flex items-end justify-center size-full pb-1 select-none", className)}
        style={{
          transform: `perspective(900px) rotateY(${spinDeg}deg)`,
          transformOrigin: "50% 90%",
          transition: "transform 0.08s linear",
        }}
      >
        {/* Soft Contact Drop Shadow on shelf */}
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[82%] h-[10px] rounded-[50%] bg-black/18 blur-[4px]"
        />

        {/* Real Product Pack Image cleanly isolated with no neighbor overlap */}
        <img
          src={p.image}
          alt={p.name}
          draggable={false}
          className="relative z-10 max-h-[110px] sm:max-h-[130px] md:max-h-[145px] max-w-full object-contain drop-shadow-[0_6px_12px_rgba(26,19,14,0.15)] transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    );
  }

  function ProductPage({ p, currency, onClose, onAdd, bagRef }) {
    const [spinVal, setSpinVal] = useState(0);
    const spinRef = useRef(0);
    const rafRef = useRef(0);
    const [size, setSize] = useState(p.sizes[0]);
    const [qty, setQty] = useState(1);
    const [added, setAdded] = useState(false);
    const [section, setSection] = useState("Details");
    const [entered, setEntered] = useState(false);
    const closeRef = useRef(null);
    const drag = useRef(null);

    const animateSpinTo = (target, velocity = 0, durationMs = 950) => {
      cancelAnimationFrame(rafRef.current);
      const startVal = spinRef.current;
      const startTime = performance.now();

      const tick = (now) => {
        const t = Math.min(1, (now - startTime) / durationMs);
        const ease = 1 - Math.pow(1 - t, 3);
        const next = startVal + (target - startVal) * ease + velocity * 0.08 * (1 - ease) * t;
        spinRef.current = next;
        setSpinVal(next);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          spinRef.current = target;
          setSpinVal(target);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    useEffect(() => {
      requestAnimationFrame(() => setEntered(true));
      closeRef.current?.focus({ preventScroll: true });
      const timer = window.setTimeout(() => {
        animateSpinTo(1, 0, 1100);
      }, 80);
      return () => {
        window.clearTimeout(timer);
        cancelAnimationFrame(rafRef.current);
      };
    }, []);

    const price = p.price * (p.sizes.indexOf(size) > 0 ? 1.7 : 1);
    const add = () => {
      onAdd(qty);
      setAdded(true);
      bagRef.current?.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.18)" }, { transform: "scale(1)" }],
        { duration: 320, easing: "ease-out" }
      );
      setTimeout(() => setAdded(false), 1800);
    };

    const onDown = (e) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      cancelAnimationFrame(rafRef.current);
      drag.current = { x: e.clientX, v: spinRef.current, samples: [{ x: e.clientX, t: e.timeStamp }] };
    };

    const onMove = (e) => {
      const d = drag.current;
      if (!d) return;
      const next = d.v - (e.clientX - d.x) / 380;
      spinRef.current = next;
      setSpinVal(next);
      d.samples.push({ x: e.clientX, t: e.timeStamp });
      if (d.samples.length > 5) d.samples.shift();
    };

    const onUp = () => {
      const d = drag.current;
      drag.current = null;
      if (!d) return;
      const first = d.samples[0];
      const last = d.samples[d.samples.length - 1];
      const vx = last.t > first.t ? ((last.x - first.x) / (last.t - first.t)) * 1000 : 0;
      const velocity = -vx / 380;
      const projected = spinRef.current + ((velocity / 1000) * 0.998) / (1 - 0.998);
      animateSpinTo(Math.round(projected), velocity, 900);
    };

    const sections = [
      [
        "Details",
        <ul key="d" className="list-disc space-y-1 pl-5">
          {p.benefits.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>,
      ],
      ["Ingredients", <p key="i">{p.ingredients}</p>],
      ["How to use", <p key="h">{p.howTo}</p>],
    ];

    return createPortal(
      <div role="dialog" aria-modal="true" aria-label={p.name} className="fixed inset-0 z-[950] overflow-y-auto font-sans text-[#111] antialiased">
        <div
          className={`fixed inset-0 bg-[#f3f1ed] transition-opacity duration-300 ${entered ? "opacity-100" : "opacity-0"}`}
          onClick={onClose}
        />
        <div className="relative mx-auto grid min-h-full max-w-[1080px] grid-cols-1 items-center gap-8 px-5 pt-20 pb-12 md:grid-cols-[1.05fr_1fr] md:gap-14">
          <div className="relative flex flex-col items-center justify-center md:h-[calc(100dvh-7rem)]">
            <div
              className="relative z-10 aspect-[2/3] h-[44vh] cursor-grab touch-none select-none active:cursor-grabbing md:h-[62vh]"
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
            >
              <div
                className="pointer-events-none size-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  transformOrigin: "50% 96.7%",
                  transform: `scale(${entered ? pageZoom(p.kind) : 1})`,
                }}
              >
                <ProductArt p={p} spinValue={spinVal} className="size-full" />
              </div>
            </div>
            <div
              aria-hidden
              className={`relative -mt-[1.5%] h-[18px] w-[86%] rounded-[3px] bg-[linear-gradient(to_bottom,#ffffff,#ececf0)] shadow-[0_18px_40px_-12px_rgba(0,0,0,0.18)] transition-opacity duration-300 ${
                entered ? "opacity-100" : "opacity-0"
              }`}
            />
            <p className="mt-6 font-mono text-[12px] uppercase tracking-[0.16em] text-[#8f8982]">Drag to turn 360°</p>
          </div>

          <div
            className={`relative z-20 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              entered ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
            }`}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="-ml-1.5 mb-6 inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[15px] font-medium text-[#111111] underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-[#111111]"
            >
              <IconChevronLeft className="size-4" strokeWidth={2.2} /> Back to Parle Shelf
            </button>
            <div className="font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-[#B8292F]">{p.category}</div>
            <h2 className="mt-1 font-serif text-[clamp(30px,4vw,42px)] leading-[1.08] font-semibold tracking-[-0.02em] text-[#1A130E]">
              {p.name}
            </h2>
            <p className="mt-2 text-[18px] leading-snug text-[#6f6a64]">{p.tagline}</p>
            <div className="mt-3 flex items-center gap-1.5 text-[14px] text-[#6f6a64]">
              <span className="flex text-[#B8292F]" aria-label={`Rated ${p.rating} out of 5`}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <IconStar key={i} className="size-[14px]" fill={i < Math.round(p.rating) ? "#B8292F" : "transparent"} strokeWidth={1.4} />
                ))}
              </span>
              {p.rating.toFixed(1)} · {p.reviews.toLocaleString()} ratings
            </div>

            <div className="mt-6 flex items-baseline gap-2.5 tabular-nums">
              <span className="text-[26px] font-semibold tracking-[-0.01em] text-[#1A130E]">
                {currency}
                {price.toFixed(0)}
              </span>
              {p.compareAt && (
                <span className="text-[17px] text-[#8f8982] line-through">
                  {currency}
                  {(p.compareAt * (price / p.price)).toFixed(0)}
                </span>
              )}
            </div>
            <p className="mt-4 max-w-[54ch] text-[16px] leading-[1.55] text-[#111111]/85">{p.description}</p>

            <fieldset className="mt-7">
              <legend className="mb-2.5 text-[16px] font-semibold tracking-[-0.01em]">Pack Size</legend>
              <div className="grid grid-cols-2 gap-2.5">
                {p.sizes.map((sz, i) => {
                  const on = size === sz;
                  return (
                    <label
                      key={sz}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-xl border bg-white px-4 py-3.5 text-[15px] transition-[border-color,box-shadow] duration-150",
                        on ? "border-[#B8292F] shadow-[0_0_0_1px_#B8292F]" : "border-[#d9d4cd] hover:border-[#8f8982]"
                      )}
                    >
                      <input type="radio" name="size" value={sz} checked={on} onChange={() => setSize(sz)} className="sr-only" />
                      <span className="font-medium">{sz}</span>
                      <span className="text-[#6f6a64] tabular-nums">
                        {currency}
                        {(p.price * (i > 0 ? 1.7 : 1)).toFixed(0)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-7 flex items-stretch gap-3">
              <div className="flex items-center rounded-xl border border-[#d9d4cd] bg-white">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid h-full w-11 cursor-pointer place-items-center rounded-l-xl text-[#111111] transition-colors active:bg-black/[0.06] disabled:text-[#d9d4cd]"
                  disabled={qty === 1}
                >
                  <IconMinus className="size-4" />
                </button>
                <span className="w-7 text-center text-[17px] tabular-nums" aria-live="polite">
                  {qty}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => Math.min(9, q + 1))}
                  className="grid h-full w-11 cursor-pointer place-items-center rounded-r-xl text-[#111111] transition-colors active:bg-black/[0.06]"
                >
                  <IconPlus className="size-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={add}
                className="h-12 flex-1 cursor-pointer rounded-[10px] bg-[#B8292F] text-[15px] font-semibold tracking-[0.04em] uppercase text-white transition-[background-color,transform] duration-100 hover:bg-[#1A130E] active:scale-[0.98]"
              >
                <span aria-live="polite">{added ? "Added to Tasting Bag" : "Add to Tasting Bag"}</span>
              </button>
            </div>

            <dl className="mt-6 grid gap-1 text-[14px] leading-snug">
              <div className="flex gap-2">
                <dt className="font-semibold">Bakery Dispatch:</dt>
                <dd className="text-[#6f6a64]">Fresh from Vile Parle ovens, arrives in 2 to 3 days</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold">Heritage Seal:</dt>
                <dd className="text-[#6f6a64]">100% Vegetarian • House of Parle Est. 1929</dd>
              </div>
            </dl>

            <div className="mt-8 border-t border-[#d9d4cd]">
              {sections.map(([title, body]) => {
                const isOpen = section === title;
                return (
                  <div key={title} className="border-b border-[#d9d4cd]">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setSection(isOpen ? null : title)}
                      className="flex w-full cursor-pointer items-center justify-between py-4 text-left text-[17px] font-semibold tracking-[-0.01em]"
                    >
                      {title}
                      <IconChevronDown className={cn("size-[18px] text-[#6f6a64] transition-transform duration-300", isOpen && "rotate-180")} />
                    </button>
                    {isOpen && <div className="pb-5 text-[15px] leading-relaxed text-[#111111]/80">{body}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  function ProductShelf({ products = DEFAULT_PARLE_PRODUCTS, currency = "₹", className = "" }) {
    const [openId, setOpenId] = useState(null);
    const [bag, setBag] = useState(0);
    const [bump, setBump] = useState(0);
    const bagRef = useRef(null);
    const rows = [products.slice(0, 4), products.slice(4, 8), products.slice(8, 12)];
    const rowTitles = [
      "Shelf I — The Biscuit Legends",
      "Shelf II — Cookie & Cream Classics",
      "Shelf III — Confectionery & Savory Treats",
    ];
    const open = products.find((p) => p.id === openId) ?? null;

    useEffect(() => {
      const t = window.setTimeout(() => {
        if (window.ScrollTrigger) {
          window.ScrollTrigger.refresh();
        }
      }, 120);
      return () => window.clearTimeout(t);
    }, []);

    useEffect(() => {
      if (!openId) return;
      const onKey = (e) => e.key === "Escape" && setOpenId(null);
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [openId]);

    const addToBag = (qty) => {
      setBag((b) => b + qty);
      setBump((n) => n + 1);
    };

    return (
      <div className={cn("relative w-full overflow-x-hidden bg-[#f3f1ed] py-20 font-sans text-[#111] antialiased flex flex-col items-center", className)}>
        {/* Centered Section Header */}
        <div className="relative mx-auto flex flex-col items-center text-center max-w-[840px] px-5 pb-8 w-full">
          <span className="eyebrow mx-auto text-center">02 / HOUSE OF PARLE PANTRY</span>
          <h2 className="display-heading text-center" style={{ fontSize: "clamp(2.2rem, 4.2vw, 3.8rem)" }}>
            The House of Parle <em>Shelf</em>
          </h2>

          <button
            ref={bagRef}
            type="button"
            aria-label={`Bag, ${bag} ${bag === 1 ? "item" : "items"}`}
            className="absolute top-2 right-4 grid size-12 cursor-pointer place-items-center rounded-xl bg-white text-[#111111] shadow-[0_2px_12px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.06] transition-[transform,background-color] duration-100 hover:bg-white active:scale-[0.94]"
          >
            <IconShoppingBag className="size-[20px]" strokeWidth={1.6} />
            {bag > 0 && (
              <span
                key={bump}
                className="absolute -top-1.5 -right-1.5 grid h-[20px] min-w-[20px] place-items-center rounded-full bg-[#B8292F] px-1 text-[11px] font-bold text-white tabular-nums"
              >
                {bag}
              </span>
            )}
          </button>
        </div>

        {/* Centered Shelves Container */}
        <div className="mx-auto w-full max-w-[1140px] px-6 pb-10 flex flex-col items-center">
          {rows.map((row, r) => (
            <section key={r} aria-label={rowTitles[r]} className="relative mb-20 last:mb-6 w-full max-w-[1080px] mx-auto text-center">
              {/* Shelf Title */}
              <div className="mb-5 text-center font-mono text-[11.5px] font-bold uppercase tracking-[0.25em] text-[#847260]">
                {rowTitles[r]}
              </div>

              {/* 4 Products resting on the shelf */}
              <div className="relative z-10 grid grid-cols-2 items-end justify-items-center gap-6 px-4 sm:grid-cols-4 sm:gap-10 sm:px-8">
                {row.map((p) => (
                  <div key={p.id} className="flex flex-col items-center w-full">
                    {openId === p.id ? (
                      <div className="h-[120px] sm:h-[140px] md:h-[155px] w-full max-w-[210px]" />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setOpenId(p.id)}
                        aria-label={`${p.name}, ${currency}${p.price}`}
                        className="group relative h-[120px] sm:h-[140px] md:h-[155px] w-full max-w-[210px] cursor-pointer rounded-xl outline-none transition-transform duration-300 hover:-translate-y-2 focus-visible:ring-2 focus-visible:ring-[#111111] flex items-end justify-center"
                      >
                        <ProductArt p={p} className="size-full" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Floating Shelf Bar */}
              <div aria-hidden className="relative -mt-[4px] h-[18px] w-full">
                <div className="absolute inset-x-0 top-0 h-[8px] bg-[linear-gradient(to_bottom,#d5d5dc,#fbfbfd)] rounded-[2px]" />
                <div className="absolute inset-x-0 top-[8px] h-[8px] bg-[linear-gradient(to_bottom,#ffffff,#ececf0)] shadow-[0_2px_4px_rgba(0,0,0,0.06)]" />
                <div className="absolute inset-x-[2%] top-[16px] h-[32px] bg-[radial-gradient(50%_100%_at_50%_0%,rgba(0,0,0,0.12),transparent)]" />
              </div>

              {/* Product Labels Below the Shelf */}
              <div className="mt-5 grid grid-cols-2 justify-items-center gap-6 px-4 sm:grid-cols-4 sm:gap-10 sm:px-8 text-center">
                {row.map((p) => (
                  <div key={p.id} className="text-center flex flex-col items-center">
                    <div className="text-[14px] leading-tight font-semibold text-[#1A130E] sm:text-[15px]">{p.short}</div>
                    <div className="mt-1 text-[11.5px] text-[#6f6a64]">{p.sub}</div>
                    <div className="mt-1 font-mono text-[12.5px] font-bold text-[#B8292F] tabular-nums">
                      {currency}{p.price}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {open && (
          <ProductPage
            p={open}
            currency={currency}
            onClose={() => setOpenId(null)}
            onAdd={addToBag}
            bagRef={bagRef}
          />
        )}
      </div>
    );
  }

  const shelfRootEl = document.getElementById("parle-shelf-root");
  if (shelfRootEl) {
    const shelfRoot = ReactDOM.createRoot(shelfRootEl);
    shelfRoot.render(<ProductShelf />);
  }
})();
  