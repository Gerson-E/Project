import Image from 'next/image';
import MapWrapper from '@/components/MapWrapper';   // path may differ—adjust if needed

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 text-center">250 Projec Website</header>
      <div className="flex-grow">
        <MapWrapper />
      </div>
      <footer className="p-4 text-center">© 2025</footer>
    </div>
  );
}
