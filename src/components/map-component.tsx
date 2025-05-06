'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

type Loc = { lat: number; lon: number; stress: number; time: string };

export default function MapComponent() {
  const [locs, setLocs] = useState<Loc[]>([]);

  const position: LatLngExpression = [34.0205, -118.2856]; // USC

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/locations');
      setLocs(await res.json());
    };
    load();
    const id = setInterval(load, 10_000);
    return () => clearInterval(id);
  }, []);

  return (
    <MapContainer center={position} zoom={13} style={{ height: '100vh', width: '100vw' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                 attribution="© OpenStreetMap contributors" />
      {locs.map(p => (
        <CircleMarker
          key={p.time}
          center={[p.lat, p.lon]}
          radius={4 + p.stress * 6}      // 4‑10 px depending on stress 0‑1
          pathOptions={{ fillOpacity: 0.7, weight: 0 }}
        />
      ))}
    </MapContainer>
  );
}
