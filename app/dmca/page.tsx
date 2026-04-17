import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DMCA & Content Removal',
  description: 'DMCA and content removal procedures for Arcade Atlas.'
};

export default function DMCAPage() {
  return (
    <main className="container-shell py-12">
      <div className="card-surface max-w-4xl p-8 sm:p-10">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950">DMCA / Content Removal</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          Arcade Atlas respects intellectual property rights. If you are a rights holder or authorized representative and believe a listing should be corrected, removed, or updated, contact us with enough detail to verify the claim.
        </p>
        <div className="mt-8 space-y-8 text-sm leading-7 text-slate-600 sm:text-base">
          <section>
            <h2 className="text-xl font-semibold text-slate-950">What to include</h2>
            <p className="mt-3">Provide your contact details, the specific URL on this site, the reason for removal or correction, and evidence of your rights or authorization.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-950">What this site does not host</h2>
            <p className="mt-3">This platform does not intentionally host pirated copies, cracks, torrents, or unauthorized mirrors. It is built around official or authorized destinations only.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-950">Response process</h2>
            <p className="mt-3">Verified requests should be reviewed promptly and the listing can be corrected, removed, or de-indexed as needed.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
