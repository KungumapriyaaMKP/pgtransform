"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"

export interface ParleBranch {
  id: string
  city: string
  country: string
  role: string
  lng: number
  lat: number
  isHQ?: boolean
  output: string
  since: string
}

export const PARLE_WORLDWIDE_BRANCHES: ParleBranch[] = [
  {
    id: "mumbai-hq",
    city: "Vile Parle, Mumbai",
    country: "India",
    role: "Global Headquarters & Founding Atelier",
    lng: 72.8479,
    lat: 19.1006,
    isHQ: true,
    output: "130+ Indian Plants",
    since: "Est. 1929",
  },
  {
    id: "london-uk",
    city: "London",
    country: "United Kingdom",
    role: "UK & European Distribution Hub",
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
    id: "dubai-uae",
    city: "Dubai",
    country: "United Arab Emirates",
    role: "Middle East & GCC Logistics Centre",
    lng: 55.2708,
    lat: 25.2048,
    output: "110M+ Packs / Yr",
    since: "Est. 1975",
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
    id: "mexico-city",
    city: "Mexico City",
    country: "Mexico",
    role: "Latin America Manufacturing Facility",
    lng: -99.1332,
    lat: 19.4326,
    output: "50M+ Packs / Yr",
    since: "Est. 2016",
  },
  {
    id: "toronto-canada",
    city: "Toronto",
    country: "Canada",
    role: "Canadian Distribution Hub",
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
    id: "phnom-penh",
    city: "Phnom Penh & Singapore",
    country: "Southeast Asia",
    role: "ASEAN Bakery & Export Hub",
    lng: 104.9282,
    lat: 11.5564,
    output: "60M+ Packs / Yr",
    since: "Est. 2014",
  },
]

interface RotatingEarthProps {
  width?: number
  height?: number
  className?: string
  branches?: ParleBranch[]
}

