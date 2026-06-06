'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const ADSENSE_CLIENT = 'ca-pub-1653188471819736';
const SCRIPT_ID = 'adsense-auto-ads';
const DENY_PATHS = ['/about', '/privacy', '/terms', '/disclaimer', '/contact', '/404', '/_not-found'];

type IdleWindow = Window & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
};

function isDeniedPath(pathname: string) {
  return DENY_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function appendAdSenseScript() {
  if (document.getElementById(SCRIPT_ID)) return;

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
  document.head.appendChild(script);
}

export function AdSenseAutoAds() {
  const pathname = usePathname() || '/';

  useEffect(() => {
    const existing = document.getElementById(SCRIPT_ID);
    if (isDeniedPath(pathname)) {
      existing?.remove();
      return;
    }
    if (existing) return;

    const idleWindow = window as IdleWindow;
    if (idleWindow.requestIdleCallback) {
      const idleHandle = idleWindow.requestIdleCallback(appendAdSenseScript, { timeout: 3000 });
      return () => idleWindow.cancelIdleCallback?.(idleHandle);
    }

    const timeout = window.setTimeout(appendAdSenseScript, 1500);
    return () => window.clearTimeout(timeout);
  }, [pathname]);

  return null;
}
