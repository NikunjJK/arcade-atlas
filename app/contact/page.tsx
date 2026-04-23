import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, Shield, Briefcase } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact | Arcade Atlas',
  description:
    'Get in touch with Arcade Atlas for feedback, corrections, business inquiries, or support.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <section className="mx-auto max-w-5xl px-4 py-12 md:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex text-sm font-medium text-[#5b6b86] transition hover:text-[#071133]"
        >
          ← Back to Home
        </Link>

        <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm md:p-10">
          <h1 className="text-4xl font-semibold tracking-tight text-[#071133] md:text-5xl">
            Contact Arcade Atlas
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#53627c]">
            Use this page for corrections, feedback, business inquiries, or requests
            related to game listings and official links.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-[24px] border border-[#d8dfeb] bg-[#f8faff] p-6">
              <Mail className="h-6 w-6 text-[#071133]" />
              <h2 className="mt-4 text-xl font-semibold text-[#071133]">
                General Contact
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#53627c]">
                For general questions, site feedback, or suggestions, contact:
              </p>
              <p className="mt-4 text-sm font-medium text-[#071133]">
                contact@arcadeatlas.example
              </p>
            </div>

            <div className="rounded-[24px] border border-[#d8dfeb] bg-[#f8faff] p-6">
              <Shield className="h-6 w-6 text-[#071133]" />
              <h2 className="mt-4 text-xl font-semibold text-[#071133]">
                Content Corrections
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#53627c]">
                If a game page has a broken official link, incorrect media, or wrong
                metadata, report it here:
              </p>
              <p className="mt-4 text-sm font-medium text-[#071133]">
                corrections@arcadeatlas.example
              </p>
            </div>

            <div className="rounded-[24px] border border-[#d8dfeb] bg-[#f8faff] p-6">
              <Briefcase className="h-6 w-6 text-[#071133]" />
              <h2 className="mt-4 text-xl font-semibold text-[#071133]">
                Business Inquiries
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#53627c]">
                For partnerships, sponsorships, listings, or collaboration:
              </p>
              <p className="mt-4 text-sm font-medium text-[#071133]">
                business@arcadeatlas.example
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-[24px] border border-[#d8dfeb] bg-white p-6">
            <h2 className="text-2xl font-semibold text-[#071133]">
              Before you contact us
            </h2>
            <ul className="mt-4 space-y-3 text-[#53627c]">
              <li>• Include the game title and page URL if reporting a listing issue.</li>
              <li>• Mention the exact link or media asset that appears incorrect.</li>
              <li>• For partnership requests, include your company or project details.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}