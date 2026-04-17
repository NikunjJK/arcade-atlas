import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-200 bg-white">
      <div className="container-shell grid gap-12 py-14 md:grid-cols-[1.4fr,1fr,1fr,1fr]">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">Arcade Atlas</h3>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
            A curated game directory built around official and authorized links only. No torrents, no cracked files, no shady redirects.
          </p>
        </div>
        <FooterColumn
          title="Browse"
          links={[
            ['All categories', '/browse'],
            ['Trending', '/browse?sort=trending'],
            ['New arrivals', '/browse?sort=newest']
          ]}
        />
        <FooterColumn
          title="Company"
          links={[
            ['About', '/about'],
            ['Contact', '/contact'],
            ['DMCA', '/dmca']
          ]}
        />
        <FooterColumn
          title="Legal"
          links={[
            ['Privacy Policy', '/privacy'],
            ['Terms of Service', '/terms'],
            ['Content Removal', '/dmca']
          ]}
        />
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-950">{title}</h4>
      <ul className="mt-4 space-y-3 text-sm text-slate-600">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link className="transition hover:text-slate-950" href={href}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