export default function RotatingEarth({
  width = 800,
  height = 600,
  className = "",
  branches = PARLE_WORLDWIDE_BRANCHES,
}: RotatingEarthProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    if (!context) return

    // Set up responsive dimensions
    const containerWidth = Math.min(width, window.innerWidth - 40)
    const containerHeight = Math.min(height, window.innerHeight - 100)
    const radius = Math.min(containerWidth, containerHeight) / 2.35

    const dpr = window.devicePixelRatio || 1
    canvas.width = containerWidth * dpr
    canvas.height = containerHeight * dpr
    canvas.style.width = `${containerWidth}px`
    canvas.style.height = `${containerHeight}px`
    context.scale(dpr, dpr)

    // Center initial rotation on Mumbai HQ
    const rotation: [number, number] = [-72.8, -18]

    // Create projection and path generator for Canvas
    const projection = d3
      .geoOrthographic()
      .scale(radius)
      .translate([containerWidth / 2, containerHeight / 2])
      .clipAngle(90)
      .rotate(rotation)

    const path = d3.geoPath().projection(projection).context(context)

    const pointInPolygon = (point: [number, number], polygon: number[][]): boolean => {
      const [x, y] = point
      let inside = false

      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i]
        const [xj, yj] = polygon[j]

        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
          inside = !inside
        }
      }

      return inside
    }

    const pointInFeature = (point: [number, number], feature: any): boolean => {
      const geometry = feature.geometry

      if (geometry.type === "Polygon") {
        const coordinates = geometry.coordinates
        if (!pointInPolygon(point, coordinates[0])) {
          return false
        }
        for (let i = 1; i < coordinates.length; i++) {
          if (pointInPolygon(point, coordinates[i])) {
            return false
          }
        }
        return true
      } else if (geometry.type === "MultiPolygon") {
        for (const polygon of geometry.coordinates) {
          if (pointInPolygon(point, polygon[0])) {
            let inHole = false
            for (let i = 1; i < polygon.length; i++) {
              if (pointInPolygon(point, polygon[i])) {
                inHole = true
                break
              }
            }
            if (!inHole) {
              return true
            }
          }
        }
        return false
      }

      return false
    }

    const generateDotsInPolygon = (feature: any, dotSpacing = 16) => {
      const dots: [number, number][] = []
      const bounds = d3.geoBounds(feature)
      const [[minLng, minLat], [maxLng, maxLat]] = bounds

      const stepSize = dotSpacing * 0.08

      for (let lng = minLng; lng <= maxLng; lng += stepSize) {
        for (let lat = minLat; lat <= maxLat; lat += stepSize) {
          const point: [number, number] = [lng, lat]
          if (pointInFeature(point, feature)) {
            dots.push(point)
          }
        }
      }

      return dots
    }

    interface DotData {
      lng: number
      lat: number
      visible: boolean
    }

    const allDots: DotData[] = []
    let landFeatures: any
    let pulseTick = 0

    const isVisibleOnHemisphere = (lng: number, lat: number): boolean => {
      const center: [number, number] = [-rotation[0], -rotation[1]]
      return d3.geoDistance([lng, lat], center) < Math.PI / 2 - 0.02
    }

    const render = () => {
      pulseTick += 0.045
      context.clearRect(0, 0, containerWidth, containerHeight)

      const currentScale = projection.scale()
      const scaleFactor = currentScale / radius

      // Draw ocean (globe background)
      context.beginPath()
      context.arc(containerWidth / 2, containerHeight / 2, currentScale, 0, 2 * Math.PI)
      context.fillStyle = "#0b0908"
      context.fill()
      context.strokeStyle = "rgba(216, 155, 60, 0.55)"
      context.lineWidth = 2 * scaleFactor
      context.stroke()

      if (landFeatures) {
        // Draw graticule
        const graticule = d3.geoGraticule()
        context.beginPath()
        path(graticule())
        context.strokeStyle = "rgba(255, 255, 255, 0.2)"
        context.lineWidth = 0.8 * scaleFactor
        context.stroke()

        // Draw land outlines
        context.beginPath()
        landFeatures.features.forEach((feature: any) => {
          path(feature)
        })
        context.strokeStyle = "rgba(241, 196, 123, 0.5)"
        context.lineWidth = 1 * scaleFactor
        context.stroke()

        // Draw halftone dots
        allDots.forEach((dot) => {
          const projected = projection([dot.lng, dot.lat])
          if (
            projected &&
            projected[0] >= 0 &&
            projected[0] <= containerWidth &&
            projected[1] >= 0 &&
            projected[1] <= containerHeight
          ) {
            context.beginPath()
            context.arc(projected[0], projected[1], 1.2 * scaleFactor, 0, 2 * Math.PI)
            context.fillStyle = "#a39686"
            context.fill()
          }
        })

        // Draw supply & export trade arcs from Mumbai HQ to global branches
        const hq = branches.find((b) => b.isHQ) || branches[0]
        if (hq) {
          branches.forEach((branch) => {
            if (branch.id === hq.id) return
            const routeLine: any = {
              type: "LineString",
              coordinates: [
                [hq.lng, hq.lat],
                [branch.lng, branch.lat],
              ],
            }
            context.beginPath()
            path(routeLine)
            context.strokeStyle = "rgba(216, 155, 60, 0.48)"
            context.lineWidth = 1.4 * scaleFactor
            context.setLineDash([4 * scaleFactor, 4 * scaleFactor])
            context.stroke()
            context.setLineDash([])
          })
        }

        // Draw Parle Worldwide Branch Markers & Labels
        branches.forEach((branch) => {
          if (!isVisibleOnHemisphere(branch.lng, branch.lat)) return
          const projected = projection([branch.lng, branch.lat])
          if (!projected) return

          const [px, py] = projected
          const pulseRadius = (branch.isHQ ? 14 : 9) * scaleFactor + Math.sin(pulseTick * 2) * 3

          // Pulsing halo
          context.beginPath()
          context.arc(px, py, Math.max(3, pulseRadius), 0, 2 * Math.PI)
          context.fillStyle = branch.isHQ ? "rgba(184, 41, 47, 0.35)" : "rgba(216, 155, 60, 0.28)"
          context.fill()

          // Core pin dot
          context.beginPath()
          context.arc(px, py, (branch.isHQ ? 5.5 : 4) * scaleFactor, 0, 2 * Math.PI)
          context.fillStyle = branch.isHQ ? "#B8292F" : "#F5C451"
          context.fill()
          context.strokeStyle = "#FFFFFF"
          context.lineWidth = 1.5 * scaleFactor
          context.stroke()

          // City label
          context.font = `${branch.isHQ ? "700" : "600"} ${Math.max(10, Math.round(11 * scaleFactor))}px "Space Mono", monospace`
          context.fillStyle = branch.isHQ ? "#F5C451" : "#FFFFFF"
          context.fillText(branch.city.toUpperCase(), px + 9 * scaleFactor, py + 3 * scaleFactor)
        })
      }
    }

    const loadWorldData = async () => {
      try {
        setIsLoading(true)

        const response = await fetch(
          "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json",
        )
        if (!response.ok) throw new Error("Failed to load land data")

        landFeatures = await response.json()

        landFeatures.features.forEach((feature: any) => {
          const dots = generateDotsInPolygon(feature, 16)
          dots.forEach(([lng, lat]) => {
            allDots.push({ lng, lat, visible: true })
          })
        })

        render()
        setIsLoading(false)
      } catch (err) {
        setError("Failed to load land map data")
        setIsLoading(false)
      }
    }

    let autoRotate = true
    const rotationSpeed = 0.35

    const rotate = () => {
      if (autoRotate) {
        rotation[0] += rotationSpeed
        projection.rotate(rotation)
        render()
      }
    }

    const rotationTimer = d3.timer(rotate)

    const handleMouseDown = (event: MouseEvent) => {
      autoRotate = false
      const startX = event.clientX
      const startY = event.clientY
      const startRotation: [number, number] = [rotation[0], rotation[1]]

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const sensitivity = 0.5
        const dx = moveEvent.clientX - startX
        const dy = moveEvent.clientY - startY

        rotation[0] = startRotation[0] + dx * sensitivity
        rotation[1] = Math.max(-90, Math.min(90, startRotation[1] - dy * sensitivity))

        projection.rotate(rotation)
        render()
      }

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)

        setTimeout(() => {
          autoRotate = true
        }, 10)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1
      const newRadius = Math.max(radius * 0.5, Math.min(radius * 3, projection.scale() * scaleFactor))
      projection.scale(newRadius)
      render()
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("wheel", handleWheel, { passive: false })

    loadWorldData()

    return () => {
      rotationTimer.stop()
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("wheel", handleWheel)
    }
  }, [width, height, branches])

  if (error) {
    return (
      <div className={`dark flex items-center justify-center bg-card rounded-2xl p-8 ${className}`}>
        <div className="text-center">
          <p className="dark text-destructive font-semibold mb-2">Error loading Earth visualization</p>
          <p className="dark text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center font-mono text-xs uppercase tracking-widest text-neutral-400">
          Loading Global Parle Telemetry...
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-auto rounded-2xl bg-background dark cursor-grab active:cursor-grabbing"
        style={{ maxWidth: "100%", height: "auto" }}
      />
      <div className="absolute bottom-4 left-4 text-xs text-neutral-300 px-3 py-1.5 rounded-md bg-neutral-900/90 border border-white/10 font-mono">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  )
}
