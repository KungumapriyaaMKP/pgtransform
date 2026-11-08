/* ==========================================================================
   LIVE BROWSER MOUNT FOR SHADCN 3D-TESTIMONIALS MARQUEE (PARLE GLOBAL REVIEWS)
   ========================================================================== */

(() => {
  const { useRef, useMemo, useEffect } = React;

  function cn(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  function Marquee({
    className = "",
    reverse = false,
    pauseOnHover = false,
    children,
    vertical = false,
    repeat = 4,
    ariaLabel,
    ariaLive = "off",
    ariaRole = "marquee",
  }) {
    const marqueeRef = useRef(null);

    return (
      <div
        ref={marqueeRef}
        data-slot="marquee"
        className={cn(
          "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
          !vertical ? "flex-row" : "flex-col",
          className
        )}
        aria-label={ariaLabel}
        aria-live={ariaLive}
        role={ariaRole}
        tabIndex={0}
      >
        {useMemo(
          () => (
            <React.Fragment>
              {Array.from({ length: repeat }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    !vertical ? "flex-row [gap:var(--gap)]" : "flex-col [gap:var(--gap)]",
                    "flex shrink-0 justify-around",
                    !vertical && "animate-marquee flex-row",
                    vertical && "animate-marquee-vertical flex-col",
                    pauseOnHover && "group-hover:[animation-play-state:paused]",
                    reverse && "[animation-direction:reverse]"
                  )}
                >
                  {children}
                </div>
              ))}
            </React.Fragment>
          ),
          [repeat, children, vertical, pauseOnHover, reverse]
        )}
      </div>
    );
  }

  const PARLE_REVIEWS = [
    {
      name: "Aarav Sharma",
      username: "@aarav_mumbai",
      product: "Parle-G Original 1939",
      body: "Nothing beats dipping Parle-G into hot adrak chai during Mumbai monsoons. Pure childhood magic!",
      img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80",
      country: "🇮🇳 India",
    },
    {
      name: "Priya Nair",
      username: "@priya_london",
      product: "Parle-G Gold Reserve",
      body: "Finding a fresh tin of Parle-G Gold in London instantly transports me home to Vile Parle.",
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80",
      country: "🇬🇧 UK",
    },
    {
      name: "Rohan Desai",
      username: "@rohan_nyc",
      product: "Hide & Seek Milano",
      body: "Hide & Seek Milano and Melody Chocolaty are undefeated. The 28% dark choco chips are perfection!",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80",
      country: "🇺🇸 USA",
    },
    {
      name: "Ananya Iyer",
      username: "@ananya_blr",
      product: "Parle-G & Filter Kaapi",
      body: "Three generations of our family have started every single morning with Parle-G and filter coffee.",
      img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80",
      country: "🇮🇳 India",
    },
    {
      name: "Zayd Al-Mansoor",
      username: "@zayd_dubai",
      product: "Parle-G Gluco",
      body: "Parle-G with karak chai is a daily ritual across Dubai. Crisp, malted, and timeless since 1939.",
      img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80",
      country: "🇦🇪 UAE",
    },
    {
      name: "Meera Krishnan",
      username: "@meera_syd",
      product: "Kaccha Mango & Kismi",
      body: "Kaccha Mango Bite and Kismi Elaichi toffees in the Heritage Tin made the best Diwali gift in Sydney!",
      img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80",
      country: "🇦🇺 Australia",
    },
    {
      name: "Kabir Verma",
      username: "@kabir_tor",
      product: "Monaco Salted 1942",
      body: "Monaco topped with masala cheese and sev is still our #1 game-night canapé in Toronto!",
      img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80",
      country: "🇨🇦 Canada",
    },
    {
      name: "Elena Rossi",
      username: "@elena_milan",
      product: "Parle-G Royale",
      body: "Tried Parle-G Royale with espresso, the caramelized wheat and pure milk crumb is extraordinary!",
      img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=160&auto=format&fit=crop&q=80",
      country: "🇮🇹 Italy",
    },
    {
      name: "Kenji Takahashi",
      username: "@kenji_tokyo",
      product: "Parle-G Gold",
      body: "The 26-point scalloped rim and honeycomb texture absorb matcha lattes in seconds. Genius bake!",
      img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&auto=format&fit=crop&q=80",
      country: "🇯🇵 Japan",
    },
  ];

  function TestimonialCard({ img, name, username, product, body, country }) {
    return (
      <div className="w-[260px] rounded-xl border border-[rgba(181,115,25,0.25)] bg-white p-4 text-[#1A130E] shadow-[0_10px_28px_rgba(26,19,14,0.06)]">
        <div className="flex items-center gap-3">
          <div className="relative flex size-10 shrink-0 overflow-hidden rounded-full border border-[rgba(181,115,25,0.3)] bg-[#F3EDE2]">
            <img src={img} alt={name} className="aspect-square size-full object-cover" loading="lazy" />
          </div>
          <div className="flex flex-col">
            <figcaption className="flex items-center gap-1.5 text-sm font-semibold text-[#1A130E]">
              {name} <span className="text-xs font-normal">{country}</span>
            </figcaption>
            <p className="font-mono text-[11px] text-[#847260]">{username}</p>
          </div>
        </div>
        <div className="mt-2.5 inline-block rounded-full bg-[#FAF7F2] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#B8292F]">
          ★ {product}
        </div>
        <blockquote className="mt-2 text-[13.5px] leading-relaxed text-[#4D3F32]">"{body}"</blockquote>
      </div>
    );
  }

  function ParleTestimonialsSection() {
    useEffect(() => {
      const t = window.setTimeout(() => {
        if (window.ScrollTrigger) {
          window.ScrollTrigger.refresh();
        }
      }, 150);
      return () => window.clearTimeout(t);
    }, []);

    return (
      <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-14" style={{ paddingTop: "5rem", paddingBottom: "5rem" }}>
        <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <span className="eyebrow">05 / VOICES OF A BILLION HEARTS</span>
            <h2 className="display-heading">
              Loved Across <em>Generations.</em>
            </h2>
          </div>
          <p className="max-w-[46ch] text-[16px] leading-relaxed text-[#4D3F32]">
            From Mumbai monsoon chai stalls to cafés in London, New York, Dubai, and Tokyo. Discover what connoisseurs and families around the world say about the House of Parle.
          </p>
        </div>

        <div className="relative mx-auto flex h-[560px] w-full flex-row items-center justify-center gap-3 overflow-hidden bg-transparent [perspective:440px]">
          <div
            className="flex flex-row items-center gap-5"
            style={{
              transform:
                "translateX(-40px) translateY(0px) translateZ(-60px) rotateX(18deg) rotateY(-8deg) rotateZ(16deg)",
            }}
          >
            <Marquee vertical pauseOnHover repeat={3} className="[--duration:38s]">
              {PARLE_REVIEWS.map((review) => (
                <TestimonialCard key={`col1-${review.username}`} {...review} />
              ))}
            </Marquee>
            <Marquee vertical pauseOnHover reverse repeat={3} className="[--duration:42s]">
              {PARLE_REVIEWS.slice().reverse().map((review) => (
                <TestimonialCard key={`col2-${review.username}`} {...review} />
              ))}
            </Marquee>
            <Marquee vertical pauseOnHover repeat={3} className="[--duration:36s]">
              {PARLE_REVIEWS.slice(3).concat(PARLE_REVIEWS.slice(0, 3)).map((review) => (
                <TestimonialCard key={`col3-${review.username}`} {...review} />
              ))}
            </Marquee>
            <Marquee vertical pauseOnHover reverse repeat={3} className="[--duration:44s]">
              {PARLE_REVIEWS.slice(5).concat(PARLE_REVIEWS.slice(0, 5)).map((review) => (
                <TestimonialCard key={`col4-${review.username}`} {...review} />
              ))}
            </Marquee>
          </div>

          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28"
            style={{
              background: "linear-gradient(to bottom, #FFFFFF 0%, rgba(255, 255, 255, 0.8) 40%, rgba(255, 255, 255, 0) 100%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28"
            style={{
              background: "linear-gradient(to top, #FFFFFF 0%, rgba(255, 255, 255, 0.8) 40%, rgba(255, 255, 255, 0) 100%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28"
            style={{
              background: "linear-gradient(to right, #FFFFFF 0%, rgba(255, 255, 255, 0.8) 40%, rgba(255, 255, 255, 0) 100%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28"
            style={{
              background: "linear-gradient(to left, #FFFFFF 0%, rgba(255, 255, 255, 0.8) 40%, rgba(255, 255, 255, 0) 100%)",
            }}
          />
        </div>
      </div>
    );
  }

  const reviewsRootEl = document.getElementById("parle-reviews-root");
  if (reviewsRootEl) {
    const reviewsRoot = ReactDOM.createRoot(reviewsRootEl);
    reviewsRoot.render(<ParleTestimonialsSection />);
  }
})();
