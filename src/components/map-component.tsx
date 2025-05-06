// "use client"

// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
// import type { LatLngExpression } from "leaflet"
// import "leaflet/dist/leaflet.css"
// import dynamic from 'next/dynamic';

// // import L from "leaflet"

// const Map = dynamic(() => import('./map-component'), {
//     ssr: false,
//     loading: () => <p>Loading map…</p>,
//   });

// export default function MapComponent() {
// //   const position: [number, number] = [34.0205, -118.2856] // USC default
//     const position: LatLngExpression = [34.0205, -118.2856]

//   return (
//     <MapContainer center={position} zoom={13} style={{ height: "500px", width: "100%" }}>
//       <TileLayer
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         attribution='© OpenStreetMap contributors'
//       />
//       <Marker position={position}>
//         <Popup>
//           You are here.
//         </Popup>
//       </Marker>
//     </MapContainer>
//   )
// }


'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapComponent() {
  const position: LatLngExpression = [34.0205, -118.2856]; // USC

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
    </MapContainer>
  );
}
