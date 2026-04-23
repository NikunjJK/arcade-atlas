import Link from 'next/link';
import { Search } from 'lucide-react';

const nav = [
  { href: '/browse', label: 'Browse' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/dmca', label: 'DMCA' }
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-400 text-sm font-semibold text-white shadow-soft">
            AA
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide text-slate-950">Arcade Atlas</div>
            <div className="text-xs text-slate-500">Official game discovery</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <form
            action="/browse"
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500"
          >
            <Search className="h-4 w-4 shrink-0" />
            <input
              type="text"
              name="q"
              placeholder="Search games"
              className="w-32 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500 lg:w-40"
            />
          </form>

          <Link
            href="/browse"
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
          >
            Explore now
          </Link>
        </div>
      </div>
    </header>
  );
}