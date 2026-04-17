import { ReactNode } from 'react';

export function SectionShell({ title, copy, action, children }: { title: string; copy?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="container-shell mt-16 sm:mt-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="section-title">{title}</h2>
          {copy ? <p className="section-copy">{copy}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}
