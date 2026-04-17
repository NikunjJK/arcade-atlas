import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Arcade Atlas.'
};

export default function PrivacyPage() {
  return (
    <main className="container-shell py-12">
      <LegalPage
        title="Privacy Policy"
        sections={[
          ['Information collected', 'Arcade Atlas may collect standard analytics, basic contact form submissions, and newsletter signup data if those features are enabled later.'],
          ['Third-party destinations', 'When users click outbound links, they leave this site and become subject to the privacy policies of the destination platform.'],
          ['Cookies and analytics', 'The site can later support privacy-conscious analytics and advertising integrations. Configure consent handling before enabling them in production.']
        ]}
      />
    </main>
  );
}

function LegalPage({ title, sections }: { title: string; sections: [string, string][] }) {
  return (
    <div className="card-surface max-w-4xl p-8 sm:p-10">
      <h1 className="text-4xl font-semibold tracking-tight text-slate-950">{title}</h1>
      <div className="mt-8 space-y-8">
        {sections.map(([heading, copy]) => (
          <section key={heading}>
            <h2 className="text-xl font-semibold text-slate-950">{heading}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{copy}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
