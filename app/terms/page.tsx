import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Arcade Atlas.'
};

export default function TermsPage() {
  return (
    <main className="container-shell py-12">
      <div className="card-surface max-w-4xl p-8 sm:p-10">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950">Terms of Service</h1>
        <div className="mt-8 space-y-8 text-sm leading-7 text-slate-600 sm:text-base">
          <section>
            <h2 className="text-xl font-semibold text-slate-950">Permitted use</h2>
            <p className="mt-3">Users may browse listings and follow outbound links for lawful personal or commercial discovery purposes.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-950">No guarantee of third-party content</h2>
            <p className="mt-3">External storefronts, official pages, and app platforms are controlled by their respective operators and may change without notice.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-950">Intellectual property</h2>
            <p className="mt-3">Game titles, logos, trademarks, and media remain the property of their respective owners. This directory does not claim ownership over third-party brands.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
