/* ==========================================================================
   LIVE BROWSER MOUNT FOR SHADCN WIREFRAME-DOTTED-GLOBE (PARLE WORLDWIDE HUBS)
   ========================================================================== */

(() => {
  const { useState, useEffect, useRef } = React;

  const PARLE_WORLDWIDE_BRANCHES = [
    {
      id: "mumbai-hq",
      city: "Vile Parle, Mumbai",
      country: "India",
      role: "Global Headquarters & 130+ Indian Bakeries",
      lng: 72.8479,
      lat: 19.1006,
      isHQ: true,
      output: "1B+ Packs / Mo",
      since: "Est. 1929",
    },
    {
      id: "dubai-uae",
      city: "Dubai",
      country: "United Arab Emirates",
      role: "Middle East & GCC Logistics Hub",
      lng: 55.2708,
      lat: 25.2048,
      output: "110M+ Packs / Yr",
      since: "Est. 1975",
    },
    {
      id: "london-uk",
      city: "London",
      country: "United Kingdom",
      role: "UK & European Distribution Division",
      lng: -0.1276,
      lat: 51.5072,
      output: "42M+ Packs / Yr",
      since: "Est. 1978",
    },
    {
      id: "new-york-usa",
      city: "New York & New Jersey",
      country: "United States",
      role: "North America Flagship Division",
      lng: -74.006,
      lat: 40.7128,
      output: "85M+ Packs / Yr",
      since: "Est. 1984",
    },
    {
      id: "toronto-canada",
      city: "Toronto",
      country: "Canada",
      role: "Canadian Distribution & Retail Hub",
      lng: -79.3832,
      lat: 43.6532,
      output: "38M+ Packs / Yr",
      since: "Est. 1989",
    },
    {
      id: "sydney-australia",
      city: "Sydney",
      country: "Australia",
      role: "Oceania & Asia-Pacific Hub",
      lng: 151.2093,
      lat: -33.8688,
      output: "34M+ Packs / Yr",
      since: "Est. 1992",
    },
    {
      id: "nairobi-kenya",
      city: "Nairobi & Lagos",
      country: "East & West Africa",
      role: "African Manufacturing & Bakery Plants",
      lng: 36.8219,
      lat: -1.2921,
      output: "95M+ Packs / Yr",
      since: "Est. 1998",
    },
    {
      id: "phnom-penh",
      city: "Phnom Penh & Singapore",
      country: "Southeast Asia",
      role: "ASEAN Bakery & Export Hub",
      lng: 104.9282,
      lat: 11.5564,
      output: "60M+ Packs / Yr",
      since: "Est. 2014",
    },
    {
      id: "mexico-city",
      city: "Mexico City",
      country: "Mexico",
      role: "Latin America Manufacturing Facility",
      lng: -99.1332,
      lat: 19.4326,
      output: "50M+ Packs / Yr",
      since: "Est. 2016",
    },
  ];

  function RotatingEarth({ width = 960, height = 600, className = "", activeBranch = null }) {
    const canvasRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const targetRotationRef = useRef(null);
    const activeBranchRef = useRef(activeBranch);

    useEffect(() => {
      activeBranchRef.current = activeBranch;
      if (activeBranch && activeBranch.lng !== undefined && activeBranch.lat !== undefined) {
        targetRotationRef.current = [-activeBranch.lng, -activeBranch.lat];
      }
    }, [activeBranch]);

    useEffect(() => {
      const d3Lib = window.d3;
      if (!canvasRef.current || !d3Lib) return;

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;

      const containerWidth = Math.min(width, window.innerWidth - 40);
      const containerHeight = Math.min(height, window.innerHeight - 100);
      const radius = Math.min(containerWidth, containerHeight) / 2.25;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = containerWidth * dpr;
      canvas.height = containerHeight * dpr;
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${containerHeight}px`;
      context.scale(dpr, dpr);

      const rotation = [-72.8479, -19.1006];

      const projection = d3Lib
        .geoOrthographic()
        .scale(radius)
        .translate([containerWidth / 2, containerHeight / 2])
        .clipAngle(90)
        .rotate(rotation);

      const path = d3Lib.geoPath().projection(projection).context(context);

      const pointInPolygon = (point, polygon) => {
        const [x, y] = point;
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
          const [xi, yi] = polygon[i];
          const [xj, yj] = polygon[j];
          if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
            inside = !inside;
          }
        }
        return inside;
      };

      const pointInFeature = (point, feature) => {
        const geometry = feature.geometry;
        if (geometry.type === "Polygon") {
          const coordinates = geometry.coordinates;
          if (!pointInPolygon(point, coordinates[0])) return false;
          for (let i = 1; i < coordinates.length; i++) {
            if (pointInPolygon(point, coordinates[i])) return false;
          }
          return true;
        } else if (geometry.type === "MultiPolygon") {
          for (const polygon of geometry.coordinates) {
            if (pointInPolygon(point, polygon[0])) {
              let inHole = false;
              for (let i = 1; i < polygon.length; i++) {
                if (pointInPolygon(point, polygon[i])) {
                  inHole = true;
                  break;
                }
              }
              if (!inHole) return true;
            }
          }
          return false;
        }
        return false;
      };

      const generateDotsInPolygon = (feature, dotSpacing = 16) => {
        const dots = [];
        const bounds = d3Lib.geoBounds(feature);
        const [[minLng, minLat], [maxLng, maxLat]] = bounds;
        const stepSize = dotSpacing * 0.08;

        for (let lng = minLng; lng <= maxLng; lng += stepSize) {
          for (let lat = minLat; lat <= maxLat; lat += stepSize) {
            const point = [lng, lat];
            if (pointInFeature(point, feature)) {
              dots.push(point);
            }
          }
        }
        return dots;
      };

      const allDots = [];
      let landFeatures = null;
      let pulseTick = 0;

      const isVisibleOnHemisphere = (lng, lat) => {
        const center = [-rotation[0], -rotation[1]];
        return d3Lib.geoDistance([lng, lat], center) < Math.PI / 2 - 0.02;
      };

      const render = () => {
        pulseTick += 0.05;
        context.clearRect(0, 0, containerWidth, containerHeight);

        const currentScale = projection.scale();
        const scaleFactor = currentScale / radius;

        // Elegant soft drop shadow underneath the 3D globe sphere
        context.beginPath();
        context.ellipse(
          containerWidth / 2,
          containerHeight / 2 + currentScale * 0.96,
          currentScale * 0.72,
          currentScale * 0.08,
          0,
          0,
          2 * Math.PI
        );
        const shadowGrad = context.createRadialGradient(
          containerWidth / 2,
          containerHeight / 2 + currentScale * 0.96,
          currentScale * 0.1,
          containerWidth / 2,
          containerHeight / 2 + currentScale * 0.96,
          currentScale * 0.72
        );
        shadowGrad.addColorStop(0, "rgba(26, 19, 14, 0.14)");
        shadowGrad.addColorStop(1, "rgba(26, 19, 14, 0)");
        context.fillStyle = shadowGrad;
        context.fill();

        // 3D Sphere Body: Elegant luxury ivory / pearl gradient matching page
        const globeGrad = context.createRadialGradient(
          containerWidth / 2 - currentScale * 0.28,
          containerHeight / 2 - currentScale * 0.28,
          currentScale * 0.06,
          containerWidth / 2,
          containerHeight / 2,
          currentScale
        );
        globeGrad.addColorStop(0, "#FFFFFF");
        globeGrad.addColorStop(0.55, "#FAF6EE");
        globeGrad.addColorStop(0.88, "#F2E8D7");
        globeGrad.addColorStop(1, "#E2D3BE");

        context.beginPath();
        context.arc(containerWidth / 2, containerHeight / 2, currentScale, 0, 2 * Math.PI);
        context.fillStyle = globeGrad;
        context.fill();
        context.strokeStyle = "rgba(181, 115, 25, 0.45)";
        context.lineWidth = 1.6 * scaleFactor;
        context.stroke();

        if (landFeatures) {
          const graticule = d3Lib.geoGraticule();
          context.beginPath();
          path(graticule());
          context.strokeStyle = "rgba(181, 115, 25, 0.14)";
          context.lineWidth = 0.75 * scaleFactor;
          context.stroke();

          context.beginPath();
          landFeatures.features.forEach((feature) => {
            path(feature);
          });
          context.strokeStyle = "rgba(181, 115, 25, 0.55)";
          context.lineWidth = 1 * scaleFactor;
          context.stroke();

          allDots.forEach((dot) => {
            if (!isVisibleOnHemisphere(dot.lng, dot.lat)) return;
            const projected = projection([dot.lng, dot.lat]);
            if (
              projected &&
              projected[0] >= 0 &&
              projected[0] <= containerWidth &&
              projected[1] >= 0 &&
              projected[1] <= containerHeight
            ) {
              context.beginPath();
              context.arc(projected[0], projected[1], 1.25 * scaleFactor, 0, 2 * Math.PI);
              context.fillStyle = "#A86A18";
              context.fill();
            }
          });

          const hq = PARLE_WORLDWIDE_BRANCHES[0];
          PARLE_WORLDWIDE_BRANCHES.forEach((branch) => {
            if (branch.id === hq.id) return;
            const isSelected = activeBranchRef.current?.id === branch.id;
            const routeLine = {
              type: "LineString",
              coordinates: [
                [hq.lng, hq.lat],
                [branch.lng, branch.lat],
              ],
            };
            context.beginPath();
            path(routeLine);
            context.strokeStyle = isSelected ? "#B8292F" : "rgba(184, 41, 47, 0.45)";
            context.lineWidth = (isSelected ? 2.4 : 1.4) * scaleFactor;
            context.setLineDash([4 * scaleFactor, 4 * scaleFactor]);
            context.stroke();
            context.setLineDash([]);
          });

          PARLE_WORLDWIDE_BRANCHES.forEach((branch) => {
            if (!isVisibleOnHemisphere(branch.lng, branch.lat)) return;
            const projected = projection([branch.lng, branch.lat]);
            if (!projected) return;

            const [px, py] = projected;
            const isSelected = activeBranchRef.current?.id === branch.id;
            const baseRing = branch.isHQ || isSelected ? 14 : 8;
            const pulseRadius = baseRing * scaleFactor + Math.sin(pulseTick * 2) * 3.2;

            context.beginPath();
            context.arc(px, py, Math.max(3, pulseRadius), 0, 2 * Math.PI);
            context.fillStyle =
              branch.isHQ || isSelected
                ? "rgba(184, 41, 47, 0.35)"
                : "rgba(181, 115, 25, 0.22)";
            context.fill();

            context.beginPath();
            context.arc(px, py, (branch.isHQ || isSelected ? 5.8 : 4) * scaleFactor, 0, 2 * Math.PI);
            context.fillStyle = branch.isHQ || isSelected ? "#B8292F" : "#D48B22";
            context.fill();
            context.strokeStyle = "#FFFFFF";
            context.lineWidth = 1.6 * scaleFactor;
            context.stroke();

            context.font = `${branch.isHQ || isSelected ? "700" : "600"} ${Math.max(
              10,
              Math.round((branch.isHQ || isSelected ? 11.5 : 10) * scaleFactor)
            )}px "Plus Jakarta Sans", sans-serif`;
            context.fillStyle = branch.isHQ || isSelected ? "#B8292F" : "#1A130E";
            context.fillText(branch.city.toUpperCase(), px + 9 * scaleFactor, py + 3.5 * scaleFactor);
          });
        }
      };

      const loadWorldData = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(
            "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json"
          );
          if (!response.ok) throw new Error("Failed to load land data");

          landFeatures = await response.json();
          landFeatures.features.forEach((feature) => {
            const dots = generateDotsInPolygon(feature, 16);
            dots.forEach(([lng, lat]) => {
              allDots.push({ lng, lat, visible: true });
            });
          });

          render();
          setIsLoading(false);
        } catch (err) {
          setError("Failed to load land map data");
          setIsLoading(false);
        }
      };

      let autoRotate = true;
      const rotationSpeed = 0.28;

      const rotate = () => {
        if (targetRotationRef.current) {
          const [targetLng, targetLat] = targetRotationRef.current;
          let dLng = ((targetLng - rotation[0] + 540) % 360) - 180;
          let dLat = targetLat - rotation[1];
          rotation[0] += dLng * 0.08;
          rotation[1] += dLat * 0.08;
          projection.rotate(rotation);
          render();
          if (Math.abs(dLng) < 0.4 && Math.abs(dLat) < 0.4) {
            targetRotationRef.current = null;
          }
          return;
        }

        if (autoRotate) {
          rotation[0] += rotationSpeed;
          projection.rotate(rotation);
          render();
        } else {
          render();
        }
      };

      const rotationTimer = d3Lib.timer(rotate);

      const handleMouseDown = (event) => {
        autoRotate = false;
        targetRotationRef.current = null;
        const startX = event.clientX;
        const startY = event.clientY;
        const startRotation = [rotation[0], rotation[1]];

        const handleMouseMove = (moveEvent) => {
          const sensitivity = 0.5;
          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;

          rotation[0] = startRotation[0] + dx * sensitivity;
          rotation[1] = Math.max(-90, Math.min(90, startRotation[1] - dy * sensitivity));

          projection.rotate(rotation);
          render();
        };

        const handleMouseUp = () => {
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
          setTimeout(() => {
            autoRotate = true;
          }, 1200);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
      };

      const handleWheel = (event) => {
        event.preventDefault();
        const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1;
        const newRadius = Math.max(radius * 0.65, Math.min(radius * 2.4, projection.scale() * scaleFactor));
        projection.scale(newRadius);
        render();
      };

      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("wheel", handleWheel, { passive: false });

      loadWorldData();

      return () => {
        rotationTimer.stop();
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("wheel", handleWheel);
      };
    }, [width, height]);

    if (error) {
      return (
        <div className={`flex items-center justify-center rounded-2xl bg-[#1A130E] p-8 text-white ${className}`}>
          <div className="text-center">
            <p className="mb-2 font-semibold text-[#B8292F]">Error loading Earth visualization</p>
            <p className="text-sm text-neutral-400">{error}</p>
          </div>
        </div>
      );
    }

    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#B8292F]">
            Mapping 130+ Parle Bakeries Across 100+ Nations...
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="h-auto w-full cursor-grab bg-transparent active:cursor-grabbing"
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>
    );
  }

  function ParleWorldwideSection() {
    useEffect(() => {
      const t = window.setTimeout(() => {
        if (window.ScrollTrigger) {
          window.ScrollTrigger.refresh();
        }
      }, 150);
      return () => window.clearTimeout(t);
    }, []);

    return (
      <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-14">
        <div className="mb-12 flex flex-col justify-between gap-6 border-b border-[rgba(181,115,25,0.2)] pb-8 lg:flex-row lg:items-end">
          <div>
            <span className="eyebrow">04 / WORLDWIDE FOOTPRINT • 100+ NATIONS</span>
            <h2 className="display-heading">
              From Vile Parle to the <em>World.</em>
            </h2>
          </div>
          <p className="max-w-[48ch] text-[16px] leading-relaxed text-[#4D3F32]">
            Every month, over one billion packs of Parle-G and House of Parle confections travel from 130+ bakeries across India to over 100 nations worldwide. Drag to rotate and explore global shipping corridors.
          </p>
        </div>

        <div className="flex w-full justify-center">
          <RotatingEarth width={960} height={600} className="w-full max-w-[980px]" />
        </div>
      </div>
    );
  }

  const globeRootEl = document.getElementById("parle-globe-root");
  if (globeRootEl) {
    const globeRoot = ReactDOM.createRoot(globeRootEl);
    globeRoot.render(<ParleWorldwideSection />);
  }
})();
