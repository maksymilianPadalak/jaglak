'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 border-b-2 border-black bg-white/30 backdrop-blur">
      <nav className="max-w-6xl mx-auto flex items-center gap-3 p-4 bg-white/30">
        <Link
          href="/"
          className={`border-2 border-black px-4 py-2 font-black text-sm uppercase transition-colors ${
            isActive('/') && pathname === '/'
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-black hover:text-white'
          }`}
        >
          Home
        </Link>
        <Link
          href="/chat"
          className={`border-2 border-black px-4 py-2 font-black text-sm uppercase transition-colors ${
            isActive('/chat')
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-black hover:text-white'
          }`}
        >
          AI Chat
        </Link>
        <Link
          href="/send-email"
          className={`border-2 border-black px-4 py-2 font-black text-sm uppercase transition-colors ${
            isActive('/send-email')
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-black hover:text-white'
          }`}
        >
          Send Email
        </Link>
        <Link
          href="/audio"
          className={`border-2 border-black px-4 py-2 font-black text-sm uppercase transition-colors ${
            isActive('/audio')
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-black hover:text-white'
          }`}
        >
          Audio
        </Link>
        <Link
          href="/patients"
          className={`border-2 border-black px-4 py-2 font-black text-sm uppercase transition-colors ${
            isActive('/patients')
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-black hover:text-white'
          }`}
        >
          Patients
        </Link>
      </nav>
    </header>
  );
}

