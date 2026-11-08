/* ==========================================================================
   THE HOUSE OF PARLE | EST. 1929
   Pure White Flagship Scroll Choreography & Ultra-3D Biscuit Deconstruction
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  /* ------------------------------------------------------------------------
     1. LENIS SMOOTH INERTIAL SCROLLING
     ------------------------------------------------------------------------ */
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  /* ------------------------------------------------------------------------
     2. PRELOADER ARCHIVAL VAULT SEQUENCE (1929 -> 2026)
     ------------------------------------------------------------------------ */
  const preloader = document.getElementById('preloader');
  const preloaderYear = document.getElementById('preloader-year');
  const preloaderBar = document.getElementById('preloader-bar');

  const counterObj = { year: 1929, pct: 0 };

  const preloaderTl = gsap.timeline({
    onComplete: () => {
      initHeroReveal();
    }
  });

  preloaderTl
    .to(counterObj, {
      year: 2026,
      pct: 100,
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (preloaderYear) preloaderYear.textContent = Math.round(counterObj.year);
        if (preloaderBar) preloaderBar.style.width = `${counterObj.pct}%`;
      }
    })
    .to(preloader, {
      yPercent: -100,
      duration: 1,
      ease: 'expo.inOut',
      delay: 0.1
    });

  /* ------------------------------------------------------------------------
     3. HERO AD COMMERCIAL FILM VIDEO CONTROLLER
     ------------------------------------------------------------------------ */
  const heroVideo = document.getElementById('hero-video');
  const heroSeqFill = document.getElementById('hero-sequence-fill');

  if (heroVideo) {
    heroVideo.loop = false;

    // Autoplay video muted once on load
    const playPromise = heroVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        heroVideo.muted = true;
        heroVideo.play().catch(() => {});
      });
    }

    // Freeze / stand still on the final showcase frame once played through
    heroVideo.addEventListener('ended', () => {
      heroVideo.pause();
    });

    // Update progress hud on video timeupdate
    if (heroSeqFill) {
      heroVideo.addEventListener('timeupdate', () => {
        if (heroVideo.duration) {
          const pct = (heroVideo.currentTime / heroVideo.duration) * 100;
          heroSeqFill.style.width = `${pct.toFixed(1)}%`;
        }
      });
    }
  }

  function initHeroReveal() {
    gsap.from('#hero-3d-showcase', {
      opacity: 0,
      duration: 0.85,
      ease: 'power2.out'
    });
  }

  /* ------------------------------------------------------------------------
     4. SUBTLE GOLDEN WHEAT PARTICLE CANVAS ON WHITE
     ------------------------------------------------------------------------ */
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = Array.from({ length: 48 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2.2 + 0.8,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.4 - 0.1,
      alpha: Math.random() * 0.35 + 0.1
    }));

    function renderParticles() {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(181, 115, 25, ${p.alpha})`;
        ctx.fill();
      }
      requestAnimationFrame(renderParticles);
    }
    renderParticles();

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });
  }

  /* ------------------------------------------------------------------------
     5. PINNED SCROLL DECONSTRUCTION: SEQUENTIAL ONE-BY-ONE LAYER UNVEIL & PINPOINT
     ------------------------------------------------------------------------ */
  const anatomyPin = document.getElementById('anatomy-pin');
  const scrubFill = document.getElementById('anatomy-scrub-fill');

  const specCards = [
    document.getElementById('spec-card-1'),
    document.getElementById('spec-card-2'),
    document.getElementById('spec-card-3'),
    document.getElementById('spec-card-4')
  ];

  const pointerGroups = [
    document.getElementById('pointer-1'),
    document.getElementById('pointer-2'),
    document.getElementById('pointer-3'),
    document.getElementById('pointer-4')
  ];

  const layerBands = [
    document.getElementById('layer-band-1'),
    document.getElementById('layer-band-2'),
    document.getElementById('layer-band-3'),
    document.getElementById('layer-band-4')
  ];

  function setActiveLayerPinpoint(activeIdx) {
    specCards.forEach((card, idx) => {
      if (card) card.classList.toggle('active', idx === activeIdx);
    });
    pointerGroups.forEach((ptr, idx) => {
      if (ptr) ptr.classList.toggle('active', idx === activeIdx);
    });
    layerBands.forEach((band, idx) => {
      if (band) band.classList.toggle('active', idx === activeIdx);
    });
    const pills = document.querySelectorAll('.layer-pill');
    pills.forEach((pill, idx) => {
      pill.classList.toggle('active', idx === activeIdx);
    });
  }

  // Interactive step pills at the bottom
  const layerPills = document.querySelectorAll('.layer-pill');
  layerPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const step = parseInt(pill.getAttribute('data-step'), 10);
      setActiveLayerPinpoint(step);
    });
  });

  // Allow clicking active spec card
  specCards.forEach((card, idx) => {
    if (!card) return;
    card.addEventListener('click', () => {
      setActiveLayerPinpoint(idx);
    });
  });

  setActiveLayerPinpoint(0);

  if (anatomyPin && window.innerWidth > 1120) {
    ScrollTrigger.create({
      trigger: '#anatomy',
      start: 'top top',
      end: '+=360%',
      pin: true,
      scrub: 0.4,
      onUpdate: (self) => {
        const pct = Math.round(self.progress * 100);
        if (scrubFill) scrubFill.style.width = `${pct}%`;

        const activeIdx = Math.min(3, Math.floor(self.progress * 4));
        setActiveLayerPinpoint(activeIdx);
      }
    });
  }

  /* ------------------------------------------------------------------------
     6. HORIZONTAL SCROLL GALLERY: SIGNATURE COLLECTION
     ------------------------------------------------------------------------ */
  const horizontalSection = document.getElementById('atelier-gallery');
  const horizontalTrack = document.getElementById('horizontal-track');
  const galleryCounter = document.getElementById('gallery-counter');
  const monolithCards = gsap.utils.toArray('.product-monolith-card');

  if (horizontalSection && horizontalTrack && window.innerWidth > 1120) {
    const getScrollDistance = () => horizontalTrack.scrollWidth - window.innerWidth;

    gsap.to(horizontalTrack, {
      x: () => -getScrollDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: horizontalSection,
        start: 'top top',
        end: () => `+=${getScrollDistance()}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const total = monolithCards.length;
          const currentIdx = Math.min(total, Math.max(1, Math.ceil(self.progress * total)));
          if (galleryCounter) {
            galleryCounter.textContent = `0${currentIdx} / 0${total}`;
          }

          const activeCard = monolithCards[currentIdx - 1];
          if (activeCard && activeCard.dataset.bg) {
            horizontalSection.style.backgroundColor = activeCard.dataset.bg;
          }
        }
      }
    });
  }

  /* ------------------------------------------------------------------------
     7. 1929 ARCHIVAL TIMELINE SCROLL SPINE & AUTOPLAY VIDEO
     ------------------------------------------------------------------------ */
  const timelineSpineFill = document.getElementById('timeline-spine-fill');
  const timelineRows = gsap.utils.toArray('.timeline-row');
  const archivalVideo = document.querySelector('#archival-banner video');

  if (archivalVideo) {
    archivalVideo.muted = true;
    archivalVideo.play().catch(() => {});
  }

  if (timelineSpineFill) {
    gsap.to(timelineSpineFill, {
      height: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: '#timeline-container',
        start: 'top 65%',
        end: 'bottom 65%',
        scrub: 0.5
      }
    });
  }

  timelineRows.forEach((row) => {
    ScrollTrigger.create({
      trigger: row,
      start: 'top 72%',
      onEnter: () => row.classList.add('in-view'),
      onLeaveBack: () => row.classList.remove('in-view')
    });

    gsap.from(row.querySelector('.timeline-card'), {
      y: 45,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: row,
        start: 'top 80%'
      }
    });
  });

  /* ------------------------------------------------------------------------
     8. INTERACTIVE BRAND ARCHIVE FILTERING
     ------------------------------------------------------------------------ */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const bentoItems = document.querySelectorAll('.bento-item');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.dataset.filter;

      bentoItems.forEach((item) => {
        const match = category === 'all' || item.dataset.category === category;
        if (match) {
          item.style.display = 'flex';
          gsap.fromTo(
            item,
            { opacity: 0, y: 20, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out' }
          );
        } else {
          item.style.display = 'none';
        }
      });

      ScrollTrigger.refresh();
    });
  });

  /* ------------------------------------------------------------------------
     9. GLOBAL EMPIRE COUNTER TELEMETRY
     ------------------------------------------------------------------------ */
  const metricValues = document.querySelectorAll('.metric-value');
  metricValues.forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const counter = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(counter, {
          val: target,
          duration: 2,
          ease: 'power3.out',
          onUpdate: () => {
            el.textContent = `${Math.round(counter.val)}${suffix}`;
          }
        });
      }
    });
  });

  /* ------------------------------------------------------------------------
     10. STICKY HEADER & CUSTOM MAGNETIC CURSOR
     ------------------------------------------------------------------------ */
  const siteHeader = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  });

  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');
  const cursorLabel = document.getElementById('cursor-label');

  if (cursorDot && cursorRing) {
    window.addEventListener('mousemove', (e) => {
      gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0.1 });
      gsap.to(cursorRing, { x: e.clientX, y: e.clientY, duration: 0.28, ease: 'power2.out' });
    });

    document.querySelectorAll('[data-cursor]').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
        if (cursorLabel) cursorLabel.textContent = el.getAttribute('data-cursor');
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
      });
    });
  }

  /* ------------------------------------------------------------------------
     11. SMOOTH 360° FRONT-AND-BACK VOLUMETRIC ROTATION FOR PRODUCTS
     ------------------------------------------------------------------------ */
  const rotorEls = document.querySelectorAll('.turntable-3d-rotor');
  const rotorStates = [];

  rotorEls.forEach((rotor, idx) => {
    const visualParent = rotor.closest('.monolith-visual');
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let rotY = idx * 35;
    let rotX = 8;
    let velY = 0.65; // Continuous smooth 360° spin speed

    if (visualParent) {
      visualParent.addEventListener('pointerdown', (e) => {
        isDragging = true;
        prevX = e.clientX;
        prevY = e.clientY;
      });

      window.addEventListener('pointerup', () => {
        isDragging = false;
      });

      visualParent.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        rotY += dx * 0.65;
        rotX = Math.max(-35, Math.min(35, rotX - dy * 0.35));
        velY = dx * 0.15;
        prevX = e.clientX;
        prevY = e.clientY;
      });
    }

    rotorStates.push({
      rotor,
      idx,
      update: (time) => {
        if (!isDragging) {
          // Smoothly ease velocity back to steady 360° turntable rotation
          velY += (0.65 - velY) * 0.04;
          rotY += velY;
          rotX += (Math.sin(time * 1.4 + idx) * 10 - rotX) * 0.05;
        }
        const floatY = Math.sin(time * 1.8 + idx) * 8;
        rotor.style.transform = `translateY(${floatY}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      }
    });
  });

  function animate360Rotors() {
    const time = performance.now() * 0.001;
    rotorStates.forEach((st) => st.update(time));
    requestAnimationFrame(animate360Rotors);
  }
  animate360Rotors();
});
