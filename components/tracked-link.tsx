'use client';

import { MouseEvent } from 'react';

type TrackedLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  gameId?: string | null;
  linkId?: string | null;
  eventType?: string;
  pathname?: string;
};

export default function TrackedLink({
  href,
  children,
  className,
  gameId,
  linkId,
  eventType = 'outbound_click',
  pathname,
}: TrackedLinkProps) {
  async function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!href) return;

    try {
      await fetch('/api/track-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        keepalive: true,
        body: JSON.stringify({
          href,
          gameId,
          linkId,
          eventType,
          pathname:
            pathname ||
            (typeof window !== 'undefined' ? window.location.pathname : null),
        }),
      });
    } catch {
      // swallow tracking errors so navigation is never blocked
    }
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}