import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Use | Arcade Atlas',
  description:
    'Read the terms of use for Arcade Atlas, including link usage, content policies, and general limitations.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <section className="mx-auto max-w-4xl px-4 py-12 md:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex text-sm font-medium text-[#5b6b86] transition hover:text-[#071133]"
        >
          ← Back to Home
        </Link>

        <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm md:p-10">
          <h1 className="text-4xl font-semibold tracking-tight text-[#071133] md:text-5xl">
            Terms of Use
          </h1>

          <p className="mt-4 text-base leading-8 text-[#53627c]">
            By using Arcade Atlas, you agree to these Terms of Use. The site is
            designed to help users discover games and reach official destinations.
          </p>

          <div className="mt-10 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-[#071133]">
                1. Site Purpose
              </h2>
              <p className="mt-3 leading-8 text-[#53627c]">
                Arcade Atlas is a discovery platform. We aim to surface game
                information, screenshots, trailers, and official outbound links.
                Availability, pricing, release dates, and external content may change
                without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#071133]">
                2. External Links
              </h2>
              <p className="mt-3 leading-8 text-[#53627c]">
                The site may link to third-party stores, app listings, media
                platforms, and publisher websites. Arcade Atlas does not control
                those external services and is not responsible for their content,
                transactions, or policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#071133]">
                3. Content Accuracy
              </h2>
              <p className="mt-3 leading-8 text-[#53627c]">
                We try to keep game information accurate and up to date, but we do
                not guarantee that every title, image, description, tag, trailer, or
                platform entry is complete or error-free.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#071133]">
                4. Acceptable Use
              </h2>
              <p className="mt-3 leading-8 text-[#53627c]">
                You agree not to misuse the site, interfere with its operation,
                attempt unauthorized access, scrape data in abusive ways, or use the
                platform for unlawful activity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#071133]">
                5. Intellectual Property
              </h2>
              <p className="mt-3 leading-8 text-[#53627c]">
                Game names, logos, screenshots, trailers, and related media may be
                owned by their respective publishers, developers, or platform
                holders. Arcade Atlas does not claim ownership over third-party game
                assets unless explicitly stated.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#071133]">
                6. Changes to the Service
              </h2>
              <p className="mt-3 leading-8 text-[#53627c]">
                Arcade Atlas may add, change, pause, or remove features at any time,
                including pages, listings, analytics, and outbound-link behavior.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#071133]">
                7. Limitation of Liability
              </h2>
              <p className="mt-3 leading-8 text-[#53627c]">
                Arcade Atlas is provided on an “as is” basis. To the maximum extent
                permitted by law, we are not liable for damages or losses resulting
                from use of the site, reliance on listings, or interaction with
                external websites.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}