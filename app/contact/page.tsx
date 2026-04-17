import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact Arcade Atlas for partnerships, corrections, or legal concerns.'
};

export default function ContactPage() {
  return (
    <main className="container-shell py-12">
      <div className="card-surface max-w-4xl p-8 sm:p-10">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950">Contact</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Use this page for business inquiries, featured listing requests, broken-link reports, rights concerns, or general questions.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <input className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none" placeholder="Your name" />
          <input className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none" placeholder="Email address" />
          <input className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none sm:col-span-2" placeholder="Subject" />
          <textarea className="min-h-40 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none sm:col-span-2" placeholder="Message" />
        </div>
        <button className="mt-6 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Send message</button>
      </div>
    </main>
  );
}
