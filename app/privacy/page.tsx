import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Arcade Atlas',
  description:
    'Read the privacy policy for Arcade Atlas, including how we handle analytics, outbound links, and basic site usage data.',
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>

          <p className="mt-4 text-base leading-8 text-[#53627c]">
            Arcade Atlas is a game discovery website that helps users find official
            game pages, store listings, and related media. This Privacy Policy
            explains, in plain language, what information may be collected when you
            use the site.
          </p>

          <div className="mt-10 space-y-8 text-[#24314d]">
            <section>
              <h2 className="text-2xl font-semibold text-[#071133]">
                1. Information We Collect
              </h2>
              <p className="mt-3 leading-8 text-[#53627c]">
                We may collect limited technical and usage information such as page
                visits, basic analytics, and outbound click activity. This helps us
                understand which games, links, and pages are most useful to visitors.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#071133]">
                2. Outbound Link Tracking
              </h2>
              <p className="mt-3 leading-8 text-[#53627c]">
                Arcade Atlas may record when users click outbound links to official
                store pages, trailers, or other game destinations. This is used for
                site analytics, content improvements, and future product decisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#071133]">
                3. Cookies and Analytics
              </h2>
              <p className="mt-3 leading-8 text-[#53627c]">
                We may use cookies or similar technologies to improve site
                performance, remember preferences, and measure general traffic
                patterns. Over time, third-party analytics tools may also be used to
                understand site usage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#071133]">
                4. Third-Party Links
              </h2>
              <p className="mt-3 leading-8 text-[#53627c]">
                Arcade Atlas links to third-party websites such as official game
                stores, trailers, and platform pages. We are not responsible for the
                privacy practices, content, or policies of those external sites.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#071133]">
                5. Data Security
              </h2>
              <p className="mt-3 leading-8 text-[#53627c]">
                We take reasonable steps to protect site data and infrastructure, but
                no website or online service can guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#071133]">
                6. Updates
              </h2>
              <p className="mt-3 leading-8 text-[#53627c]">
                This Privacy Policy may be updated as Arcade Atlas evolves. Continued
                use of the site after updates means you accept the revised version.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#071133]">
                7. Contact
              </h2>
              <p className="mt-3 leading-8 text-[#53627c]">
                For privacy-related questions, visit the contact page and reach out
                through the information listed there.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}