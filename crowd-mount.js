/* ==========================================================================
   LIVE BROWSER MOUNT FOR SKIPER39 CROWD CANVAS (THE PEOPLE OF PARLE)
   ========================================================================== */

(() => {
  const {
    useEffect,
    useRef,
    useState
  } = React;
  const gsap = window.gsap;
  const CrowdCanvas = ({
    src,
    rows = 15,
    cols = 7
  }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const config = {
        src,
        rows,
        cols
      };

      // UTILS
      const randomRange = (min, max) => min + Math.random() * (max - min);
      const randomIndex = array => randomRange(0, array.length) | 0;
      const removeFromArray = (array, i) => array.splice(i, 1)[0];
      const removeItemFromArray = (array, item) => removeFromArray(array, array.indexOf(item));
      const removeRandomFromArray = array => removeFromArray(array, randomIndex(array));
      const getRandomFromArray = array => array[randomIndex(array) | 0];

      // TWEEN FACTORIES
      const resetPeep = ({
        stage,
        peep
      }) => {
        const direction = Math.random() > 0.5 ? 1 : -1;
        const offsetY = 80 - 200 * (gsap.parseEase("power2.in") ? gsap.parseEase("power2.in")(Math.random()) : Math.random());
        const startY = stage.height - peep.height + offsetY;
        let startX;
        let endX;
        if (direction === 1) {
          startX = -peep.width;
          endX = stage.width;
          peep.scaleX = 1;
        } else {
          startX = stage.width + peep.width;
          endX = -peep.width;
          peep.scaleX = -1;
        }
        peep.x = startX;
        peep.y = startY;
        peep.anchorY = startY;
        return {
          startX,
          startY,
          endX
        };
      };
      const normalWalk = ({
        peep,
        props
      }) => {
        const {
          startX,
          startY,
          endX
        } = props;
        const xDuration = 10;
        const yDuration = 0.25;
        const tl = gsap.timeline();
        tl.timeScale(randomRange(0.6, 1.4));
        tl.to(peep, {
          duration: xDuration,
          x: endX,
          ease: "none"
        }, 0);
        tl.to(peep, {
          duration: yDuration,
          repeat: Math.ceil(xDuration / yDuration),
          yoyo: true,
          y: startY - 10
        }, 0);
        return tl;
      };
      const walks = [normalWalk];

      // TYPES

      // FACTORY FUNCTIONS
      const createPeep = ({
        image,
        rect
      }) => {
        const peep = {
          image,
          rect: [],
          width: 0,
          height: 0,
          drawArgs: [],
          x: 0,
          y: 0,
          anchorY: 0,
          scaleX: 1,
          walk: null,
          setRect: rect => {
            peep.rect = rect;
            peep.width = rect[2];
            peep.height = rect[3];
            peep.drawArgs = [peep.image, ...rect, 0, 0, peep.width, peep.height];
          },
          render: ctx => {
            ctx.save();
            ctx.translate(peep.x, peep.y);
            ctx.scale(peep.scaleX, 1);
            ctx.drawImage(peep.image, peep.rect[0], peep.rect[1], peep.rect[2], peep.rect[3], 0, 0, peep.width, peep.height);
            ctx.restore();
          }
        };
        peep.setRect(rect);
        return peep;
      };

      // MAIN
      const img = new Image();
      img.crossOrigin = "anonymous";
      const stage = {
        width: 0,
        height: 0
      };
      const allPeeps = [];
      const availablePeeps = [];
      const crowd = [];
      const createPeeps = () => {
        const {
          rows,
          cols
        } = config;
        const {
          naturalWidth: width,
          naturalHeight: height
        } = img;
        const total = rows * cols;
        const rectWidth = width / rows;
        const rectHeight = height / cols;
        for (let i = 0; i < total; i++) {
          allPeeps.push(createPeep({
            image: img,
            rect: [i % rows * rectWidth, (i / rows | 0) * rectHeight, rectWidth, rectHeight]
          }));
        }
      };
      const initCrowd = () => {
        while (availablePeeps.length) {
          addPeepToCrowd().walk.progress(Math.random());
        }
      };
      const addPeepToCrowd = () => {
        const peep = removeRandomFromArray(availablePeeps);
        const walk = getRandomFromArray(walks)({
          peep,
          props: resetPeep({
            peep,
            stage
          })
        }).eventCallback("onComplete", () => {
          removePeepFromCrowd(peep);
          addPeepToCrowd();
        });
        peep.walk = walk;
        crowd.push(peep);
        crowd.sort((a, b) => a.anchorY - b.anchorY);
        return peep;
      };
      const removePeepFromCrowd = peep => {
        removeItemFromArray(crowd, peep);
        availablePeeps.push(peep);
      };
      const render = () => {
        if (!canvas) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(dpr, dpr);
        crowd.forEach(peep => {
          peep.render(ctx);
        });
        ctx.restore();
      };
      const resize = () => {
        if (!canvas) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        stage.width = canvas.clientWidth;
        stage.height = canvas.clientHeight;
        canvas.width = stage.width * dpr;
        canvas.height = stage.height * dpr;
        crowd.forEach(peep => {
          if (peep.walk) peep.walk.kill();
        });
        crowd.length = 0;
        availablePeeps.length = 0;
        availablePeeps.push(...allPeeps);
        initCrowd();
      };
      const init = () => {
        createPeeps();
        resize();
        if (gsap && gsap.ticker) {
          gsap.ticker.add(render);
        }
      };
      img.onload = init;
      img.onerror = () => {
        // Fallback to CDN if local image fails
        if (!img.src.includes("cdn.21st.dev")) {
          img.src = "https://cdn.21st.dev/assets/localized/abdb8990a7bef8c2f5af3e45f0a3c969c4b0603fba8be92e81347de4ea4e1ed7.png";
        }
      };
      img.src = config.src;
      const handleResize = () => resize();
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        if (gsap && gsap.ticker) {
          gsap.ticker.remove(render);
        }
        crowd.forEach(peep => {
          if (peep.walk) peep.walk.kill();
        });
      };
    }, [src, rows, cols]);
    return /*#__PURE__*/React.createElement("canvas", {
      ref: canvasRef,
      className: "absolute bottom-0 left-0 w-full h-full pointer-events-none",
      style: {
        width: "100%",
        height: "100%"
      }
    });
  };
  const ParleCrowdSection = () => {
    return /*#__PURE__*/React.createElement("div", {
      className: "relative w-full min-h-[580px] md:min-h-[640px] bg-white text-[#1A130E] overflow-hidden flex flex-col justify-between py-20 px-6 md:px-12",
      style: {
        width: "100%",
        minHeight: "600px",
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        paddingTop: "5rem",
        paddingBottom: "5rem"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "relative z-10 mx-auto max-w-4xl text-center flex flex-col items-center pt-4",
      style: {
        width: "100%",
        maxWidth: "860px",
        margin: "0 auto",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement("h2", {
      className: "text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-[#1A130E] leading-tight",
      style: {
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        textAlign: "center",
        margin: "0 auto",
        width: "100%",
        display: "block"
      }
    }, "Loved by every generation, across every street of India.")), /*#__PURE__*/React.createElement("div", {
      className: "absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(26,19,14,0.15)] to-transparent pointer-events-none z-10"
    }), /*#__PURE__*/React.createElement("div", {
      className: "absolute inset-x-0 bottom-0 h-[420px] sm:h-[460px] w-full overflow-hidden"
    }, /*#__PURE__*/React.createElement(CrowdCanvas, {
      src: "assets/crowd-peeps.png",
      rows: 15,
      cols: 7
    })));
  };
  const crowdRootEl = document.getElementById("parle-crowd-root");
  if (crowdRootEl) {
    const crowdRoot = ReactDOM.createRoot(crowdRootEl);
    crowdRoot.render(/*#__PURE__*/React.createElement(ParleCrowdSection, null));
  }
})();