'use client';

import dynamic from 'next/dynamic';

// Load Leaflet only in the browser
const MapComponent = dynamic(() => import('./map-component'), {
  ssr: false,
  loading: () => <p>Loading map…</p>,
});

export default function MapWrapper() {
  return <MapComponent />;
}
