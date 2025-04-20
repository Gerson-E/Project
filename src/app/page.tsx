"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MapPin, Navigation, Search, Compass, Menu, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function GPSApp() {
  const [map, setMap] = useState<any>(null)
  const [currentLocation, setCurrentLocation] = useState({ lat: 40.7128, lng: -74.006 })
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [destinations, setDestinations] = useState([
    { name: "Central Park", lat: 40.7812, lng: -73.9665 },
    { name: "Empire State Building", lat: 40.7484, lng: -73.9857 },
    { name: "Brooklyn Bridge", lat: 40.7061, lng: -73.9969 },
  ])

  useEffect(() => {
    // Load Leaflet library dynamically
    const loadLeaflet = async () => {
      if (typeof window !== "undefined" && !window.L) {
        // Add Leaflet CSS
        const linkEl = document.createElement("link")
        linkEl.rel = "stylesheet"
        linkEl.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(linkEl)

        // Add Leaflet JS
        const scriptEl = document.createElement("script")
        scriptEl.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        scriptEl.onload = initializeMap
        document.head.appendChild(scriptEl)
      } else if (window.L && !map) {
        initializeMap()
      }
    }

    const initializeMap = () => {
      const L = window.L

      // Create map instance
      const mapInstance = L.map("map").setView([currentLocation.lat, currentLocation.lng], 13)

      // Add tile layer (OpenStreetMap)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance)

      // Add current location marker
      const currentMarker = L.marker([currentLocation.lat, currentLocation.lng], {
        icon: L.divIcon({
          html: `<div class="current-location-marker"></div>`,
          className: "current-location-div",
        }),
      }).addTo(mapInstance)

      // Add destination markers
      destinations.forEach((dest) => {
        L.marker([dest.lat, dest.lng]).addTo(mapInstance).bindPopup(dest.name)
      })

      setMap(mapInstance)
      setIsMapLoaded(true)
    }

    loadLeaflet()

    return () => {
      if (map) {
        map.remove()
      }
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would call a geocoding API
    // For demo purposes, we'll just navigate to the first destination
    if (map && destinations.length > 0) {
      const destination = destinations[0]
      map.setView([destination.lat, destination.lng], 15)

      // Draw a simple route (straight line)
      if (window.L) {
        const L = window.L
        const polyline = L.polyline(
          [
            [currentLocation.lat, currentLocation.lng],
            [destination.lat, destination.lng],
          ],
          { color: "blue", weight: 3 },
        ).addTo(map)

        // Fit bounds to show the entire route
        map.fitBounds(polyline.getBounds(), { padding: [50, 50] })
      }
    }
  }

  const findMyLocation = () => {
    // In a real app, this would use the browser's geolocation API
    // For demo purposes, we'll just set a simulated "current location"
    const newLocation = {
      lat: currentLocation.lat + (Math.random() * 0.01 - 0.005),
      lng: currentLocation.lng + (Math.random() * 0.01 - 0.005),
    }

    setCurrentLocation(newLocation)

    if (map) {
      map.setView([newLocation.lat, newLocation.lng], 15)

      // Update the current location marker
      if (window.L) {
        const L = window.L
        // Clear existing markers
        map.eachLayer((layer: any) => {
          if (layer instanceof L.Marker) {
            map.removeLayer(layer)
          }
        })

        // Add updated current location marker
        L.marker([newLocation.lat, newLocation.lng], {
          icon: L.divIcon({
            html: `<div class="current-location-marker"></div>`,
            className: "current-location-div",
          }),
        }).addTo(map)

        // Re-add destination markers
        destinations.forEach((dest) => {
          L.marker([dest.lat, dest.lng]).addTo(map).bindPopup(dest.name)
        })
      }
    }
  }

  const navigateTo = (destination: { lat: number; lng: number; name: string }) => {
    if (map) {
      // Clear any existing routes
      if (window.L) {
        const L = window.L
        map.eachLayer((layer: any) => {
          if (layer instanceof L.Polyline && !(layer instanceof L.Marker)) {
            map.removeLayer(layer)
          }
        })

        // Draw a new route
        const polyline = L.polyline(
          [
            [currentLocation.lat, currentLocation.lng],
            [destination.lat, destination.lng],
          ],
          { color: "blue", weight: 3 },
        ).addTo(map)

        // Add start and end markers
        L.marker([currentLocation.lat, currentLocation.lng], {
          icon: L.divIcon({
            html: `<div class="current-location-marker"></div>`,
            className: "current-location-div",
          }),
        })
          .addTo(map)
          .bindPopup("Start")

        L.marker([destination.lat, destination.lng]).addTo(map).bindPopup(destination.name).openPopup()

        // Fit bounds to show the entire route
        map.fitBounds(polyline.getBounds(), { padding: [50, 50] })
      }
    }
  }

  const changeMapType = (type: string) => {
    if (map && window.L) {
      const L = window.L

      // Remove current tile layer
      map.eachLayer((layer: any) => {
        if (layer instanceof L.TileLayer) {
          map.removeLayer(layer)
        }
      })

      // Add new tile layer based on selected type
      if (type === "standard") {
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map)
      } else if (type === "satellite") {
        // Using a free satellite tiles provider
        L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        }).addTo(map)
      } else if (type === "terrain") {
        // Using a terrain tiles provider
        L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
          attribution:
            'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        }).addTo(map)
      }
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center gap-2">
          <Navigation className="w-6 h-6 text-blue-500" />
          <h1 className="text-xl font-bold">GPS Navigator</h1>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Input
              type="text"
              placeholder="Search location..."
              className="w-64 pr-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" size="icon" variant="ghost" className="absolute right-0">
              <Search className="w-4 h-4" />
            </Button>
          </form>

          <Button variant="outline" size="sm" onClick={findMyLocation}>
            <MapPin className="w-4 h-4 mr-2" />
            My Location
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Layers className="w-4 h-4 mr-2" />
                Map Type
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => changeMapType("standard")}>Standard</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeMapType("satellite")}>Satellite</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeMapType("terrain")}>Terrain</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className="w-6 h-6" />
        </Button>
      </header>

      {/* Mobile Menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>GPS Navigator</SheetTitle>
            <SheetDescription>Navigation options</SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <form onSubmit={handleSearch} className="relative flex items-center mb-4">
              <Input
                type="text"
                placeholder="Search location..."
                className="pr-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" size="icon" variant="ghost" className="absolute right-0">
                <Search className="w-4 h-4" />
              </Button>
            </form>

            <Button variant="outline" className="w-full mb-2" onClick={findMyLocation}>
              <MapPin className="w-4 h-4 mr-2" />
              My Location
            </Button>

            <div className="mt-4">
              <h3 className="mb-2 text-sm font-medium">Map Type</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onClick={() => changeMapType("standard")}>
                  Standard
                </Button>
                <Button variant="outline" size="sm" onClick={() => changeMapType("satellite")}>
                  Satellite
                </Button>
                <Button variant="outline" size="sm" onClick={() => changeMapType("terrain")}>
                  Terrain
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-2 text-sm font-medium">Saved Locations</h3>
              <div className="space-y-2">
                {destinations.map((dest, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      navigateTo(dest)
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    {dest.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (desktop only) */}
        <div className="hidden md:block w-80 p-4 bg-white border-r overflow-y-auto">
          <Tabs defaultValue="destinations">
            <TabsList className="w-full">
              <TabsTrigger value="destinations" className="flex-1">
                Destinations
              </TabsTrigger>
              <TabsTrigger value="routes" className="flex-1">
                Routes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="destinations" className="mt-4">
              <div className="space-y-2">
                {destinations.map((dest, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigateTo(dest)}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    {dest.name}
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="routes" className="mt-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Recent routes will appear here</div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Map Container */}
        <div className="relative flex-1">
          <div id="map" className="w-full h-full"></div>

          {/* Floating Action Buttons (Mobile) */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-2 md:hidden">
            <Button
              size="icon"
              className="rounded-full bg-white text-black shadow-lg hover:bg-gray-100"
              onClick={findMyLocation}
            >
              <MapPin className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              className="rounded-full bg-white text-black shadow-lg hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Search className="w-5 h-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" className="rounded-full bg-white text-black shadow-lg hover:bg-gray-100">
                  <Layers className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="left">
                <DropdownMenuItem onClick={() => changeMapType("standard")}>Standard</DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeMapType("satellite")}>Satellite</DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeMapType("terrain")}>Terrain</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Navigation Info Card (shows when navigating) */}
          <div className="absolute bottom-6 left-6 md:left-1/2 md:transform md:-translate-x-1/2 max-w-sm w-full">
            <Card className="shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Current Location</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                    </p>
                  </div>
                  <Compass className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CSS for the map markers */}
      <style jsx global>{`
        .current-location-marker {
          width: 16px;
          height: 16px;
          background-color: #3b82f6;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
        }
        
        #map {
          z-index: 0;
        }
        
        .leaflet-control-attribution {
          font-size: 8px;
        }
      `}</style>
    </div>
  )
}

