import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'About Arcade Atlas and its official-link-only game discovery model.'
};

export default function AboutPage() {
  return (
    <main className="container-shell py-12">
      <div className="card-surface max-w-4xl p-8 sm:p-10">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950">About Arcade Atlas</h1>
        <div className="mt-6 space-y-5 text-sm leading-7 text-slate-600 sm:text-base">
          <p>
            Arcade Atlas is a curated game discovery platform built to help users browse categories, compare trusted destinations, and reach official or authorized game pages faster.
          </p>
          <p>
            This site does not exist to distribute pirated files, cracked builds, or unauthorized copies. It exists to make legitimate discovery cleaner, faster, and more trustworthy.
          </p>
          <p>
            As the catalog grows, the platform is designed to support editorial collections, search visibility, sponsored placements, and future monetization without sacrificing credibility.
          </p>
        </div>
      </div>
    </main>
  );
}
