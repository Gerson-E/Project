// 'use client';
// import { useEffect, useState } from 'react';
// import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
// import type { LatLngExpression } from 'leaflet';
// import 'leaflet/dist/leaflet.css';

// type Loc = { lat: number; lon: number; stress: number; time: string };

// export default function MapComponent() {
//   const [locs, setLocs] = useState<Loc[]>([]);

//   const position: LatLngExpression = [34.0205, -118.2856]; // USC

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const res = await fetch('/api/locations');
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         setLocs(await res.json());
//       } catch (err) {
//         console.warn('load locations failed:', err);
//       }
//     };
//     load();                            // initial fetch
//     const id = setInterval(load, 10000);
//     return () => clearInterval(id);    // cleanup on unmount
//   }, []);

//   return (
//     <MapContainer center={position} zoom={13} style={{ height: '100vh', width: '100vw' }}>
//       <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                  attribution="© OpenStreetMap contributors" />
//       {locs.map(p => (
//         <CircleMarker
//           key={p.time}
//           center={[p.lat, p.lon]}
//           radius={4 + p.stress * 6}      // 4‑10 px depending on stress 0‑1
//           pathOptions={{ fillOpacity: 0.7, weight: 0 }}
//         />
//       ))}
//     </MapContainer>
//   );
// }


// src/components/map-component.tsx
'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type Row = { lat: number | string; lon: number | string; stress: number | null; time: string };

export default function MapComponent() {
  const [rows, setRows] = useState<Row[]>([]);
  const center: [number, number] = [34.0205, -118.2856];   // USC

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/locations', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setRows(await res.json());
      } catch (err) {
        console.warn('load locations failed:', err);
      }
    };
    load();                       // first pull
    const id = setInterval(load, 10_000);   // every 10 s
    return () => clearInterval(id);
  }, []);

  return (
    <MapContainer center={center} zoom={13} style={{ height: '100vh', width: '100vw' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                 attribution="© OpenStreetMap contributors" />
      {rows.map((r, i) => {
        const lat = Number(r.lat);
        const lon = Number(r.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;   // bad row
        const stress = r.stress ?? 0;                 // null → 0
        const hue = (1 - Math.min(stress, 1)) * 120;  // green→red
        return (
          <CircleMarker
            key={i}
            center={[lat, lon]}
            radius={6}
            pathOptions={{
              fillColor: `hsl(${hue},90%,50%)`,
              color: 'transparent',
              fillOpacity: 0.8,
            }}
          >
            <Tooltip>{`stress: ${stress}`}</Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
